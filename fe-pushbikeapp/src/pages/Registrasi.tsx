/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Registrasi.tsx
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

export default function Registrasi() {
  const navigate = useNavigate();
  const [lombaList, setLombaList] = useState<LombaType[]>([]);
  const [selectedLomba, setSelectedLomba] = useState<LombaType | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    plat_number: "",
    community: "",
    no_hp : "",
    metodePembayaran: "transfer",
  });

  const fetchLomba = async () => {
    try {
      const res = await api.get<LombaType[]>("/lomba");
      setLombaList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLomba();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLomba) return;

    const confirmDaftar = window.confirm(
      `Apakah Anda yakin ingin mendaftar ke lomba "${selectedLomba.nama}"?`
    );
    if (!confirmDaftar) return;

    try {
      await api.post(`/lomba/${selectedLomba.id}/peserta`, {
        nama: formData.nama,
        plat_number: formData.plat_number,
        community: formData.community,
        no_hp: formData.no_hp,
        metodePembayaran: formData.metodePembayaran,
        kategori: selectedLomba.kategori,
      });

      alert(`✅ Pendaftaran berhasil! Anda telah terdaftar di lomba "${selectedLomba.nama}".`);

      await fetchLomba();
      setSelectedLomba(null);
      setFormData({ nama: "", plat_number: "", community: "", no_hp: "", metodePembayaran: "transfer" });

      navigate("/");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "❌ Gagal daftar");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-[#222831] min-h-screen font-poppins">
      <h1 className="text-3xl font-bold text-[#00ADB5] mb-6 text-center">
        Pilih Lomba untuk Daftar 🚴
      </h1>

      {/* Daftar Lomba */}
      <div className="flex flex-col gap-4">
        {lombaList.map((lomba) => (
          <div
            key={lomba.id}
            className="bg-[#393E46] shadow-lg rounded-xl p-4 flex flex-col justify-between hover:shadow-xl transition"
          >
            <div>
              <h2 className="text-lg font-semibold text-[#EEEEEE]">{lomba.nama}</h2>
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
              onClick={() => setSelectedLomba(lomba)}
              className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-[#EEEEEE] font-semibold px-2 py-1 rounded-lg shadow transition"
            >
              Daftar
            </button>
          </div>
        ))}
      </div>

      {/* Modal Registrasi */}
      {selectedLomba && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#393E46] rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-[#EEEEEE] hover:text-[#00ADB5] transition"
              onClick={() => setSelectedLomba(null)}
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-[#00ADB5]">
              Registrasi {selectedLomba.nama}
            </h2>

            <p className="text-[#EEEEEE]/80 mb-2 text-center">
              Biaya pendaftaran:{" "}
              <span className="text-[#00ADB5] font-semibold">
                Rp {selectedLomba.biaya.toLocaleString()}
              </span>
            </p>
            <p className="text-[#EEEEEE]/80 mb-4 text-center">
              Kategori lomba:{" "}
              <span
                className={
                  selectedLomba.kategori === "girl"
                    ? "text-pink-400 font-semibold"
                    : "text-blue-400 font-semibold"
                }
              >
                {selectedLomba.kategori}
              </span>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[#EEEEEE] font-medium">Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-[#EEEEEE] font-medium">Plat Number</label>
                <input
                  type="text"
                  name="plat_number"
                  value={formData.plat_number}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-[#EEEEEE] font-medium">Community</label>
                <input
                  type="text"
                  name="community"
                  value={formData.community}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                  required
                />
              </div>

              <div className="mb-4">
              <label className="block text-[#EEEEEE] font-medium">No HP</label>
              <input
                type="text"
                name="no_hp"
                value={formData.no_hp || ""}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-[#222831] text-[#EEEEEE] border border-[#00ADB5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                required
              />
            </div>


              <div className="mb-6">
                <p className="text-[#EEEEEE] font-medium">Metode Pembayaran</p>
                <p className="text-[#00ADB5] mt-2 font-semibold">
                  Transfer Bank: BCA 1234567890 a.n Panitia PushBike
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-400 hover:bg-blue-600 text-[#EEEEEE] font-semibold p-3 rounded-lg shadow-md transition"
              >
                Daftar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
