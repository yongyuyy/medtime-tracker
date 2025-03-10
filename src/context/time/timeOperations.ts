
import { TimeEntry } from '@/types';
import { generateId, getCurrentTime, getCurrentDate, calculateDuration } from '@/utils/timeUtils';
import { toast } from 'sonner';

export const createNewEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'duration'>): TimeEntry => {
  const now = new Date().toISOString();
  const duration = calculateDuration(entry.timeIn, entry.timeOut, entry.date);
  
  return {
    ...entry,
    id: generateId(),
    duration,
    createdAt: now,
    updatedAt: now,
  };
};

export const updateExistingEntry = (
  entry: TimeEntry, 
  update: Partial<TimeEntry>
): TimeEntry => {
  // If timeIn or timeOut is updated, recalculate duration
  const timeIn = update.timeIn || entry.timeIn;
  const timeOut = update.timeOut || entry.timeOut;
  const date = update.date || entry.date;
  const duration = (update.timeIn || update.timeOut) 
    ? calculateDuration(timeIn, timeOut, date)
    : entry.duration;
    
  return {
    ...entry,
    ...update,
    duration,
    updatedAt: new Date().toISOString(),
  };
};

export const createTimerEntry = (): TimeEntry => {
  const now = new Date();
  const id = generateId();
  
  return {
    id,
    date: now.toISOString().split('T')[0],
    timeIn: getCurrentTime(),
    timeOut: '',
    duration: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
};

export const stopTimerEntry = (
  entry: TimeEntry, 
  notes?: string
): TimeEntry => {
  const timeOut = getCurrentTime();
  const duration = calculateDuration(entry.timeIn, timeOut, entry.date);
  
  return {
    ...entry,
    timeOut,
    duration,
    notes: notes || entry.notes,
    updatedAt: new Date().toISOString(),
  };
};
