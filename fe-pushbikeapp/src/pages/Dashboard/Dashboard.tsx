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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState(0); // untuk mini-carousel di card
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
        setSlides(lombaData.slice(-3));
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

  // mini-carousel untuk pemenang di card
  useEffect(() => {
    const interval = setInterval(() => {
      setWinnerIndex((prev) => (prev + 1) % lombaCards.length);
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

                {/* Mini-carousel untuk pemenang */}
                {lombaCards.length > 0 && (
                  <p className="font-medium mt-2">
                    Pemenang:{" "}
                    {lombaCards[winnerIndex]?.name} :{" "}
                    {lombaCards[winnerIndex]?.winner}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel gambar */}
        <div className="relative">
          {slides.length > 0 && (
            <div className="bg-[#393E46] text-[#EEEEEE] shadow rounded-lg overflow-hidden relative">
              <img
                src={`https://picsum.photos/300/150?random=${slides[carouselIndex].id}`}
                alt={slides[carouselIndex].name}
                className="w-full h-36 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-[#00ADB5]">
                  {slides[carouselIndex].name}
                </h3>
                <p className="text-sm">
                  Pemenang: {slides[carouselIndex].winner}
                </p>
              </div>

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
