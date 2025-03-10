
import { TimeEntry, WorkSchedule, TimeViewMode } from '@/types';
import { initialEntries, defaultWorkSchedule } from './types';

export const loadEntries = (): TimeEntry[] => {
  const savedEntries = localStorage.getItem('medtime-entries');
  return savedEntries ? JSON.parse(savedEntries) : initialEntries;
};

export const saveEntries = (entries: TimeEntry[]): void => {
  localStorage.setItem('medtime-entries', JSON.stringify(entries));
};

export const loadActiveTimer = (): string | null => {
  const savedTimer = localStorage.getItem('medtime-active-timer');
  return savedTimer ? JSON.parse(savedTimer) : null;
};

export const saveActiveTimer = (timerId: string | null): void => {
  localStorage.setItem('medtime-active-timer', JSON.stringify(timerId));
};

export const loadWorkSchedule = (): WorkSchedule => {
  const savedSchedule = localStorage.getItem('medtime-work-schedule');
  return savedSchedule ? JSON.parse(savedSchedule) : defaultWorkSchedule;
};

export const saveWorkSchedule = (schedule: WorkSchedule): void => {
  localStorage.setItem('medtime-work-schedule', JSON.stringify(schedule));
};

export const loadViewMode = (): TimeViewMode => {
  const savedViewMode = localStorage.getItem('medtime-view-mode');
  return savedViewMode ? JSON.parse(savedViewMode) as TimeViewMode : 'week';
};

export const saveViewMode = (mode: TimeViewMode): void => {
  localStorage.setItem('medtime-view-mode', JSON.stringify(mode));
};
