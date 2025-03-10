
import { TimeEntry, WorkSchedule, TimeViewMode } from '@/types';

export interface TimeContextType {
  entries: TimeEntry[];
  activeTimerId: string | null;
  workSchedule: WorkSchedule;
  viewMode: TimeViewMode;
  setViewMode: (mode: TimeViewMode) => void;
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'duration'>) => void;
  updateEntry: (id: string, entry: Partial<TimeEntry>) => void;
  deleteEntry: (id: string) => void;
  deleteAllEntries: () => void;
  startTimer: () => void;
  stopTimer: (notes?: string) => void;
  updateWorkSchedule: (schedule: Partial<WorkSchedule>) => void;
}

export const defaultWorkSchedule: WorkSchedule = {
  regularHoursPerWeek: 39,
  defaultStartTime: '07:00',
  defaultEndTime: '17:00',
};

// Mock initial data for development
export const initialEntries: TimeEntry[] = [
  {
    id: 'mock-entry-1',
    date: '2025-03-09',
    timeIn: '23:37',
    timeOut: '23:40',
    duration: 3,
    notes: 'IV cannual issues hence check out late',
    createdAt: '2025-03-09T23:37:00Z',
    updatedAt: '2025-03-09T23:40:00Z',
  },
];
