/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

interface Peserta {
  id_pendaftaran: number;
  nama: string;
  kategori: string;
  platNumber: string;
  community: string;
  id_lomba: number;
  batch?: number;
  point1?: number;
  point2?: number;
  totalPoint?: number;
  rank?: number;
  gate1?: number;
  gate2?: number | null;
  localId?: number;
}

interface Lomba {
  id: number;
  nama: string;
  tanggal: string;
  jumlahPeserta: number;
  biaya: number;
  kategori: string;
  jumlahBatch: number;
}

export default function OlahDataPeserta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [batchPeserta, setBatchPeserta] = useState<Peserta[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setJumlahBatch] = useState<number>(1);

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        if (!id) return;

        // Ambil data lomba untuk jumlahBatch
        const lombaRes = await api.get<Lomba>(`/lomba/${id}`);
        setJumlahBatch(lombaRes.data.jumlahBatch || 1);

        // Ambil peserta
        const res = await api.get<Peserta[]>(`/lomba/${id}/peserta`);
        const data: Peserta[] = (res.data ?? []).map((p: any) => ({
          id_pendaftaran: p.id_pendaftaran,
          nama: p.nama,
          kategori: p.kategori,
          platNumber: p.platNumber,
          community: p.community,
          id_lomba: p.lomba?.id ?? p.id_lomba,
          point1: p.point1 ?? 0,
          point2: p.point2 ?? 0,
          batch: p.batch,
          totalPoint: (p.point1 ?? 0) + (p.point2 ?? 0),
        }));

        setPeserta(data);

        // Hitung batch size
        const batchSize = Math.ceil(data.length / (lombaRes.data.jumlahBatch || 1));

        // Siapkan batch kosong
        const emptyBatches: Peserta[][] = Array.from({ length: lombaRes.data.jumlahBatch }, (_, idx) =>
          Array.from({ length: batchSize }, () => ({
            id_pendaftaran: 0,
            nama: "",
            kategori: "",
            platNumber: "",
            community: "",
            id_lomba: Number(id),
            batch: idx + 1,
            point1: 0,
            point2: 0,
            totalPoint: 0,
          }))
        );

        // Masukkan peserta ke batch sesuai DB
        data.forEach((p) => {
          if (p.batch) {
            const batchIdx = p.batch - 1;
            const emptySlot = emptyBatches[batchIdx].findIndex(slot => slot.id_pendaftaran === 0);
            if (emptySlot !== -1) {
              emptyBatches[batchIdx][emptySlot] = p;
            }
          }
        });

        setBatchPeserta(emptyBatches);
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data peserta");
      } finally {
        setLoading(false);
      }
    };

    fetchPeserta();
  }, [id]);

  // Generate gates untuk setiap batch
  const generateGates = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const gate1 = i + 1;
      const gate2 = n > 1 ? ((i + n / 2) % n) + 1 : null;
      return { gate1, gate2 };
    });

  // Ranking peserta
  const rankPeserta = (list: Peserta[]) => {
    const gates = generateGates(list.length);

    const withGate = list.map((p, i) => ({
      ...p,
      localId: i + 1,
      gate1: gates[i].gate1,
      gate2: gates[i].gate2 !== null ? Math.floor(gates[i].gate2) : null,
    }));

    const withTotal = withGate.map((p) => ({
      ...p,
      totalPoint: (p.point1 ?? 0) + (p.point2 ?? 0),
    }));

    const sorted = [...withTotal].sort((a, b) => a.totalPoint! - b.totalPoint!);

    return withTotal.map((p) => ({
      ...p,
      rank: sorted.findIndex((s) => s.localId === p.localId) + 1,
    }));
  };

  const handlePlatChange = (batchIdx: number, localIdx: number, value: string) => {
    setBatchPeserta((prev) => {
      const updated = [...prev];
      const batch = [...updated[batchIdx]];

      const found = peserta.find((ps) => ps.platNumber === value);

      batch[localIdx] = {
        ...batch[localIdx],
        id_pendaftaran: found ? found.id_pendaftaran : 0,
        platNumber: value,
        nama: found ? found.nama : "",
        community: found ? found.community : "",
        point1: found ? found.point1 ?? 0 : 0,
        point2: found ? found.point2 ?? 0 : 0,
        totalPoint: found ? (found.point1 ?? 0) + (found.point2 ?? 0) : 0,
      };

      updated[batchIdx] = batch;
      return updated;
    });
  };

  const handleSimpan = async () => {
    try {
      for (let i = 0; i < batchPeserta.length; i++) {
        // Ambil hanya id peserta valid
        const pesertaIds = batchPeserta[i]
          .filter(p => p.id_pendaftaran !== 0)
          .map(p => p.id_pendaftaran);

        if (pesertaIds.length > 0) {
          await api.post(`/lomba/${id}/peserta/batch`, {
            batch: i + 1,
            pesertaIds,
          });
        }
      }
      alert("Semua batch berhasil disimpan!");
    } catch (err: any) {
      console.error(err.response?.data || err);
      alert("Gagal menyimpan data batch!");
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-white">Olah Data Pertandingan</h1>

      {batchPeserta.map((batch, i) => {
        const batchRanked = rankPeserta(batch);
        return (
          <div key={i} className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-cyan-400">Batch {i + 1}</h2>
            <table className="w-full border-collapse border border-gray-500 mt-2 text-center text-white">
              <thead>
                <tr>
                  <th className="border p-1 w-16">Gate 1</th>
                  <th className="border p-1 w-16">Gate 2</th>
                  <th className="border p-1 w-20">Plat</th>
                  <th className="border p-1 w-32">Nama</th>
                  <th className="border p-1 w-32">Community</th>
                  <th className="border p-1 w-16">Point1</th>
                  <th className="border p-1 w-16">Point2</th>
                  <th className="border p-1 w-20">Total</th>
                  <th className="border p-1 w-16">Rank</th>
                </tr>
              </thead>
              <tbody>
                {batchRanked.map((p, idx) => (
                  <tr key={idx}>
                    <td className="border p-1">{p.gate1}</td>
                    <td className="border p-1">{p.gate2}</td>
                    <td className="border p-1">
                      <input
                        type="text"
                        value={p.platNumber}
                        onChange={(e) => handlePlatChange(i, idx, e.target.value)}
                        className="bg-gray-700 text-white p-1 rounded w-full text-center"
                      />
                    </td>
                    <td className="border p-1">{p.nama}</td>
                    <td className="border p-1">{p.community}</td>
                    <td className="border p-1">{p.point1}</td>
                    <td className="border p-1">{p.point2}</td>
                    <td className="border p-1">{p.totalPoint}</td>
                    <td className="border p-1">{p.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        );
      })}

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handleSimpan}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Simpan Data Batch
        </button>
        <button
          onClick={() => navigate(`/inputhasillomba/moto1/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Input Hasil Lomba Moto 1
        </button>
        <button
          onClick={() => navigate(`/inputhasillomba/moto2/${id}`)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Input Hasil Lomba Moto 2
        </button>
        <button
          onClick={() => navigate(`/sesilanjutanlomba/${id}`)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Lanjutkan Sesi Lomba
        </button>
      </div>
    </div>
  );
}
