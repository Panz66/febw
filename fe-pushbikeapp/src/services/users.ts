import api from "./api";

export interface UserType {
  id_pendaftaran: number;
  nama: string;
  email: string;
  lomba_id: number;
}

export const getUsers = () => api.get<UserType[]>("/user");

export const getUserById = (id_pendaftaran: number) =>
  api.get<UserType>(`/user/${id_pendaftaran}`);

export const createUser = (data: Omit<UserType, "id_pendaftaran">) =>
  api.post<UserType>("/user", data);

export const updateUser = (id_pendaftaran: number, data: Partial<UserType>) =>
  api.put<UserType>(`/user/${id_pendaftaran}`, data);

export const deleteUser = (id_pendaftaran: number) =>
  api.delete(`/user/${id_pendaftaran}`);
