import api from "./api";

export type Kategori = 'boy' | 'girl';

export interface LombaType {
  id: number;
  nama: string;
  tanggal: string;
  jumlahPeserta: number;
  biaya: number;
  kategori: Kategori;
  jumlahBatch?: number;
}

export type CreateLombaDto = Omit<LombaType, 'id'>;

export const getLombas = () => api.get<LombaType[]>('/lomba');
export const createLomba = (data: CreateLombaDto) => api.post<LombaType>('/lomba', data);

export type UpdateLombaDto = Partial<CreateLombaDto>;

export const updateLomba = (id: number, data: UpdateLombaDto) =>
  api.patch<LombaType>(`/lomba/${id}`, data);

export const deleteLomba = (id: number) =>
  api.delete(`/lomba/${id}`);

