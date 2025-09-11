import { useState, useEffect } from "react";
import api from "@/services/api";

interface PointSesi {
  id: number;
  sesi: number;
  finish: number;
  point: number;
  pesertaIdPendaftaran: number;
}

interface Peserta {
  id_pendaftaran: number;
  nama: string;
  pointSesi?: PointSesi[];
}

interface Lomba {
  id: number;
  nama: string;
  tanggal: string;
  kategori?: string;
}

interface LombaDisplay {
  id: number;
  name: string;
  date: string;
  winner: string;
  kategori?: string;
}

export default function DashboardUser() {
  const [lombaCards, setLombaCards] = useState<LombaDisplay[]>([]);

  useEffect(() => {
    const fetchLomba = async () => {
      try {
        const res = await api.get<Lomba[]>("/lomba");
        const lombaData: LombaDisplay[] = [];

        for (const lomba of res.data) {
          const pesertaRes = await api.get<Peserta[]>(`/lomba/${lomba.id}/peserta`);
          const semuaPeserta = pesertaRes.data;

          // cari winner sesi 2 berdasarkan finish terendah
          const sesi2All = semuaPeserta
            .map((p) => ({
              peserta: p,
              finish: p.pointSesi?.find((s) => s.sesi === 2)?.finish ?? Infinity,
            }))
            .filter((p) => p.finish !== Infinity);

          let winnerName = "Belum ada";
          if (sesi2All.length > 0) {
            const winner = sesi2All.reduce((prev, curr) =>
              curr.finish < prev.finish ? curr : prev
            );
            winnerName = winner.peserta.nama;
          }

          lombaData.push({
            id: lomba.id,
            name: lomba.nama,
            date: lomba.tanggal,
            winner: winnerName,
            kategori: lomba.kategori,
          });
        }

        setLombaCards(lombaData);
      } catch (err) {
        console.error("Gagal fetch lomba:", err);
      }
    };

    fetchLomba();
  }, []);

  return (
    <div className="min-h-screen bg-[#222831] p-6 max-w-7xl mx-auto font-poppins">
      <h1 className="text-3xl font-bold text-[#EEEEEE] mb-6 text-center md:text-left">
        Selamat Datang di Push Bike Race! 🚴‍♂️
      </h1>

      <h2 className="text-xl font-semibold text-[#00ADB5] mb-4">
        Lomba Yang Sedang Berjalan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lombaCards.map((lomba) => (
          <div
            key={lomba.id}
            className="bg-[#393E46] text-[#EEEEEE] shadow-lg rounded-2xl p-6 hover:shadow-xl hover:bg-[#00ADB5] hover:text-[#222831] transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold">{lomba.name}</h3>
            <p className="text-sm">
              📅 {new Date(lomba.date).toLocaleDateString()}
            </p>
            {lomba.kategori && (
              <p className="mt-1 text-sm">
                🎯{" "}
                <span
                  className={`font-semibold ${
                    lomba.kategori === "boy"
                      ? "text-blue-400"
                      : lomba.kategori === "girl"
                      ? "text-pink-400"
                      : "text-[#00ADB5]"
                  }`}
                >
                  {lomba.kategori}
                </span>
              </p>
            )}
            <p className="font-medium mt-3">🏆 Pemenang: {lomba.winner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
