/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Peserta/KelolaPeserta.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

type Peserta = {
  id_pendaftaran: number;
  nama: string;
  kategori: string;
  platNumber: string; 
  community: string;
  id_lomba: number;
  statusPembayaran: boolean; // ✅ tambahkan
};

export default function KelolaPeserta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPeserta = async () => {
    try {
      const res = await api.get(`/lomba/${id}/peserta`);
      const semuaPeserta: Peserta[] = res.data ?? [];
      // ✅ hanya ambil peserta yang sudah bayar
      const pesertaLunas = semuaPeserta.filter((p) => p.statusPembayaran === true);
      setPesertaList(pesertaLunas);
    } catch (err) {
      console.error("Gagal fetch peserta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#222831] font-poppins px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#EEEEEE]">Kelola Peserta</h1>
        <button
          onClick={() => navigate("/admindashboard/kelolalomba")}
          className="px-4 py-2 bg-[#00ADB5] text-[#222831] font-medium rounded-lg hover:bg-[#00bfc8] transition"
        >
          Kembali
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-[#EEEEEE]/70">Loading data peserta...</p>
      ) : pesertaList.length === 0 ? (
        <p className="text-[#EEEEEE]/70">Belum ada peserta yang sudah membayar untuk lomba ini.</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Table */}
          <table className="min-w-full border border-[#EEEEEE]/20 text-[#EEEEEE] text-sm rounded-lg overflow-hidden">
            <thead className="bg-[#00ADB5] text-[#222831]">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                <th className="px-3 py-2 text-left">Plat Number</th>
                <th className="px-3 py-2 text-left">Community</th>
              </tr>
            </thead>
            <tbody>
              {pesertaList.map((p, idx) => (
                <tr
                  key={p.id_pendaftaran}
                  className="border-t border-[#EEEEEE]/20 hover:bg-[#00ADB5]/20"
                >
                  {/* ID urut mulai dari 1 */}
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{p.nama}</td>
                  <td className="px-3 py-2">{p.kategori}</td>
                  <td className="px-3 py-2">{p.platNumber}</td>
                  <td className="px-3 py-2">{p.community}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Button Olah Data */}
          {!loading && pesertaList.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(`/admindashboard/olahdatapeserta/${id}`)}
                className="px-6 py-2 bg-[#00ADB5] text-[#222831] font-medium rounded-lg hover:bg-[#00bfc8] transition"
              >
                Olah Data
              </button>
            </div>
          )}
          {/* Button Acak Peserta */}
          {!loading && pesertaList.length > 0 && (
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => navigate(`/admindashboard/acakpeserta/${id}`)}
                className="px-6 py-2 bg-green-500 text-[#222831] font-medium rounded-lg hover:bg-green-600 transition"
              >
                Acak Peserta
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
