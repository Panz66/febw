// src/pages/Admin/KelolaLomba.tsx
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

interface Lomba {
  id: number;
  nama: string;
  kategori: string;
  jumlahPeserta: number;
}

export default function KelolaLomba() {
  const [lombaList, setLombaList] = useState<Lomba[]>([]);
  const navigate = useNavigate();

  const fetchLomba = async () => {
    try {
      const res = await api.get("/lomba");
      setLombaList(res.data || []);
    } catch (err) {
      console.error("Gagal fetch lomba:", err);
    }
  };

  useEffect(() => {
    fetchLomba();
  }, []);

  return (
    <div className="min-h-screen bg-[#222831] font-poppins px-6 py-12">
      <h1 className="text-2xl font-bold mb-6 text-[#EEEEEE]">Kelola Data Lomba</h1>

      {lombaList.length === 0 ? (
        <p className="text-[#EEEEEE]/70">Belum ada lomba yang dibuat.</p>
      ) : (
        <div className="space-y-4">
          {lombaList.map((lomba) => (
            <div
              key={lomba.id}
              className="bg-[#393E46] p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#00ADB5]">{lomba.nama}</h2>
                <p className="text-[#EEEEEE]/70 text-sm">Kategori: {lomba.kategori}</p>
                <p className="text-[#EEEEEE]/70 text-sm">Jumlah Peserta: {lomba.jumlahPeserta}</p>
              </div>
              <button
                onClick={() => navigate(`/admindashboard/kelolapeserta/${lomba.id}`)}
                className="px-4 py-2 bg-[#00ADB5] text-[#222831] font-medium rounded-lg hover:bg-[#00bfc8] transition"
              >
                Kelola
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
