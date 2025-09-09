/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/TambahLombaModal.tsx
import { useState } from "react";
import { createLomba, type Kategori } from "@/services/lomba";

interface TambahLombaModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TambahLombaModal({ onClose, onSuccess }: TambahLombaModalProps) {
  const [form, setForm] = useState<{
    nama: string;
    tanggal: string;
    jumlah_peserta: number;
    biaya: number;
    kategori: Kategori;
    jumlah_batch: number; // tambahkan field ini
  }>({
    nama: "",
    tanggal: "",
    jumlah_peserta: 1,
    biaya: 0,
    kategori: "boy", // default harus sesuai enum
    jumlah_batch: 1, // default 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "kategori" ? (value as Kategori) : Number(value) || value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createLomba({
        nama: form.nama,
        tanggal: form.tanggal,
        jumlahPeserta: Number(form.jumlah_peserta),
        biaya: Number(form.biaya),
        kategori: form.kategori,
        jumlahBatch: Number(form.jumlah_batch), // kirim ke backend
      });

      onSuccess();
      alert("Data lomba berhasil disimpan!")
      onClose();
    } catch (err: any) {
      console.error("Gagal tambah lomba:", err);
      setError(err?.response?.data?.message || "Gagal tambah lomba");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#393E46] text-[#EEEEEE] rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 border-b border-[#00ADB5] pb-2 text-center">
          Tambah Lomba
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2">{Array.isArray(error) ? error.join(", ") : error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 font-medium">Nama Lomba</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Jumlah Peserta</label>
            <input
              type="number"
              name="jumlah_peserta"
              value={form.jumlah_peserta}
              onChange={handleChange}
              min={1}
              className="w-full p-2 rounded-lg bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Jumlah Batch</label>
            <input
              type="number"
              name="jumlah_batch"
              value={form.jumlah_batch}
              onChange={handleChange}
              min={1}
              className="w-full p-2 rounded-lg bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Harga Pendaftaran (Rp)</label>
            <input
              type="number"
              name="biaya"
              value={form.biaya}
              onChange={handleChange}
              min={0}
              className="w-full p-2 rounded-lg bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Kategori</label>
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            >
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#00ADB5] hover:bg-[#00ADB5]/80 text-[#EEEEEE]"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
