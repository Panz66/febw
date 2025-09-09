import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

type Lomba = {
  id: number;
  nama: string;
  tanggal: string;
  kategori: "boy" | "girl";
  biaya: number;
};

export default function CheckPeserta() {
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
    <div className="p-6 max-w-5xl mx-auto bg-[#222831] min-h-screen font-poppins">
      <h1 className="text-3xl font-bold text-[#00ADB5] mb-6 text-center">
        Admin - Cek Pembayaran Peserta 🚴
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lombaList.map((lomba) => (
          <div
            key={lomba.id}
            className="bg-[#393E46] shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition"
          >
            <div>
              <h2 className="text-xl font-semibold text-[#EEEEEE]">{lomba.nama}</h2>
              <p className="text-gray-300 text-sm">
                {new Date(lomba.tanggal).toLocaleDateString()}
              </p>
              <p className="mt-1 font-semibold">
                Kategori:{" "}
                <span
                  className={
                    lomba.kategori === "boy" ? "text-blue-400" : "text-pink-400"
                  }
                >
                  {lomba.kategori}
                </span>
              </p>
              <p className="text-[#EEEEEE]/80 text-sm">
                Biaya: Rp {lomba.biaya.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => navigate(`/pesertalomba/${lomba.id}`)}
              className="mt-4 w-full bg-[#00ADB5] hover:bg-[#019ca4] text-[#EEEEEE] font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              Cek Peserta
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
