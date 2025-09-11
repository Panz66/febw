import { useState, useEffect } from "react";
import api from "@/services/api";

interface PointSesi {
  id: number;
  sesi: number;
  finish: number;
  point: number;
  pesertaIdPendaftaran: number;
  matchName?: string;
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

interface MatchWinner {
  matchName: string;
  winner: string;
}

interface LombaDisplay {
  id: number;
  name: string;
  date: string;
  kategori?: string;
  winners: MatchWinner[]; // semua pemenang sesi 2 untuk lomba ini
}

export default function DashboardUser() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lombaCards, setLombaCards] = useState<LombaDisplay[]>([]);
  const [slides, setSlides] = useState<Lomba[]>([]);
  const [winnerIndexes, setWinnerIndexes] = useState<{ [key: number]: number }>({}); // indeks per lomba

  useEffect(() => {
    const fetchLomba = async () => {
      try {
        const res = await api.get<Lomba[]>("/lomba");
        const lombaData: LombaDisplay[] = [];

        for (const lomba of res.data) {
          const pesertaRes = await api.get<Peserta[]>(`/lomba/${lomba.id}/peserta`);
          const semuaPeserta = pesertaRes.data;

          // ambil sesi 2 lalu group by matchName
          const sesi2All = semuaPeserta
            .map((p) => ({
              nama: p.nama,
              sesi2: p.pointSesi?.find((s) => s.sesi === 2),
            }))
            .filter((p) => p.sesi2 && p.sesi2.finish !== undefined);

          const matchGroups: { [matchName: string]: { nama: string; finish: number }[] } = {};
          for (const p of sesi2All) {
            const matchName = p.sesi2?.matchName ?? "Unknown";
            if (!matchGroups[matchName]) matchGroups[matchName] = [];
            matchGroups[matchName].push({ nama: p.nama, finish: p.sesi2!.finish });
          }

          const winners: MatchWinner[] = [];
          for (const matchName in matchGroups) {
            const pesertaMatch = matchGroups[matchName];
            const winner = pesertaMatch.reduce((prev, curr) =>
              curr.finish < prev.finish ? curr : prev
            );
            winners.push({ matchName, winner: winner.nama });
          }

          lombaData.push({
            id: lomba.id,
            name: lomba.nama,
            date: lomba.tanggal,
            kategori: lomba.kategori,
            winners,
          });
        }

        setLombaCards(lombaData);
        setSlides(res.data.slice(-3)); // gambar tetap dari lomba
      } catch (err) {
        console.error("Gagal fetch lomba:", err);
      }
    };

    fetchLomba();
  }, []);

  // carousel otomatis tiap 3 detik untuk gambar
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  // mini-carousel winners per lomba
  useEffect(() => {
    const interval = setInterval(() => {
      setWinnerIndexes((prev) => {
        const newIndexes: { [key: number]: number } = { ...prev };
        for (const lomba of lombaCards) {
          const current = prev[lomba.id] ?? 0;
          newIndexes[lomba.id] = (current + 1) % lomba.winners.length;
        }
        return newIndexes;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [lombaCards]);

  const nextSlide = () =>
    setCarouselIndex((carouselIndex + 1) % slides.length);
  const prevSlide = () =>
    setCarouselIndex((carouselIndex - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-[#222831] p-6 max-w-7xl mx-auto font-poppins">
      <h1 className="text-3xl font-bold text-[#EEEEEE] mb-6 text-center md:text-left">
        Selamat Datang di Push Bike Race! 🚴‍♂️
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Grid */}
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

                {/* Mini-carousel winner per match sesi 2 */}
                {lomba.winners.length > 0 && (
                  <p className="font-medium mt-2">
                    {lomba.winners[winnerIndexes[lomba.id] ?? 0]?.matchName} :{" "}
                    {lomba.winners[winnerIndexes[lomba.id] ?? 0]?.winner}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel gambar (gambar saja) */}
        <div className="relative">
          {slides.length > 0 && (
            <div className="bg-[#393E46] shadow rounded-lg overflow-hidden relative">
              <img
                src={`https://picsum.photos/300/150?random=${slides[carouselIndex].id}`}
                alt="Lomba Slide"
                className="w-full h-36 object-cover"
              />
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
