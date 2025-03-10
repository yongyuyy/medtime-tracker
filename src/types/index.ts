
// Define the TimeEntry type
export interface TimeEntry {
  id: string;
  date: string; // ISO string
  timeIn: string; // 24-hour format "HH:MM"
  timeOut: string; // 24-hour format "HH:MM"
  duration: number; // in minutes
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Define the WorkSchedule type
export interface WorkSchedule {
  regularHoursPerWeek: number;
  defaultStartTime: string; // 24-hour format "HH:MM"
  defaultEndTime: string; // 24-hour format "HH:MM"
}

// Define the TimeViewMode type
export type TimeViewMode = 'week' | 'month' | 'year';
