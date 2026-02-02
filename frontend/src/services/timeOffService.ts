import api from './api';
import { TimeOffRequest } from '../types';

export const timeOffService = {
  createTimeOffRequest: async (data: {
    fromDate: string;
    toDate: string;
    reason: string;
  }): Promise<{ message: string; timeOffRequest: TimeOffRequest }> => {
    const response = await api.post('/timeoff', data);
    return response.data;
  },

  getMyTimeOffRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    const response = await api.get('/timeoff/my', { params });
    return response.data;
  },

  getPendingTimeOffRequests: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await api.get('/timeoff/pending', { params });
    return response.data;
  },

  getTimeOffRequestById: async (id: string): Promise<{ request: TimeOffRequest }> => {
    const response = await api.get(`/timeoff/${id}`);
    return response.data;
  },

  approveOrRejectTimeOff: async (id: string, data: {
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }): Promise<{ message: string; timeOffRequest: TimeOffRequest }> => {
    const response = await api.post(`/timeoff/${id}/review`, data);
    return response.data;
  }
};
