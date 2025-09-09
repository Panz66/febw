// src/pages/Admin/DaftarPeserta.tsx
import { useEffect, useState } from "react";
import api from "@/services/api";

type Peserta = {
  id_pendaftaran: number;
  nama: string;
  kategori: string;
  platNumber: string;
  community: string;
  id_lomba: number;
  statusPembayaran: boolean;  // 👈 tambahkan
};

type Lomba = {
  id: number;
  nama: string;
};

export default function DaftarPeserta() {
  const [lombaList, setLombaList] = useState<Lomba[]>([]);
  const [pesertaByLomba, setPesertaByLomba] = useState<Record<number, Peserta[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedLomba, setExpandedLomba] = useState<number | null>(null); // id lomba yang terbuka

  const fetchData = async () => {
    try {
      setLoading(true);

      // Ambil semua lomba
      const lombaRes = await api.get("/lomba");
      const lombaData: Lomba[] = lombaRes.data ?? [];
      setLombaList(lombaData);

      // Ambil peserta per lomba
      const grouped: Record<number, Peserta[]> = {};
     // fetchData di DaftarPeserta.tsx
      for (const lomba of lombaData) {
        const pesertaRes = await api.get(`/lomba/${lomba.id}/peserta`);
        const pesertaData = pesertaRes.data ?? [];

        // 🔥 hanya ambil yang sudah bayar
        grouped[lomba.id] = pesertaData.filter((p: Peserta & { statusPembayaran: boolean }) => p.statusPembayaran);
      }


      setPesertaByLomba(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#222831] text-[#EEEEEE] flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }

  const toggleLomba = (id: number) => {
    setExpandedLomba((prev) => (prev === id ? null : id));
  };

  return (
  <div className="min-h-screen bg-[#222831] font-poppins px-4 py-8">
    <h1 className="text-2xl font-bold mb-4 text-[#EEEEEE]">Daftar Peserta per Lomba</h1>

    {lombaList.length === 0 ? (
      <p className="text-[#EEEEEE]/70">Belum ada lomba yang dibuat.</p>
    ) : (
      <div className="space-y-4">
        {lombaList.map((lomba) => (
          <div
            key={lomba.id}
            className="bg-[#393E46] p-4 rounded-lg shadow cursor-pointer"
            onClick={() => toggleLomba(lomba.id)}
          >
            <h2 className="text-lg font-semibold flex justify-between items-center text-[#00ADB5]">
              {lomba.nama}
              <span className="text-xs text-[#EEEEEE]/70">
                {expandedLomba === lomba.id ? "▲ Tutup" : "▼ Lihat Peserta"}
              </span>
            </h2>

            {expandedLomba === lomba.id && (
              <div className="mt-3 overflow-x-auto transition-all duration-300">
                {pesertaByLomba[lomba.id] && pesertaByLomba[lomba.id].length > 0 ? (
                  <table className="min-w-full border border-[#EEEEEE]/20 text-[#EEEEEE] text-sm">
                    <thead className="bg-[#00ADB5] text-[#222831]">
                      <tr>
                        <th className="px-2 py-1 text-left">ID</th>
                        <th className="px-2 py-1 text-left">Nama</th>
                        <th className="px-2 py-1 text-left">Kategori</th>
                        <th className="px-2 py-1 text-left">Plat Number</th>
                        <th className="px-2 py-1 text-left">Community</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pesertaByLomba[lomba.id].map((peserta, index) => (
                        <tr
                          key={peserta.id_pendaftaran}
                          className="border-t border-[#EEEEEE]/20 hover:bg-[#00ADB5]/20"
                        >
                          <td className="px-2 py-1">{index +1}</td>
                          <td className="px-2 py-1">{peserta.nama}</td>
                          <td className="px-2 py-1">{peserta.kategori}</td>
                          <td className="px-2 py-1">{peserta.platNumber}</td>
                          <td className="px-2 py-1">{peserta.community}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[#EEEEEE]/70 text-sm">
                    Belum ada peserta untuk lomba ini.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
}
