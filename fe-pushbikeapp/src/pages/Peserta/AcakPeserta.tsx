import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";

type Peserta = {
  id_pendaftaran: number;
  nama: string;
  kategori: string;
  platNumber: string;
  community: string;
  batch?: number;
};

type Lomba = {
  id: number;
  nama: string;
  jumlahBatch: number;
};

type HasilBatch = { peserta: Peserta; batch: number };

export default function WheelAcakPeserta() {
  const { id } = useParams<{ id: string }>();

  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [remaining, setRemaining] = useState<Peserta[]>([]);
  const [lomba, setLomba] = useState<Lomba | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pesertaTerpilih, setPesertaTerpilih] = useState<Peserta | null>(null);
  const [hasilBatch, setHasilBatch] = useState<HasilBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch lomba & peserta
  useEffect(() => {
    const fetchData = async () => {
      try {
        const lombaRes = await api.get<Lomba>(`/lomba/${id}`);
        setLomba(lombaRes.data);

        const pesertaRes = await api.get<Peserta[]>(`/lomba/${id}/peserta`);
        const data: Peserta[] = pesertaRes.data.map(p => ({
          ...p,
          batch: p.batch ?? undefined
        }));

        setPesertaList(data);

        const remainingPeserta = data.filter(p => !p.batch);
        setRemaining(remainingPeserta);

        // Isi hasilBatch dari peserta yang sudah punya batch
        const existingBatch: HasilBatch[] = data
          .filter(p => p.batch)
          .map(p => ({ peserta: p, batch: p.batch! }));
        setHasilBatch(existingBatch);

        const lastBatch = Math.max(0, ...existingBatch.map(h => h.batch));
        setCurrentBatch(lastBatch > 0 ? lastBatch : 1);

      } catch (err) {
        console.error("Gagal fetch data:", err);
      }
    };
    fetchData();
  }, [id]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    if (remaining.length === 0) {
      ctx.fillStyle = "#EEEEEE";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Semoga Beruntung!", width / 2, height / 2);
      return;
    }

    const anglePer = (2 * Math.PI) / remaining.length;

    remaining.forEach((p, i) => {
      const start = i * anglePer + rotation;
      const end = start + anglePer;

      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2);
      ctx.arc(width / 2, height / 2, radius, start, end);
      ctx.closePath();
      // Highlight peserta terpilih
      if (pesertaTerpilih?.id_pendaftaran === p.id_pendaftaran) {
        ctx.fillStyle = "#FFD700"; // gold
      } else {
        ctx.fillStyle = i % 2 === 0 ? "#00ADB5" : "#393E46";
      }
      ctx.fill();
      ctx.strokeStyle = "#EEEEEE";
      ctx.stroke();

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(start + anglePer / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#EEEEEE";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(p.nama, radius - 10, 0);
      ctx.restore();
    });

    // Pointer jam 3
    ctx.beginPath();
    ctx.moveTo(width / 2 + radius + 15, height / 2);
    ctx.lineTo(width / 2 + radius - 25, height / 2 - 20);
    ctx.lineTo(width / 2 + radius - 25, height / 2 + 20);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
  };

  useEffect(() => { drawWheel(); }, [rotation, remaining, pesertaTerpilih]);

  const spinOne = async () => {
    if (spinning || remaining.length === 0) return;

    // Jika sisa satu peserta, langsung pilih
    if (remaining.length === 1) {
        setPesertaTerpilih(remaining[0]);
        return;
    }

    setSpinning(true);

    const anglePer = (2 * Math.PI) / remaining.length;
    const fullRotations = 5 + Math.floor(Math.random() * 3); // variasi rotasi agar lebih natural
    const selectedIndex = Math.floor(Math.random() * remaining.length);

    const startRotation = rotation;
    const targetRotation =
        2 * Math.PI * fullRotations +
        (2 * Math.PI - (selectedIndex * anglePer + anglePer / 2) - (rotation % (2 * Math.PI)));

    const duration = 4000;

    const cubicEaseOut = (t: number) => 1 - Math.pow(1 - t, 3); // easing cubic out

    await new Promise<void>((resolve) => {
        const startTime = performance.now();
        const animate = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = cubicEaseOut(t);
        setRotation(startRotation + targetRotation * eased);
        if (t < 1) requestAnimationFrame(animate);
        else resolve();
        };
        requestAnimationFrame(animate);
    });

    setPesertaTerpilih(remaining[selectedIndex]);
    setSpinning(false);
    };


  const confirmPeserta = () => {
    if (!pesertaTerpilih || !lomba) return;
    const batchMax = Math.ceil(pesertaList.length / lomba.jumlahBatch);
    const pesertaDiBatch = hasilBatch.filter(h => h.batch === currentBatch).length;

    setHasilBatch(prev => [...prev, { peserta: pesertaTerpilih, batch: currentBatch }]);
    setRemaining(prev => prev.filter(p => p.id_pendaftaran !== pesertaTerpilih.id_pendaftaran));

    if (pesertaDiBatch + 1 >= batchMax && currentBatch < lomba.jumlahBatch) {
      setCurrentBatch(prev => prev + 1);
    }

    setPesertaTerpilih(null);
  };

  const handleSimpan = async () => {
    if (!lomba) return;
    try {
      const batchPeserta: Peserta[][] = [];
      for (let i = 1; i <= lomba.jumlahBatch; i++) {
        batchPeserta[i - 1] = hasilBatch
          .filter(h => h.batch === i)
          .map(h => h.peserta);
      }

      for (let i = 0; i < batchPeserta.length; i++) {
        const pesertaIds = batchPeserta[i].map(p => p.id_pendaftaran);
        if (pesertaIds.length > 0) {
          await api.post(`/lomba/${lomba.id}/peserta/batch`, {
            batch: i + 1,
            pesertaIds,
          });
        }
      }

      alert("Semua batch berhasil disimpan ✅");
    } catch (err: any) {
      console.error(err.response?.data || err);
      alert("Gagal menyimpan data batch ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#222831] font-poppins px-6 py-12">
      <h1 className="text-2xl font-bold text-[#EEEEEE] mb-6">{lomba?.nama || "Lomba"} - Acak Peserta Wheel</h1>

      <div className="flex justify-center mb-6">
        <canvas ref={canvasRef} width={600} height={600} className="rounded-full border-4 border-[#EEEEEE]" />
      </div>

      <div className="flex justify-center mb-6 space-x-4">
        <button
        onClick={spinOne}
        disabled={spinning || remaining.length === 0} // Hapus cek pesertaTerpilih
        className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
        >
        {spinning ? "Berputar..." : "Acak Satu Peserta"}
        </button>

        <button
          onClick={confirmPeserta}
          disabled={!pesertaTerpilih}
          className="px-6 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600"
        >
          Konfirmasi Peserta
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-[#00ADB5] font-bold mb-2">Peserta Terpilih Saat Ini:</h2>
        {pesertaTerpilih ? (
          <p className="text-yellow-400 font-bold">{pesertaTerpilih.nama} → Batch {currentBatch}</p>
        ) : (
          <p className="text-[#EEEEEE]">Belum ada peserta terpilih</p>
        )}
      </div>

      {hasilBatch.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-[#00ADB5] font-bold mb-2">Tabel Batch Final:</h2>
          <table className="min-w-full border border-[#EEEEEE]/20 text-[#EEEEEE] text-sm rounded-lg overflow-hidden">
            <thead className="bg-[#00ADB5] text-[#222831]">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Kategori</th>
                <th className="px-3 py-2">Plat Number</th>
                <th className="px-3 py-2">Community</th>
                <th className="px-3 py-2">Batch</th>
              </tr>
            </thead>
            <tbody>
              {hasilBatch
                .sort((a, b) => a.batch - b.batch) // Urutkan berdasarkan batch
                .map((h, idx) => (
                  <tr key={h.peserta.id_pendaftaran} className="border-t border-[#EEEEEE]/20 hover:bg-[#00ADB5]/20">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{h.peserta.nama}</td>
                    <td className="px-3 py-2">{h.peserta.kategori}</td>
                    <td className="px-3 py-2">{h.peserta.platNumber}</td>
                    <td className="px-3 py-2">{h.peserta.community}</td>
                    <td className="px-3 py-2">{h.batch}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSimpan}
              disabled={hasilBatch.length !== pesertaList.length}
              className={`px-6 py-2 rounded-lg text-white ${
                hasilBatch.length === pesertaList.length ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              Simpan Data Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
