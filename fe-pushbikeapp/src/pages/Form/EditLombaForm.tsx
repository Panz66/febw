/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/EditLombaModal.tsx
import { useState, useEffect } from "react";
import { updateLomba, type Kategori } from "@/services/lomba";

interface EditLombaModalProps {
  lomba: {
    id: number;
    nama: string;
    tanggal: string;
    jumlahPeserta: number;
    jumlahBatch?: number; // <- tambahkan optional jumlahBatch
    biaya: number;
    kategori: Kategori;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLombaModal({ lomba, onClose, onSuccess }: EditLombaModalProps) {
  const [form, setForm] = useState({
    nama: "",
    tanggal: "",
    jumlahPeserta: 1,
    jumlahBatch: 1, // <- default 1
    biaya: 0,
    kategori: "boy" as Kategori,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill data lomba ketika modal dibuka
  useEffect(() => {
    if (lomba) {
      setForm({
        nama: lomba.nama,
        tanggal: lomba.tanggal.split("T")[0], // format YYYY-MM-DD
        jumlahPeserta: lomba.jumlahPeserta,
        jumlahBatch: lomba.jumlahBatch ?? 1, // ambil dari lomba jika ada
        biaya: lomba.biaya,
        kategori: lomba.kategori,
      });
    }
  }, [lomba]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "kategori"
          ? (value as Kategori)
          : name === "jumlahPeserta" || name === "biaya" || name === "jumlahBatch"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateLomba(lomba.id, {
        nama: form.nama,
        tanggal: form.tanggal,
        jumlahPeserta: form.jumlahPeserta,
        jumlahBatch: form.jumlahBatch, // <- kirim ke backend
        biaya: form.biaya,
        kategori: form.kategori,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Gagal update lomba:", err);
      setError(err?.response?.data?.message || "Gagal update lomba");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#393E46] text-[#EEEEEE] rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 border-b border-[#00ADB5] pb-2 text-center">
          Edit Lomba
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {Array.isArray(error) ? error.join(", ") : error}
          </p>
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
              name="jumlahPeserta"
              value={form.jumlahPeserta}
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
              name="jumlahBatch"
              value={form.jumlahBatch}
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
