/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

interface PesertaSesi {
  matchName: string;
  id_pendaftaran?: number;
  batch: number;
  gateMoto1: number;
  gateMoto2: number;
  platNumber: string;
  nama: string;
  team: string;
  point1: number;
  point2: number;
  totalPoint: number;
  finishSesi1?: number | null;
  finish?: number | null;
  penaltyPoint?: number;
}

export default function Final() {
  const { id: lombaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [matchesUtama, setMatchesUtama] = useState<PesertaSesi[][]>([]);
  const [matchesSekunder, setMatchesSekunder] = useState<PesertaSesi[][]>([]);

  const [showPenalty, setShowPenalty] = useState(false);
  const [showHasil, setShowHasil] = useState(false);

  // --- state untuk nama match ---
  const [matchNames, setMatchNames] = useState<Record<string, string>>({});

  // --- handler update nama match ---
  const handleMatchNameChange = async (
    sesi: "Utama" | "Sekunder",
    matchIndex: number,
    value: string
  ) => {
    try {
      const pesertaList =
        sesi === "Utama" ? matchesUtama[matchIndex] : matchesSekunder[matchIndex];
      if (!pesertaList || pesertaList.length === 0) return;

      setMatchNames((prev) => ({
        ...prev,
        [`${sesi}-${matchIndex}`]: value,
      }));

      await Promise.all(
        pesertaList.map((p) =>
          api.post(`/lomba/${lombaId}/peserta/match/name`, {
            pesertaId: p.id_pendaftaran,
            sesi: 2, // khusus sesi 2
            matchName: value,
          })
        )
      );
    } catch (err) {
      console.error("Gagal update match name", err);
      alert("Gagal update nama match");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!lombaId) return;

        // === logika asli Anda (tidak diubah) ===
        const resPeserta = await api.get<any[]>(`/lomba/${lombaId}/peserta`);
        const pesertaData: PesertaSesi[] = resPeserta.data.map((p: any) => {
          const sesi1 = p.pointSesi?.find((s: any) => s.sesi === 1);
          const sesi2 = p.pointSesi?.find((s: any) => s.sesi === 2);
          return {
            id_pendaftaran: p.id_pendaftaran,
            batch: p.batch,
            platNumber: p.platNumber,
            nama: p.nama,
            team: p.community ?? "",
            point1: p.point1 ?? 0,
            point2: p.point2 ?? 0,
            totalPoint: (p.point1 ?? 0) + (p.point2 ?? 0),
            finishSesi1: sesi1?.finish ?? null,
            finish: sesi2?.finish ?? null,
            penaltyPoint: sesi2?.penaltyPoint ?? 0,
            gateMoto1: p.gateMoto1 ?? 0,
            gateMoto2: p.gateMoto2 ?? 0,
            matchName: sesi2?.matchName ?? null,
           kategoriSesi2: sesi2?.kategori ?? null, // "Utama" / "Sekunder"
            matchIndexSesi2: sesi2?.matchIndex ?? null,
          };
        });

        const pesertaSesi1 = resPeserta.data.map((p: any) => ({
          id_pendaftaran: p.id_pendaftaran,
          batch: p.batch,
          nama: p.nama,
          platNumber: p.platNumber,
          team: p.community ?? "",
          point1: p.point1 ?? 0,
          point2: p.point2 ?? 0,
          totalPoint: (p.point1 ?? 0) + (p.point2 ?? 0),
          finishSesi1: p.pointSesi?.find((s: any) => s.sesi === 1)?.finish ?? null,
          gateMoto1: p.gateMoto1 ?? 0,
          gateMoto2: p.gateMoto2 ?? 0,
        }));

        const batches = Array.from(new Set(pesertaSesi1.map((p) => p.batch))).sort(
          (a, b) => a - b
        );

        const utama1Flat: PesertaSesi[] = [];
        const sekunder1Flat: PesertaSesi[] = [];
        batches.forEach((batchNum) => {
          const batchPeserta = pesertaSesi1.filter((p) => p.batch === batchNum);
          batchPeserta.sort((a, b) => a.totalPoint - b.totalPoint);
          const half = Math.ceil(batchPeserta.length / 2);
          utama1Flat.push(...(batchPeserta.slice(0, half) as any));
          sekunder1Flat.push(...(batchPeserta.slice(half) as any));
        });

        const buildMatchesLikeSession1 = (arr: PesertaSesi[], batchesAll: number[]) => {
          const matches: PesertaSesi[][] = [];
          const halfBatch = Math.ceil(batchesAll.length / 2);
          for (let i = 0; i < halfBatch; i++) {
            const match: PesertaSesi[] = [];
            const batchA = arr.filter((p) => p.batch === batchesAll[i]);
            const rightIndex = i + halfBatch;
            const batchB =
              rightIndex < batchesAll.length
                ? arr.filter((p) => p.batch === batchesAll[rightIndex])
                : [];

            const maxLen = Math.max(batchA.length, batchB.length);
            for (let j = 0; j < maxLen; j++) {
              if (batchA[j]) match.push(batchA[j]);
              if (batchB[j]) match.push(batchB[j]);
            }
            matches.push(match);
          }
          return matches;
        };

        const matchesSesi1Utama = buildMatchesLikeSession1(utama1Flat, batches);
        const matchesSesi1Sekunder = buildMatchesLikeSession1(sekunder1Flat, batches);

        const idSetUtama1 = new Set(utama1Flat.map((p) => p.id_pendaftaran));
        const idSetSekunder1 = new Set(sekunder1Flat.map((p) => p.id_pendaftaran));

        const utama2Pool = pesertaData
          .filter((p) => idSetUtama1.has(p.id_pendaftaran))
          .sort((a, b) => (a.finishSesi1 ?? 999999) - (b.finishSesi1 ?? 999999));

        const sekunder2Pool = pesertaData
          .filter((p) => idSetSekunder1.has(p.id_pendaftaran))
          .sort((a, b) => (a.finishSesi1 ?? 999999) - (b.finishSesi1 ?? 999999));

        // Setelah filter utama/se­kunder dari pesertaData
        const allocateByStructure = (
          poolSorted: PesertaSesi[],
          structure: PesertaSesi[][]
        ) => {
          const result: PesertaSesi[][] = structure.map(() => []);
          let cursor = 0;

          // Urutkan pool berdasarkan finishSesi1 agar urutan awal diprioritaskan
          const sortedPool = [...poolSorted].sort((a, b) => (a.finishSesi1 ?? 9999) - (b.finishSesi1 ?? 9999));

          for (let mi = 0; mi < structure.length; mi++) {
            const size = structure[mi].length;
            result[mi] = sortedPool.slice(cursor, cursor + size);
            cursor += size;
          }
          return result;
        };


        setMatchesUtama(allocateByStructure(utama2Pool, matchesSesi1Utama));
        setMatchesSekunder(allocateByStructure(sekunder2Pool, matchesSesi1Sekunder));

        // --- inisialisasi matchNames sesuai data dari DB ---
        // --- inisialisasi matchNames sesuai data dari matchesUtama dan matchesSekunder yang sudah di-allocate ---
        const initialMatchNames: Record<string, string> = {};

        allocateByStructure(utama2Pool, matchesSesi1Utama).forEach((match, mi) => {
          const first = match.find((p) => p.matchName);
          if (first?.matchName) initialMatchNames[`Utama-${mi}`] = first.matchName;
        });

        allocateByStructure(sekunder2Pool, matchesSesi1Sekunder).forEach((match, mi) => {
          const first = match.find((p) => p.matchName);
          if (first?.matchName) initialMatchNames[`Sekunder-${mi}`] = first.matchName;
        });

        setMatchNames(initialMatchNames);


        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lombaId]);

  if (loading) return <p className="text-white">Loading...</p>;

  // === logika finish & penalty (tetap) ===
  const handleFinishChange = (
    matchType: "Utama" | "Sekunder",
    matchIndex: number,
    pesertaIndex: number,
    value: string
  ) => {
    const numberValue = value === "" ? null : Number(value);
    const updateMatches = (matches: PesertaSesi[][], setMatches: any) => {
      const newMatches = matches.map((m) => [...m.map((p) => ({ ...p }))]);
      newMatches[matchIndex][pesertaIndex].finish = numberValue;
      setMatches(newMatches);
    };
    if (matchType === "Utama") updateMatches(matchesUtama, setMatchesUtama);
    else updateMatches(matchesSekunder, setMatchesSekunder);
  };

  const handlePenaltyChange = (
    matchType: "Utama" | "Sekunder",
    matchIndex: number,
    pesertaIndex: number,
    value: string
  ) => {
    const numberValue = Number(value) || 0;
    const updateMatches = (matches: PesertaSesi[][], setMatches: any) => {
      const newMatches = matches.map((m) => [...m.map((p) => ({ ...p }))]);
      const p = newMatches[matchIndex][pesertaIndex];
      p.penaltyPoint = numberValue;
      p.totalPoint = (p.point1 ?? 0) + (p.point2 ?? 0) + numberValue;
      setMatches(newMatches);
    };
    if (matchType === "Utama") updateMatches(matchesUtama, setMatchesUtama);
    else updateMatches(matchesSekunder, setMatchesSekunder);
  };

  const handleSaveFinish = async () => {
    try {
      const pesertaList = [...matchesUtama.flat(), ...matchesSekunder.flat()]
        .filter((p) => p.finish !== null && p.finish !== undefined)
        .map((p) => ({
          pesertaId: Number(p.id_pendaftaran),
          sesi: 2,
          finish: Number(p.finish),
          penaltyPoint: p.penaltyPoint ?? 0,
        }));

      if (pesertaList.length === 0) return alert("Tidak ada data finish diisi");

      await api.post(`/lomba/${lombaId}/peserta/hasil-sesi`, { data: pesertaList });
      alert("Data finish berhasil disimpan dan diupdate");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data finish");
    }
  };

  // === render tabel dengan tambahan input matchName ===
  const renderMatchTable = (
    match: PesertaSesi[],
    matchIndex: number,
    sesi: "Utama" | "Sekunder"
  ) => (
    <div key={`${sesi}-${matchIndex}`} className="bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex items-center space-x-4 mb-2">
        <h2 className="text-xl font-semibold text-cyan-400 hidden">
          {sesi} - Match {matchIndex + 1}
        </h2>
        <input
          type="text"
          placeholder="Nama Match..."
          className="p-1 rounded text-black"
          value={matchNames[`${sesi}-${matchIndex}`] ?? ""}
          onChange={(e) =>
            setMatchNames((prev) => ({
              ...prev,
              [`${sesi}-${matchIndex}`]: e.target.value,
            }))
          }
          onBlur={(e) => handleMatchNameChange(sesi, matchIndex, e.target.value)}
        />
      </div>

      <table className="w-full border-collapse border border-gray-500 mt-2 text-white text-center">
        <thead>
          <tr>
            <th className="border p-1 w-16">Gate Start</th>
            <th className="border p-1 w-16">Finish</th>
            {showPenalty && <th className="border p-1 w-20">Penalty</th>}
            <th className="border p-1 w-20">Plat</th>
            <th className="border p-1 w-32">Nama Rider</th>
            <th className="border p-1 w-32">Team</th>
            <th className="border p-1 w-20">Total</th>
          </tr>
        </thead>
        <tbody>
          {match.map((p, idx) => (
            <tr key={p.id_pendaftaran ?? idx}>
              <td className="border p-1">{idx + 1}</td>
              <td className="border p-1">
                <input
                  type="number"
                  className="w-full text-black p-1 rounded text-center"
                  value={p.finish ?? ""}
                  onChange={(e) => handleFinishChange(sesi, matchIndex, idx, e.target.value)}
                />
              </td>
              {showPenalty && (
                <td className="border p-1">
                  <input
                    type="number"
                    className="w-full text-black p-1 rounded text-center"
                    value={p.penaltyPoint ?? 0}
                    onChange={(e) =>
                      handlePenaltyChange(sesi, matchIndex, idx, e.target.value)
                    }
                  />
                </td>
              )}
              <td className="border p-1">{p.platNumber}</td>
              <td className="border p-1">{p.nama}</td>
              <td className="border p-1">{p.team}</td>
              <td className="border p-1">{p.totalPoint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // === render hasil tetap ===
  const renderHasilTable = (matches: PesertaSesi[][], title: string) => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {matches.map((match, matchIndex) => {
        const sortedMatch = match
          .filter((p) => p.finish !== null && p.finish !== undefined)
          .sort((a, b) => a.finish! - b.finish!);

        if (sortedMatch.length === 0) return null;

        return (
          <div
            key={`${title}-match-${matchIndex}`}
            className="bg-gray-800 p-4 rounded-lg mb-6"
          >
            <h3 className="text-lg font-semibold text-cyan-400">
              {match[0]?.matchName ?? "Nama match belum diupdate"}
            </h3>
            <table className="w-full border-collapse border border-gray-500 mt-2 text-white">
              <thead>
                <tr>
                  <th className="border p-2">Gate Start</th>
                  <th className="border p-2">Finish</th>
                  <th className="border p-2">Plat Number</th>
                  <th className="border p-2">Nama Rider</th>
                  <th className="border p-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {sortedMatch.map((p, idx) => (
                  <tr key={p.id_pendaftaran ?? idx}>
                    <td className="border p-2">{idx + 1}</td>
                    <td className="border p-2">{p.finish ?? "-"}</td>
                    <td className="border p-2">{p.platNumber}</td>
                    <td className="border p-2">{p.nama}</td>
                    <td className="border p-2">{p.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Pertandingan Lanjutan
      </h1>

      <div className="flex space-x-4">
        <button
          onClick={() => setShowPenalty((prev) => !prev)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          {showPenalty ? "Sembunyikan Penalty" : "Tampilkan Penalty"}
        </button>

        {!showHasil && (
          <button
            onClick={() => setShowHasil(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
          >
            Tampilkan Hasil
          </button>
        )}

        {showHasil && (
          <button
            onClick={() => setShowHasil(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
          >
            Sembunyikan Hasil
          </button>
        )}
      </div>

      {showHasil && (
        <>
          {renderHasilTable(matchesUtama, "Hasil Kategori Utama")}
          {renderHasilTable(matchesSekunder, "Hasil Kategori Sekunder")}
        </>
      )}

      {!showHasil && (
        <>
          <h2 className="text-lg text-green-400">Kategori Utama</h2>
          {matchesUtama.map((m, idx) => renderMatchTable(m, idx, "Utama"))}
          <h2 className="text-lg text-yellow-400 mt-6">Kategori Sekunder</h2>
          {matchesSekunder.map((m, idx) => renderMatchTable(m, idx, "Sekunder"))}
        </>
      )}

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handleSaveFinish}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Simpan Finish
        </button>
        <button
          onClick={() => navigate(`/sesilanjutanlomba/${lombaId}`)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
