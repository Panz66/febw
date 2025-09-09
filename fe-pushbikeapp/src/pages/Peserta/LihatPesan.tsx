import { useEffect, useState } from "react";
import axios from "axios";

interface Pesan {
  id: number;
  nama: string;
  email: string;
  pesan: string;
  created_at: string;
}

export default function LihatPesan() {
  const [pesanList, setPesanList] = useState<Pesan[]>([]);

  useEffect(() => {
    const fetchPesan = async () => {
      try {
        const res = await axios.get("http://localhost:3000/pesan");
        setPesanList(res.data);
      } catch (err) {
        console.error("Gagal ambil pesan:", err);
      }
    };
    fetchPesan();
  }, []);

  return (
    <div className="min-h-screen bg-[#222831] py-16 px-6 font-poppins">
      <h1 className="text-3xl font-bold text-center mb-10 text-[#EEEEEE]">
        Daftar Pesan Masuk
      </h1>
      <div className="max-w-4xl mx-auto bg-[#393E46] rounded-xl shadow-lg p-6 text-[#EEEEEE]">
        {pesanList.length === 0 ? (
          <p className="text-center">Belum ada pesan.</p>
        ) : (
          <ul className="space-y-4">
            {pesanList.map((p) => (
              <li key={p.id} className="border border-[#00ADB5]/50 rounded-lg p-4">
                <p className="font-semibold text-[#00ADB5]">{p.nama} ({p.email})</p>
                <p className="mt-2">{p.pesan}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
