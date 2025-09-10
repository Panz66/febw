/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/pages/Lomba/TambahLomba.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LombaForm from "./LombaForm";
import type { UserType } from "@/services/users";

export default function TambahLomba() {
  const [formData, setFormData] = useState<any | null>(null);
  const [batches, setBatches] = useState<UserType[][]>([]);
  const [showPesertaForm, setShowPesertaForm] = useState(false);

  const navigate = useNavigate();

  const handleFormSubmit = (data: any) => {
    setFormData(data);

    const jmlPeserta = Number(data.peserta);
    const jumlahBatch = data.kategori === "kualifikasi" ? Number(data.batch) : 1;

    const allBatches: UserType[][] = [];
    const base = Math.floor(jmlPeserta / jumlahBatch);
    const sisa = jmlPeserta % jumlahBatch;

    let pesertaId = 1;

    for (let b = 0; b < jumlahBatch; b++) {
      const sizeBatch = base + (b < sisa ? 1 : 0);
      const pesertaBatch: UserType[] = [];

      for (let i = 0; i < sizeBatch; i++) {
        pesertaBatch.push({
          id_pendaftaran: pesertaId,
          nama: `Peserta ${pesertaId}`,
          plat_number: "-",
          community: "-",
          point1: 0,
          point2: 0,
        });
        pesertaId++;
      }

      allBatches.push(pesertaBatch);
    }

    setBatches(allBatches);
  };

  const handlePesertaChange = (
    batchIdx: number,
    id: number,
    key: keyof UserType,
    value: string | number
  ) => {
    const updatedBatches = [...batches];
    updatedBatches[batchIdx] = updatedBatches[batchIdx].map((p) =>
      p.id_pendaftaran === id ? { ...p, [key]: value } : p
    );
    setBatches(updatedBatches);
  };

  const handleTambahkanLomba = () => {
    localStorage.setItem("lombaData", JSON.stringify(batches));
    navigate("/result");
  };

  return (
    <div className="min-h-screen bg-[#222831] p-6 flex items-start justify-center font-poppins">
      <div className="bg-[#EEEEEE] shadow-lg rounded-xl p-6 w-full max-w-5xl">
        {!formData ? (
          <LombaForm onSubmit={handleFormSubmit} />
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-[#222831]">
              🏁 {formData.nama} ({formData.kategori}) - {formData.tanggal}
            </h2>

            <div className="flex gap-3 justify-center mb-6">
              <button
                className="px-4 py-2 bg-[#393E46] text-[#EEEEEE] rounded-lg hover:bg-[#222831] transition"
                onClick={() => setShowPesertaForm(true)}
              >
                Input Peserta
              </button>
              <button
                className="px-4 py-2 bg-[#00ADB5] text-[#EEEEEE] rounded-lg hover:bg-[#0099a3] transition"
                onClick={handleTambahkanLomba}
              >
                Tambahkan Lomba
              </button>
            </div>

            {batches.map((pesertaBatch, batchIdx) => (
              <div key={batchIdx} className="mb-8">
                {batches.length > 1 && (
                  <h3 className="text-lg font-semibold mb-3 text-[#222831]">
                    Batch {batchIdx + 1}
                  </h3>
                )}
                <div className="overflow-x-auto rounded-lg shadow border border-[#393E46]">
                  <table className="min-w-full text-sm text-left text-[#222831]">
                    <thead className="bg-[#393E46] text-[#EEEEEE] uppercase">
                      <tr>
                        <th className="px-4 py-3 border border-[#222831]">Nama Peserta</th>
                        <th className="px-4 py-3 border border-[#222831]">No Plat</th>
                        <th className="px-4 py-3 border border-[#222831]">Asal Komunitas</th>
                        <th className="px-4 py-3 border border-[#222831] text-center">Point 1</th>
                        <th className="px-4 py-3 border border-[#222831] text-center">Point 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pesertaBatch.map((u) => (
                        <tr
                          key={u.id_pendaftaran}
                          className="odd:bg-[#EEEEEE] even:bg-[#f5f5f5] hover:bg-[#d9f9fa] transition"
                        >
                          <td className="px-4 py-2 border border-[#393E46]">
                            {showPesertaForm ? (
                              <input
                                type="text"
                                value={u.nama}
                                onChange={(e) =>
                                  handlePesertaChange(
                                    batchIdx,
                                    u.id_pendaftaran,
                                    "nama",
                                    e.target.value
                                  )
                                }
                                className="border border-[#393E46] rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              />
                            ) : (
                              u.nama
                            )}
                          </td>
                          <td className="px-4 py-2 border border-[#393E46]">
                            {showPesertaForm ? (
                              <input
                                type="text"
                                value={u.plat_number}
                                onChange={(e) =>
                                  handlePesertaChange(
                                    batchIdx,
                                    u.id_pendaftaran,
                                    "plat_number",
                                    e.target.value
                                  )
                                }
                                className="border border-[#393E46] rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              />
                            ) : (
                              u.plat_number
                            )}
                          </td>
                          <td className="px-4 py-2 border border-[#393E46]">
                            {showPesertaForm ? (
                              <input
                                type="text"
                                value={u.community}
                                onChange={(e) =>
                                  handlePesertaChange(
                                    batchIdx,
                                    u.id_pendaftaran,
                                    "community",
                                    e.target.value
                                  )
                                }
                                className="border border-[#393E46] rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              />
                            ) : (
                              u.community
                            )}
                          </td>
                          <td className="px-4 py-2 border border-[#393E46] text-center">
                            {showPesertaForm ? (
                              <input
                                type="number"
                                value={u.point1}
                                onChange={(e) =>
                                  handlePesertaChange(
                                    batchIdx,
                                    u.id_pendaftaran,
                                    "point1",
                                    Number(e.target.value)
                                  )
                                }
                                className="border border-[#393E46] rounded px-2 py-1 w-full text-center focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              />
                            ) : (
                              u.point1
                            )}
                          </td>
                          <td className="px-4 py-2 border border-[#393E46] text-center">
                            {showPesertaForm ? (
                              <input
                                type="number"
                                value={u.point2}
                                onChange={(e) =>
                                  handlePesertaChange(
                                    batchIdx,
                                    u.id_pendaftaran,
                                    "point2",
                                    Number(e.target.value)
                                  )
                                }
                                className="border border-[#393E46] rounded px-2 py-1 w-full text-center focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              />
                            ) : (
                              u.point2
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
