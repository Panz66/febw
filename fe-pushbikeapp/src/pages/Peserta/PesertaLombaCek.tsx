import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

type Peserta = {
  id_pendaftaran: number;
  nama: string;
  kategori: string;
  platNumber: string;
  community: string;
  statusPembayaran: boolean;
};

type LombaType = {
  id: number;
  nama: string;
};

export default function PesertaLombaCek() {
  const { id } = useParams<{ id: string }>();
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [lombaNama, setLombaNama] = useState<string>("");
  const navigate = useNavigate();

  // Fetch peserta
  const fetchPeserta = async () => {
    try {
      const res = await api.get(`/lomba/${id}/peserta`);
      const data: Peserta[] = res.data || [];
      setPesertaList(data);

      // Sync selected sesuai statusPembayaran dari DB
      const initialSelected: Record<number, boolean> = {};
      data.forEach((p) => {
        initialSelected[p.id_pendaftaran] = p.statusPembayaran;
      });
      setSelected(initialSelected);
    } catch (err) {
      console.error("Gagal fetch peserta:", err);
    }
  };

  // Fetch nama lomba
  const fetchLomba = async () => {
    try {
      const res = await api.get<LombaType>(`/lomba/${id}`);
      setLombaNama(res.data.nama);
    } catch (err) {
      console.error("Gagal fetch lomba:", err);
      setLombaNama(`Lomba ID ${id}`);
    }
  };

  useEffect(() => {
    fetchPeserta();
    fetchLomba();
  }, [id]);

  const toggleSelect = (pesertaId: number, checked: boolean) => {
    setSelected((prev) => ({
      ...prev,
      [pesertaId]: checked,
    }));
  };

  const toggleAll = () => {
    const allChecked = pesertaList.every(
      (p) => selected[p.id_pendaftaran] ?? p.statusPembayaran
    );
    const newSelected: Record<number, boolean> = {};
    pesertaList.forEach((p) => {
      newSelected[p.id_pendaftaran] = !allChecked;
    });
    setSelected(newSelected);
  };

  const handleSave = async () => {
  const confirmSave = window.confirm(
    "Apakah Anda yakin ingin menyimpan perubahan status pembayaran?"
  );
  if (!confirmSave) return;

  try {
    // Ambil semua peserta dan kirim status terbaru sesuai checkbox
    for (const peserta of pesertaList) {
      const checked = selected[peserta.id_pendaftaran] ?? peserta.statusPembayaran;
      await api.patch(`/lomba/${id}/peserta/${peserta.id_pendaftaran}/status`, {
        statusPembayaran: checked,
      });
    }

    alert("Status pembayaran berhasil diperbarui ✅");
    fetchPeserta();
  } catch (err) {
    console.error("Gagal simpan status:", err);
    alert("Gagal menyimpan perubahan ❌");
  }
};


  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#222831] min-h-screen font-poppins">
      <h1 className="text-2xl font-bold text-[#00ADB5] mb-6 text-center">
        Peserta Lomba: {lombaNama}
      </h1>

      <div className="flex justify-end mb-4">
        {pesertaList.length > 0 && (
          <button
            onClick={toggleAll}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            Toggle Semua
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        {pesertaList.length === 0 ? (
          <p className="text-center text-[#EEEEEE] py-6">Belum ada peserta</p>
        ) : (
          <table className="min-w-full border border-[#EEEEEE]/20 text-[#EEEEEE] text-sm rounded-lg">
            <thead className="bg-[#00ADB5] text-[#222831]">
              <tr>
                <th className="px-2 py-2 text-left">No</th>
                <th className="px-2 py-2 text-left">Nama</th>
                <th className="px-2 py-2 text-left">Plat</th>
                <th className="px-2 py-2 text-left">Community</th>
                <th className="px-2 py-2 text-left">Kategori</th>
                <th className="px-2 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {pesertaList.map((p, index) => (
                <tr
                  key={p.id_pendaftaran}
                  className="border-t border-[#EEEEEE]/20 hover:bg-[#00ADB5]/20"
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{p.nama}</td>
                  <td className="px-2 py-2">{p.platNumber}</td>
                  <td className="px-2 py-2">{p.community}</td>
                  <td className="px-2 py-2">{p.kategori}</td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      className="w-6 h-6 accent-[#00ADB5]"
                      checked={selected[p.id_pendaftaran] ?? p.statusPembayaran}
                      onChange={(e) =>
                        toggleSelect(p.id_pendaftaran, e.target.checked)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          ← Kembali
        </button>
        {pesertaList.length > 0 && (
          <button
            onClick={handleSave}
            className="bg-[#00ADB5] hover:bg-[#019ca4] text-white px-6 py-2 rounded-lg shadow"
          >
            Simpan
          </button>
        )}
      </div>
    </div>
  );
}
