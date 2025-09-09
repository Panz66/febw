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
  point1?: number;
  point2?: number;
  batch?: number;
  penaltyPoint?: number; // kolom penalty dari DB
}

interface RowInput {
  platNumber: string;
  nama: string;
  community: string;
  point: number; 
  finish: number;
  penalty: number; // kolom penalty
}

export default function InputHasilLomba() {
  const { id, moto } = useParams<{ id: string; moto: string }>();
  const navigate = useNavigate();
  const [pesertaDb, setPesertaDb] = useState<Peserta[]>([]);
  const [batchData, setBatchData] = useState<RowInput[][]>([]);
  const [loading, setLoading] = useState(true);
  const [showPenalty, setShowPenalty] = useState(false);
  

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        const res = await api.get(`/lomba/${id}/peserta`);
        const data: Peserta[] = res.data ?? [];
        setPesertaDb(data);

        const batchesMap: Record<number, RowInput[]> = {};
        data.forEach((p) => {
          const pointValue = moto === "moto1" ? p.point1 ?? 0 : p.point2 ?? 0;
          const batchNum = p.batch || 1;
          if (!batchesMap[batchNum]) batchesMap[batchNum] = [];

          batchesMap[batchNum].push({
            platNumber: pointValue > 0 ? p.platNumber : "",
            nama: pointValue > 0 ? p.nama : "",
            community: pointValue > 0 ? p.community : "",
            point: pointValue,
            finish: 0,
            penalty: p.penaltyPoint ?? 0, // isi langsung dari DB kalau ada
          });
        });

        const orderedBatches = Object.keys(batchesMap)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => {
            const batch = batchesMap[Number(key)];
            const withPoint = batch.filter((p) => p.point > 0);
            const noPoint = batch.filter((p) => p.point === 0);

            withPoint.sort((a, b) => a.point - b.point);
            const combined = [...withPoint, ...noPoint];
            combined.forEach((p, idx) => (p.finish = idx + 1));
            return combined;
          });

        setBatchData(orderedBatches);
      } catch (err) {
        console.error("Gagal ambil peserta", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPeserta();
  }, [id, moto]);

  if (loading) return <p className="text-white">Loading...</p>;

  const handlePlatChange = (batchIndex: number, rowIndex: number, value: string) => {
    setBatchData((prev) => {
      const updated = [...prev];
      const rows = [...updated[batchIndex]];
      const found = pesertaDb.find((p) => p.platNumber === value);

      rows[rowIndex] = {
        ...rows[rowIndex],
        platNumber: value,
        nama: found?.nama || "",
        community: found?.community || "",
        point: found ? 1 : 0,
        penalty: found?.penaltyPoint ?? 0,
      };

      const withPoint = rows.filter((r) => r.point > 0);
      const noPoint = rows.filter((r) => r.point === 0);
      withPoint.sort((a, b) => a.point - b.point);
      const combined = [...withPoint, ...noPoint];
      combined.forEach((r, idx) => (r.finish = idx + 1));

      updated[batchIndex] = combined;
      return updated;
    });
  };

  const handlePenaltyChange = (batchIndex: number, rowIndex: number, value: number) => {
    setBatchData((prev) => {
      const updated = [...prev];
      const rows = [...updated[batchIndex]];
      rows[rowIndex] = { ...rows[rowIndex], penalty: value };
      updated[batchIndex] = rows;
      return updated;
    });
  };

  const handleSimpan = async () => {
    if (!id || !moto) return console.error("ID lomba atau moto tidak ditemukan!");
    try {
    const pesertaWithPoints = batchData.flatMap((batch) =>
  batch
    .filter((r) => r.platNumber)
    .map((r) => {
      const pesertaDbItem = pesertaDb.find((p) => p.platNumber === r.platNumber);
      return {
        id: pesertaDbItem?.id_pendaftaran,
        [`point${moto === "moto1" ? "1" : "2"}`]: r.finish + r.penalty,
        penaltyPoint: r.penalty,
      };
    })
);
      await api.post(`/lomba/${id}/hasil`, {
        moto,
        peserta: pesertaWithPoints,
      });

      alert("Hasil berhasil disimpan!");
    } catch (err) {
      console.error("Gagal simpan hasil", err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">
        Input Hasil Lomba {moto?.toUpperCase()}
      </h1>

      {batchData.map((rows, b) => {
        const pesertaBatchDb = pesertaDb.filter((p) => p.batch === b + 1);

        return (
          <div key={b} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tabel input */}
            <div className="overflow-x-auto bg-gray-800 p-2 rounded-lg">
              <h2 className="text-lg md:text-xl font-semibold text-yellow-400 mb-2">
                Batch {b + 1} - Input
              </h2>
              <table className="min-w-[400px] w-full border-collapse border border-gray-500 text-sm md:text-base">
                <thead>
                  <tr>
                    <th className="border p-2 w-16">Plat</th>
                    <th className="border p-2 min-w-[150px]">Nama Rider</th>
                    <th className="border p-2 min-w-[120px]">Community</th>
                    <th className="border p-2 w-16">Finish</th>
                    {showPenalty && <th className="border p-2 w-20">Penalty</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.platNumber}
                          onChange={(e) => handlePlatChange(b, i, e.target.value)}
                          className="bg-gray-700 text-white p-1 rounded w-full text-center"
                        />
                      </td>
                      <td className="border p-2 text-white">{row.nama}</td>
                      <td className="border p-2 text-white">{row.community}</td>
                      <td className="border p-2 text-white text-center">{row.finish}</td>
                      {showPenalty && (
                        <td className="border p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.penalty}
                            onChange={(e) => handlePenaltyChange(b, i, Number(e.target.value))}
                            className="bg-gray-700 text-white p-1 rounded w-full text-center"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabel referensi */}
            <div className="overflow-x-auto bg-gray-800 p-2 rounded-lg">
              <h2 className="text-lg md:text-xl font-semibold text-green-400 mb-2">
                Batch {b + 1} - Peserta (DB)
              </h2>
              <table className="min-w-[120px] w-full border-collapse border border-gray-500 text-sm md:text-base">
                <thead>
                  <tr>
                    <th className="border p-2 w-12">Plat</th>
                  </tr>
                </thead>
                <tbody>
                  {pesertaBatchDb.map((p) => (
                    <tr key={p.id_pendaftaran}>
                      <td className="border p-2 text-white text-center">{p.platNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button
          onClick={() => setShowPenalty((prev) => !prev)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          {showPenalty ? "Sembunyikan Penalty" : "Tampilkan Penalty"}
        </button>

        <button
          onClick={handleSimpan}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Simpan Hasil
        </button>

        <button
          onClick={() => navigate(`/admindashboard/olahdatapeserta/${id}`)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
