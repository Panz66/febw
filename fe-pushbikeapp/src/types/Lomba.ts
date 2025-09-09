// src/lomba/dto/create-lomba.dto.ts (atau di src/types/lomba.ts)
export type Kategori = "boy" | "girl";

export interface CreateLombaDto {
  nama: string;
  tanggal: string;
  jumlahPeserta: number;
  biaya: number;
  kategori: Kategori;
}
