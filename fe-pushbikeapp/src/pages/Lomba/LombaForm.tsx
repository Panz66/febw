/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

type LombaFormProps = {
  onSubmit: (formData: {
    nama: string;
    kategori: "kualifikasi" | "semifinal" | "final";
    batch: number | null;
    peserta: number;
    tanggal: string; // "YYYY-MM-DD"
  }) => void;
};

export default function LombaForm({ onSubmit }: LombaFormProps) {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<"kualifikasi" | "semifinal" | "final">("kualifikasi");
  const [batch, setBatch] = useState(1);
  const [peserta, setPeserta] = useState(1);
  const [tanggal, setTanggal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nama,
      kategori,
      batch: kategori === "kualifikasi" ? batch : null,
      peserta,
      tanggal,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222831] font-poppins">
      <div className="bg-[#393E46] shadow-lg rounded-xl p-8 w-full max-w-xl text-[#EEEEEE]">
        <h2 className="text-2xl font-bold text-center mb-6">Tambah Perlombaan</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lomba */}
          <div>
            <label className="block font-medium mb-1">Nama Lomba</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-[#00ADB5] rounded-lg px-3 py-2 bg-[#222831] text-[#EEEEEE] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block font-medium mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as any)}
              className="w-full border border-[#00ADB5] rounded-lg px-3 py-2 bg-[#222831] text-[#EEEEEE] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            >
              <option value="kualifikasi">Kualifikasi</option>
              <option value="semifinal">Semi Final</option>
              <option value="final">Final</option>
            </select>
          </div>

          {/* Jumlah Batch (hanya kualifikasi) */}
          {kategori === "kualifikasi" && (
            <div>
              <label className="block font-medium mb-1">Jumlah Batch</label>
              <input
                type="number"
                min={1}
                value={batch}
                onChange={(e) => setBatch(Math.max(1, Number(e.target.value)))}
                className="w-full border border-[#00ADB5] rounded-lg px-3 py-2 bg-[#222831] text-[#EEEEEE] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                required
              />
            </div>
          )}

          {/* Jumlah Peserta */}
          <div>
            <label className="block font-medium mb-1">Jumlah Peserta</label>
            <input
              type="number"
              min={1}
              value={peserta}
              onChange={(e) => setPeserta(Math.max(1, Number(e.target.value)))}
              className="w-full border border-[#00ADB5] rounded-lg px-3 py-2 bg-[#222831] text-[#EEEEEE] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          {/* Tanggal Lomba */}
          <div>
            <label className="block font-medium mb-1">Tanggal Lomba</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border border-[#00ADB5] rounded-lg px-3 py-2 bg-[#222831] text-[#EEEEEE] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00ADB5] hover:bg-[#019ca3] text-[#222831] font-semibold py-3 rounded-lg transition"
          >
            Buat Tabel
          </button>
        </form>
      </div>
    </div>
  );
}
