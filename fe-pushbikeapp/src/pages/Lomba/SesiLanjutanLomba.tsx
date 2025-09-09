/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

interface Peserta {
  pointSesi: any;
  community: any;
  gate2: number;
  gate1: number;
  id_pendaftaran?: number;
  batch: number;
  gateMoto1: number;
  gateMoto2: number;
  platNumber: string;
  nama: string;
  team: string;
  point: number;         // point dari sesi ini
  penaltyPoint?: number; // penalty khusus sesi ini
  totalPoint: number;    // hasil gabungan (digunakan sebagai rank)
  finish: number | null;
}

export default function PertandinganLanjutan() {
  const { id: lombaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matchesUtama, setMatchesUtama] = useState<Peserta[][]>([]);
  const [matchesSekunder, setMatchesSekunder] = useState<Peserta[][]>([]);
  const [loading, setLoading] = useState(true);
  const [showPenalty, setShowPenalty] = useState(false);
  const [matchNames, setMatchNames] = useState<Record<string, string>>({});

  // sementara: hardcode sesi 1
  const currentSesi = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!lombaId) return;
        const res = await api.get(`/lomba/${lombaId}/peserta`);
        console.log("API response peserta:", res.data); 

        const allPeserta: Peserta[] = (res.data ?? []).map((p: any) => {
          const sesiData = p.pointSesi?.find((s: any) => s.sesi === currentSesi) || {};

          let computedTotal = 0;
          if (p.point1 !== undefined || p.point2 !== undefined) {
            computedTotal = Number(p.point1 ?? 0) + Number(p.point2 ?? 0);
          } else if (Array.isArray(p.pointSesi) && p.pointSesi.length > 0) {
            computedTotal = p.pointSesi.reduce((acc: number, s: any) => acc + Number(s.point ?? 0), 0);
          } else {
            computedTotal = Number(sesiData.point ?? 0);
          }

          return {
            id_pendaftaran: p.id_pendaftaran,
            batch: p.batch!,
            gateMoto1: p.gate1 ?? 0,
            gateMoto2: p.gate2 ?? 0,
            platNumber: p.platNumber,
            nama: p.nama,
            team: p.community,
            point: Number(sesiData.point ?? 0),
            penaltyPoint: Number(sesiData.penalty_point ?? 0),
            totalPoint: computedTotal,
            finish: sesiData.finish ?? null,
            pointSesi: p.pointSesi ?? [],
          };
        });

        const batches = Array.from(new Set(allPeserta.map((p) => p.batch))).sort((a, b) => a - b);
        const batchCount = batches.length;

        const utama: Peserta[] = [];
        const sekunder: Peserta[] = [];

        batches.forEach((batchNum) => {
          const batchPeserta = allPeserta.filter((p) => p.batch === batchNum);
          batchPeserta.sort((a, b) => (a.totalPoint ?? 0) - (b.totalPoint ?? 0));
          const half = Math.floor(batchPeserta.length / 2);
          utama.push(...batchPeserta.slice(0, half));
          sekunder.push(...batchPeserta.slice(half));
        });

        const buatMatch = (pesertaArray: Peserta[], batchCountLocal: number) => {
          const matches: Peserta[][] = [];
          const halfBatch = Math.ceil(batchCountLocal / 2);

          for (let i = 0; i < halfBatch; i++) {
            const match: Peserta[] = [];
            const batchA = pesertaArray.filter((p) => p.batch === batches[i]);
            const batchB = pesertaArray.filter((p) =>
              batches[i + halfBatch] ? p.batch === batches[i + halfBatch] : false
            );
            const maxLen = Math.max(batchA.length, batchB.length);
            for (let j = 0; j < maxLen; j++) {
              if (batchA[j]) match.push(batchA[j]);
              if (batchB[j]) match.push(batchB[j]);
            }
            matches.push(match);
          }

          return matches;
        };

        setMatchesUtama(buatMatch(utama, batchCount));
        setMatchesSekunder(buatMatch(sekunder, batchCount));

        // isi initial matchNames dari pointSesi kalau ada
        const names: Record<string, string> = {};

        buatMatch(utama, batchCount).forEach((m, idx) => {
          const first = m[0];
          if (first) {
            const found = first.pointSesi?.find((s: any) => s.sesi === currentSesi)?.matchName;
            if (found) names[`Utama-${idx}`] = found;
          }
        });

        buatMatch(sekunder, batchCount).forEach((m, idx) => {
          const first = m[0];
          if (first) {
            const found = first.pointSesi?.find((s: any) => s.sesi === currentSesi)?.matchName;
            if (found) names[`Sekunder-${idx}`] = found;
          }
        });

        console.log("Initial matchNames dari DB:", names); 

        setMatchNames(names);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lombaId]);

  if (loading) return <p className="text-white">Loading...</p>;

  const handleFinishChange = (
    matchType: "Utama" | "Sekunder",
    matchIndex: number,
    pesertaIndex: number,
    value: string
  ) => {
    const numberValue = value === "" ? null : Number(value);
    if (matchType === "Utama") {
      const newMatches = [...matchesUtama];
      newMatches[matchIndex][pesertaIndex] = {
        ...newMatches[matchIndex][pesertaIndex],
        finish: numberValue,
      };
      setMatchesUtama(newMatches);
    } else {
      const newMatches = [...matchesSekunder];
      newMatches[matchIndex][pesertaIndex] = {
        ...newMatches[matchIndex][pesertaIndex],
        finish: numberValue,
      };
      setMatchesSekunder(newMatches);
    }
  };

  const handlePenaltyChange = (
    matchType: "Utama" | "Sekunder",
    matchIndex: number,
    pesertaIndex: number,
    value: string
  ) => {
    const numberValue = Number(value) || 0;
    if (matchType === "Utama") {
      const newMatches = [...matchesUtama];
      const p = newMatches[matchIndex][pesertaIndex];
      p.penaltyPoint = numberValue;
      if (currentSesi > 1) {
        p.totalPoint = (p.point ?? 0) + numberValue;
      } else {
        p.totalPoint = p.point ?? 0;
      }
      setMatchesUtama(newMatches);
    } else {
      const newMatches = [...matchesSekunder];
      const p = newMatches[matchIndex][pesertaIndex];
      p.penaltyPoint = numberValue;
      if (currentSesi > 1) {
        p.totalPoint = (p.point ?? 0) + numberValue;
      } else {
        p.totalPoint = p.point ?? 0;
      }
      setMatchesSekunder(newMatches);
    }
  };

  const handleSaveFinish = async () => {
    try {
      const pesertaList = [...matchesUtama.flat(), ...matchesSekunder.flat()];
      const dataToSend = pesertaList
        .filter((p) => p.finish !== undefined && p.finish !== null)
        .map((p) => ({
          pesertaId: Number(p.id_pendaftaran),
          sesi: currentSesi,
          finish: Number(p.finish),
          penaltyPoint: p.penaltyPoint ?? 0,
        }));

      if (dataToSend.length === 0) {
        alert("Tidak ada data finish yang diisi");
        return;
      }

      await api.post(`/lomba/${lombaId}/peserta/hasil-sesi`, { data: dataToSend });
      alert("Data finish berhasil disimpan dan diupdate!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data finish");
    }
  };

  const handleMatchNameChange = async (
    sesi: string,
    matchIndex: number,
    value: string
  ) => {
    try {
      const pesertaList =
        sesi === "Utama" ? matchesUtama[matchIndex] : matchesSekunder[matchIndex];
      if (!pesertaList || pesertaList.length === 0) return;

      setMatchNames((prev) => ({
        ...prev,
        [`${sesi}-${matchIndex}`]: value, // ✅ tambahkan prefix sesi
      }));

      await Promise.all(
        pesertaList.map((p) =>
          api.post(`/lomba/${lombaId}/peserta/match/name`, {
            pesertaId: p.id_pendaftaran,
            sesi: currentSesi,
            matchName: value,
          })
        )
      );
    } catch (err) {
      console.error("Gagal update match name", err);
      alert("Gagal update nama match");
    }
  };

  const renderMatchTable = (match: Peserta[], matchIndex: number, sesi: string) => (
    <div key={`${sesi}-${matchIndex}`} className="bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex items-center space-x-4 mb-2">
        <h2 className="text-xl font-semibold text-cyan-400 hidden">
          Match {matchIndex + 1} - {sesi}
        </h2>
        <input
          type="text"
          placeholder="Nama Match..."
          className="p-1 rounded text-black"
          value={matchNames[`${sesi}-${matchIndex}`] ?? ""} // ✅ pakai prefix sesi
          onChange={(e) =>
            setMatchNames((prev) => ({
              ...prev,
              [`${sesi}-${matchIndex}`]: e.target.value, // ✅ pakai prefix sesi
            }))
          }
          onBlur={(e) => handleMatchNameChange(sesi, matchIndex, e.target.value)}
        />
      </div>

      <table className="w-full border-collapse border border-gray-500 mt-2 text-white text-center">
        <thead>
          <tr>
            <th className="border p-2 w-16">Gate</th>
            <th className="border p-2 w-20">Finish</th>
            <th className="border p-2 w-20">Plat</th>
            <th className="border p-2 w-32">Nama Rider</th>
            <th className="border p-2 w-32">Team</th>
            {showPenalty && <th className="border p-2 w-24">Penalty</th>}
          </tr>
        </thead>
        <tbody>
          {match.map((p, idx) => (
            <tr key={idx}>
              <td className="border p-2 w-16">{idx + 1}</td>
              <td className="border p-2 w-20">
                <input
                  type="number"
                  className="w-full text-black p-1 rounded text-center"
                  value={p.finish ?? ""}
                  onChange={(e) =>
                    handleFinishChange(
                      sesi === "Utama" ? "Utama" : "Sekunder",
                      matchIndex,
                      idx,
                      e.target.value
                    )
                  }
                />
              </td>
              <td className="border p-2 w-20">{p.platNumber}</td>
              <td className="border p-2 w-32">{p.nama}</td>
              <td className="border p-2 w-32">{p.team}</td>
              {showPenalty && (
                <td className="border p-2 w-24">
                  <input
                    type="number"
                    className="w-full text-black p-1 rounded text-center"
                    value={p.penaltyPoint ?? 0}
                    onChange={(e) =>
                      handlePenaltyChange(
                        sesi === "Utama" ? "Utama" : "Sekunder",
                        matchIndex,
                        idx,
                        e.target.value
                      )
                    }
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Pertandingan Lanjutan </h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowPenalty(!showPenalty)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          {showPenalty ? "Sembunyikan Penalty Point" : "Tampilkan Penalty Point"}
        </button>
      </div>

      {matchesUtama.map((match, idx) => renderMatchTable(match, idx, "Utama"))}
      {matchesSekunder.map((match, idx) => renderMatchTable(match, idx, "Sekunder"))}

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handleSaveFinish}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Simpan Finish
        </button>

        <button
          onClick={() => navigate(`/admindashboard/olahdatapeserta/${lombaId}`)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Kembali
        </button>

        <button
          onClick={() => navigate(`/final/${lombaId}`)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Lanjutkan Sesi Lomba
        </button>
      </div>
    </div>
  );
}
