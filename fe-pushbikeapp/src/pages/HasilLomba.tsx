import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

type Kategori = "boy" | "girl";

type LombaType = {
  id: number;
  nama: string;
  tanggal: string;
  deskripsi?: string;
  jumlahPeserta: number;
  biaya: number;
  kategori: Kategori;
};

type PesertaType = {
  id_pendaftaran: number;
  point1: number;
  point2: number;
};

export default function ListHasil() {
  const navigate = useNavigate();
  const [lombaList, setLombaList] = useState<LombaType[]>([]);
  const [lombaStatus, setLombaStatus] = useState<Record<number, boolean>>({}); 
  // record lombaId => true if can click

  const fetchLomba = async () => {
    try {
      const res = await api.get<LombaType[]>("/lomba");
      setLombaList(res.data || []);

      // Cek peserta per lomba
      const status: Record<number, boolean> = {};
      await Promise.all(
        (res.data || []).map(async (lomba) => {
          try {
            const pesertaRes = await api.get<PesertaType[]>(`/lomba/${lomba.id}/peserta`);
            const canClick = pesertaRes.data.some(
              (p) => (p.point1 || 0) > 0 || (p.point2 || 0) > 0
            );
            status[lomba.id] = canClick;
          } catch (err) {
            console.error("Gagal fetch peserta:", err);
            status[lomba.id] = false;
          }
        })
      );

      setLombaStatus(status);

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
        Pilih Lomba untuk Melihat Hasil 🚴
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lombaList.map((lomba) => (
          <div
            key={lomba.id}
            className="bg-[#393E46] shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition"
          >
            <div>
              <h2 className="text-xl font-semibold text-[#EEEEEE]">
                {lomba.nama}
              </h2>
              <p className="text-gray-300 text-sm">
                {new Date(lomba.tanggal).toLocaleDateString()}
              </p>
              {lomba.kategori && (
                <p className="mt-1 font-semibold">
                  Kategori:{" "}
                  <span
                    className={
                      lomba.kategori === "boy"
                        ? "text-blue-400"
                        : "text-pink-400"
                    }
                  >
                    {lomba.kategori}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(`/livehasil/${lomba.id}`)}
              disabled={!lombaStatus[lomba.id]} // disable jika tidak ada poin
              className={`mt-4 w-full text-[#EEEEEE] font-semibold px-4 py-2 rounded-lg shadow transition ${
                lombaStatus[lomba.id]
                  ? "bg-[#00ADB5] hover:bg-[#019ca4]"
                  : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              {lombaStatus[lomba.id] ? "Lihat Hasil" : "Lomba Belum Berjalan"}
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
