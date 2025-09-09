// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TambahLombaModal from "@/pages/Form/TambahLombaForm";
import api from "@/services/api";

type MenuItem = {
  title: string;
  desc: string;
  action?: () => void;
  path?: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [lombaCount, setLombaCount] = useState(0);

  // fetch jumlah lomba
  const fetchLombaCount = async () => {
    try {
      const res = await api.get("/lomba");
      setLombaCount(res.data?.length ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLombaCount();
  }, []);

  const menuItems: MenuItem[] = [
    { title: "➕ Tambah Lomba", desc: "Tambahkan lomba baru", action: () => setOpenModal(true) },
    { title: "➕ Kelola Data Lomba", desc: "Pengelolaan data lomba yang sudah ada", path: "kelolalomba" },
    { title: "👥 Daftar Peserta", desc: "Lihat dan kelola peserta", path: "daftarpeserta" },
    { title: "📋 Daftar Lomba", desc: `Semua lomba (${lombaCount})`, path: "daftarlomba" },
    { title: "📩 Lihat Pesan", desc: `Semua Pesan Yang Masuk`, path: "lihatpesan" },
    { title: "☑️ Status Peserta", desc: "Status Pembayaran peserta", path: "checkpeserta" },
    { title: "📊 Statistik", desc: "Statistik lomba & peserta", path: "statistik" },
  ];

  return (
    <div className="min-h-screen bg-[#222831] font-poppins">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4 text-[#EEEEEE]">Dashboard Admin</h1>
        <p className="text-[#EEEEEE]/70 mb-10">
          Selamat datang, Admin! Silakan pilih menu untuk mengelola data.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => (item.action ? item.action() : item.path && navigate(item.path))}
              className="bg-[#393E46] shadow-md rounded-2xl p-8 cursor-pointer text-center hover:bg-[#00ADB5] hover:shadow-lg transition group"
            >
              <h2 className="text-xl font-semibold mb-2 text-[#EEEEEE] group-hover:text-[#222831]">
                {item.title}
              </h2>
              <p className="text-[#EEEEEE]/70 group-hover:text-[#222831]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Render modal hanya kalau openModal = true */}
      {openModal && (
        <TambahLombaModal
          onClose={() => setOpenModal(false)}
          onSuccess={() => {
            fetchLombaCount();
          }}
        />
      )}
    </div>
  );
}
