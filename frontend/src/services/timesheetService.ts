import api from './api';
import { Timesheet, TimesheetEntry } from '../types';

export const timesheetService = {
  createOrUpdateTimesheet: async (data: {
    weekStartDate: string;
    entries: TimesheetEntry[];
  }): Promise<{ message: string; timesheet: Timesheet }> => {
    const response = await api.post('/timesheets', data);
    return response.data;
  },

  getMyTimesheets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    const response = await api.get('/timesheets/my', { params });
    return response.data;
  },

  getTimesheetById: async (id: string): Promise<{ timesheet: Timesheet }> => {
    const response = await api.get(`/timesheets/${id}`);
    return response.data;
  },

  submitTimesheet: async (id: string): Promise<{ message: string; timesheet: Timesheet }> => {
    const response = await api.post(`/timesheets/${id}/submit`);
    return response.data;
  },

  getPendingTimesheets: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await api.get('/timesheets/pending', { params });
    return response.data;
  },

  approveOrRejectTimesheet: async (id: string, data: {
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }): Promise<{ message: string; timesheet: Timesheet }> => {
    const response = await api.post(`/timesheets/${id}/review`, data);
    return response.data;
  }
};
