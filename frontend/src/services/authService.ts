import api from './api';
import { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ message: string; user: User }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    employeeId: string;
    role?: string;
    department?: string;
  }): Promise<{ message: string; user: User }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser: (user: User) => {
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  clearCurrentUser: () => {
    sessionStorage.removeItem('user');
  }
};
