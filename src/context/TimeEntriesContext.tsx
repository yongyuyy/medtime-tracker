
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimeEntry, WorkSchedule, TimeViewMode } from '@/types';
import { toast } from 'sonner';
import { TimeContextType } from './time/types';
import { 
  loadEntries, 
  saveEntries, 
  loadActiveTimer, 
  saveActiveTimer, 
  loadWorkSchedule,

  saveWorkSchedule
} from './time/timeStorage';
import { 
  createNewEntry, 
  updateExistingEntry, 
  createTimerEntry, 
  stopTimerEntry 
} from './time/timeOperations';

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TimeEntry[]>(loadEntries);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(loadActiveTimer);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(loadWorkSchedule);
  const [viewMode, setViewMode] = useState<TimeViewMode>('week');

  // Save entries to localStorage whenever they change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);
  
  // Save active timer to localStorage whenever it changes
  useEffect(() => {
    saveActiveTimer(activeTimerId);
  }, [activeTimerId]);
  
  // Save work schedule to localStorage whenever it changes
  useEffect(() => {
    saveWorkSchedule(workSchedule);
  }, [workSchedule]);

  const addEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'duration'>) => {
    const newEntry = createNewEntry(entry);
    setEntries((prev) => [newEntry, ...prev]);
    toast.success('Time entry added successfully');
  };

  const updateEntry = (id: string, entryUpdate: Partial<TimeEntry>) => {
    setEntries((prev) => {
      const updatedEntries = prev.map((entry) => {
        if (entry.id === id) {
          return updateExistingEntry(entry, entryUpdate);
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
    const newEntry = createTimerEntry();
    
    setEntries((prev) => [newEntry, ...prev]);
    setActiveTimerId(newEntry.id);
    toast.success('Timer started');
  };

  const stopTimer = (notes?: string) => {
    if (!activeTimerId) return;
    
    setEntries((prev) => {
      const updatedEntries = prev.map((entry) => {
        if (entry.id === activeTimerId) {
          return stopTimerEntry(entry, notes);
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
