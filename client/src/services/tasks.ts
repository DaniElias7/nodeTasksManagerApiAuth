import api from './api';
import { Task } from '../types';

export const TaskService = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>('/tasks');
    return data;
  },

  create: async (taskData: Omit<Task, '_id' | 'createdAt' | 'user'>): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', taskData);
    return data;
  },

  update: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const { data } = await api.put<Task>(`/tasks/${id}`, taskData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  }
};