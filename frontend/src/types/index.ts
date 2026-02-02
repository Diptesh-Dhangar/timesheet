export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'employee' | 'manager';
  employeeId: string;
  department?: string;
  isActive: boolean;
  manager?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetEntry {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  hours: number;
  project: string;
  description?: string;
}

export interface Timesheet {
  _id: string;
  employee: User;
  weekStartDate: string;
  weekEndDate: string;
  entries: TimesheetEntry[];
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  totalHours: number;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: User;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeOffRequest {
  _id: string;
  employee: User;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedAt?: string;
  reviewedBy?: User;
  rejectionReason?: string;
  daysRequested: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  timesheets?: T[];
  requests?: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}
