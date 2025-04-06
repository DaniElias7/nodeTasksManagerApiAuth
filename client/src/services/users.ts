import api from './api';
import { User } from '../types';

export const UserService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  updateRole: async (userId: string, newRole: string): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${userId}/role`, { role: newRole });
    return data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  }
};