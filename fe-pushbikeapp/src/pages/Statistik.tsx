 // src/pages/Statistik.tsx
import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

type Lomba = {
  id: number;
  nama: string;
  pesertaCount: number;
  batchCount?: number;
};

export default function Statistik() {
  const [lombaData, setLombaData] = useState<Lomba[]>([]);
  const [totalPeserta, setTotalPeserta] = useState(0);

  const COLORS = ["#00ADB5", "#222831", "#393E46", "#EEEEEE"];

  const fetchStatistik = async () => {
  try {
    const res = await api.get("/statistik");
    const withCounts = res.data ?? [];

    setLombaData(withCounts);
    setTotalPeserta(withCounts.reduce((acc, l) => acc + l.pesertaCount, 0));
  } catch (err) {
    console.error("Gagal fetch statistik", err);
  }
};


  useEffect(() => {
    fetchStatistik();
  }, []);

  return (
    <div className="min-h-screen bg-[#222831] text-[#EEEEEE] font-poppins px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">📊 Statistik Lomba & Peserta</h1>

      {/* Ringkasan Angka */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#393E46] p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold">{lombaData.length}</h2>
          <p className="text-sm text-[#EEEEEE]/70">Total Lomba</p>
        </div>
        <div className="bg-[#393E46] p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold">{totalPeserta}</h2>
          <p className="text-sm text-[#EEEEEE]/70">Total Peserta</p>
        </div>
        <div className="bg-[#393E46] p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold">
            {Math.max(...lombaData.map(l => l.pesertaCount), 0)}
          </h2>
          <p className="text-sm text-[#EEEEEE]/70">Peserta Terbanyak (1 Lomba)</p>
        </div>
      </div>

      {/* Grafik Bar Peserta per Lomba */}
      <div className="bg-[#393E46] p-6 rounded-2xl shadow-md mb-12">
        <h2 className="text-lg font-semibold mb-4">Jumlah Peserta per Lomba</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lombaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nama" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pesertaCount" fill="#00ADB5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Pie Distribusi Peserta */}
      <div className="bg-[#393E46] p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Distribusi Peserta per Lomba</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={lombaData}
              dataKey="pesertaCount"
              nameKey="nama"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {lombaData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
