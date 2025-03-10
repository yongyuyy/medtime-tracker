
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimeEntry, WorkSchedule, TimeViewMode } from '@/types';
import { generateId, getCurrentDate, getCurrentTime, calculateDuration } from '@/utils/timeUtils';
import { toast } from 'sonner';

interface TimeContextType {
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

const defaultWorkSchedule: WorkSchedule = {
  regularHoursPerWeek: 39,
  defaultStartTime: '07:00',
  defaultEndTime: '17:00',
};

// Mock initial data for development
const initialEntries: TimeEntry[] = [
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

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const savedEntries = localStorage.getItem('medtime-entries');
    return savedEntries ? JSON.parse(savedEntries) : initialEntries;
  });
  
  const [activeTimerId, setActiveTimerId] = useState<string | null>(() => {
    const savedTimer = localStorage.getItem('medtime-active-timer');
    return savedTimer ? JSON.parse(savedTimer) : null;
  });
  
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(() => {
    const savedSchedule = localStorage.getItem('medtime-work-schedule');
    return savedSchedule ? JSON.parse(savedSchedule) : defaultWorkSchedule;
  });
  
  const [viewMode, setViewMode] = useState<TimeViewMode>('week');

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medtime-entries', JSON.stringify(entries));
  }, [entries]);
  
  // Save active timer to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medtime-active-timer', JSON.stringify(activeTimerId));
  }, [activeTimerId]);
  
  // Save work schedule to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medtime-work-schedule', JSON.stringify(workSchedule));
  }, [workSchedule]);

  const addEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'duration'>) => {
    const now = new Date().toISOString();
    const duration = calculateDuration(entry.timeIn, entry.timeOut, entry.date);
    
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      duration,
      createdAt: now,
      updatedAt: now,
    };
    
    setEntries((prev) => [newEntry, ...prev]);
    toast.success('Time entry added successfully');
  };

  const updateEntry = (id: string, entryUpdate: Partial<TimeEntry>) => {
    setEntries((prev) => {
      const updatedEntries = prev.map((entry) => {
        if (entry.id === id) {
          // If timeIn or timeOut is updated, recalculate duration
          const timeIn = entryUpdate.timeIn || entry.timeIn;
          const timeOut = entryUpdate.timeOut || entry.timeOut;
          const date = entryUpdate.date || entry.date;
          const duration = (entryUpdate.timeIn || entryUpdate.timeOut) 
            ? calculateDuration(timeIn, timeOut, date)
            : entry.duration;
            
          return {
            ...entry,
            ...entryUpdate,
            duration,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      });
      
      return updatedEntries;
    });
    
    toast.success('Time entry updated successfully');
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    toast.success('Time entry deleted successfully');
  };

  const deleteAllEntries = () => {
    setEntries([]);
    toast.success('All time entries deleted successfully');
  };

  const startTimer = () => {
    const now = new Date();
    const id = generateId();
    const newEntry: TimeEntry = {
      id,
      date: now.toISOString().split('T')[0],
      timeIn: getCurrentTime(),
      timeOut: '',
      duration: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    setEntries((prev) => [newEntry, ...prev]);
    setActiveTimerId(id);
    toast.success('Timer started');
  };

  const stopTimer = (notes?: string) => {
    if (!activeTimerId) return;
    
    const timeOut = getCurrentTime();
    
    setEntries((prev) => {
      const updatedEntries = prev.map((entry) => {
        if (entry.id === activeTimerId) {
          const duration = calculateDuration(entry.timeIn, timeOut, entry.date);
          return {
            ...entry,
            timeOut,
            duration,
            notes: notes || entry.notes,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      });
      
      return updatedEntries;
    });
    
    setActiveTimerId(null);
    toast.success('Timer stopped');
  };

  const updateWorkSchedule = (schedule: Partial<WorkSchedule>) => {
    setWorkSchedule((prev) => ({ ...prev, ...schedule }));
    toast.success('Work schedule updated successfully');
  };

  return (
    <TimeContext.Provider
      value={{
        entries,
        activeTimerId,
        workSchedule,
        viewMode,
        setViewMode,
        addEntry,
        updateEntry,
        deleteEntry,
        deleteAllEntries,
        startTimer,
        stopTimer,
        updateWorkSchedule,
      }}
    >
      {children}
    </TimeContext.Provider>
  );
};

export const useTimeEntries = () => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTimeEntries must be used within a TimeProvider');
  }
  return context;
};
