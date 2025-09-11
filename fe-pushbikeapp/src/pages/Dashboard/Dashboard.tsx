import { useState, useEffect } from "react";
import api from "@/services/api";

interface PointSesi {
  id: number;
  sesi: number;
  finish: number;
  point: number;
  pesertaIdPendaftaran: number;
  matchName?: string; // penting karena kita mau kelompokkan per match
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
  winners: string[]; // ubah ke array karena banyak match
  image: string;
  kategori?: string;
}

export default function DashboardUser() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lombaCards, setLombaCards] = useState<LombaDisplay[]>([]);
  const [slides, setSlides] = useState<LombaDisplay[]>([]);

  useEffect(() => {
    const fetchLomba = async () => {
      try {
        const res = await api.get<Lomba[]>("/lomba");
        const lombaData: LombaDisplay[] = [];

        for (const lomba of res.data) {
          const pesertaRes = await api.get<Peserta[]>(`/lomba/${lomba.id}/peserta`);
          const semuaPeserta = pesertaRes.data;

          // Ambil sesi 2, grup berdasarkan matchName
          const sesi2All = semuaPeserta
            .map((p) => {
              const sesi2 = p.pointSesi?.find((s) => s.sesi === 2);
              return sesi2
                ? {
                    peserta: p,
                    finish: sesi2.finish,
                    matchName: sesi2.matchName ?? "Unknown Match",
                  }
                : null;
            })
            .filter((x) => x !== null) as {
            peserta: Peserta;
            finish: number;
            matchName: string;
          }[];

          // Kelompokkan per matchName
          const winnersPerMatch: string[] = [];
          const matchGroups: Record<string, { peserta: Peserta; finish: number }[]> = {};

          sesi2All.forEach((entry) => {
            if (!matchGroups[entry.matchName]) matchGroups[entry.matchName] = [];
            matchGroups[entry.matchName].push({ peserta: entry.peserta, finish: entry.finish });
          });

          // Cari finish terendah di setiap match
          Object.entries(matchGroups).forEach(([matchName, pesertaList]) => {
            const winner = pesertaList.reduce((prev, curr) =>
              curr.finish < prev.finish ? curr : prev
            );
            winnersPerMatch.push(`${matchName}: ${winner.peserta.nama}`);
          });

          lombaData.push({
            id: lomba.id,
            name: lomba.nama,
            date: lomba.tanggal,
            winners: winnersPerMatch.length > 0 ? winnersPerMatch : ["Belum ada"],
            image: `https://picsum.photos/300/150?random=${lomba.id}`,
            kategori: lomba.kategori,
          });
        }

        setLombaCards(lombaData);
        setSlides(lombaData.slice(-3));
      } catch (err) {
        console.error("Gagal fetch lomba:", err);
      }
    };

    fetchLomba();
  }, []);

  // carousel otomatis tiap 3 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  const nextSlide = () => setCarouselIndex((carouselIndex + 1) % slides.length);
  const prevSlide = () => setCarouselIndex((carouselIndex - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-[#222831] p-6 max-w-7xl mx-auto font-poppins">
      <h1 className="text-3xl font-bold text-[#EEEEEE] mb-6 text-center md:text-left">
        Selamat Datang di Push Bike Race! 🚴‍♂️
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-[#00ADB5] mb-2">
            Lomba Yang Sedang Berjalan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lombaCards.map((lomba) => (
              <div
                key={lomba.id}
                className="bg-[#393E46] text-[#EEEEEE] shadow rounded-lg p-4 hover:bg-[#00ADB5] hover:text-[#222831] transition cursor-pointer"
              >
                <h3 className="text-lg font-semibold">{lomba.name}</h3>
                <p className="text-sm">
                  Tanggal: {new Date(lomba.date).toLocaleDateString()}
                </p>
                {lomba.kategori && (
                  <p className="text-[#EEEEEE]/80 mt-1">
                    Kategori:{" "}
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
                <p className="font-medium mt-2">
                  Pemenang:
                  <ul className="list-disc list-inside mt-1">
                    {lomba.winners.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {slides.length > 0 && (
            <div className="bg-[#393E46] text-[#EEEEEE] shadow rounded-lg overflow-hidden relative">
              <img
                src={slides[carouselIndex].image}
                alt={slides[carouselIndex].name}
                className="w-full h-36 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-[#00ADB5]">
                  {slides[carouselIndex].name}
                </h3>
                <p className="text-sm">Pemenang:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  {slides[carouselIndex].winners.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Tombol navigasi */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-[#00ADB5]/70 text-[#222831] px-2 py-1 rounded-full shadow hover:bg-[#00ADB5]/90 transition text-sm"
              >
                ◀
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#00ADB5]/70 text-[#222831] px-2 py-1 rounded-full shadow hover:bg-[#00ADB5]/90 transition text-sm"
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
