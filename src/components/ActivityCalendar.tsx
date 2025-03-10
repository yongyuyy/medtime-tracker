
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getDate, getMonth, getYear, isSameDay, parse, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';
import YearCalendar from './YearCalendar';
import WeekView from './activity/WeekView';
import MonthView from './activity/MonthView';
import ActivityControls from './activity/ActivityControls';

interface ActivityCalendarProps {
  className?: string;
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ className }) => {
  const { entries, viewMode, setViewMode } = useTimeEntries();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  const [daysInView, setDaysInView] = useState<Date[]>([]);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  
  useEffect(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      setDaysInView(days);
      
      const startDate = format(days[0], 'MMM d');
      const endDate = format(days[6], 'MMM d');
      setDateRange(`${startDate} - ${endDate}`);
    } else if (viewMode === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = endOfMonth(currentDate);
      
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      const dateArray: Date[] = [];
      let currentDay = startDate;
      
      while (currentDay <= endDate) {
        dateArray.push(new Date(currentDay));
        currentDay = addDays(currentDay, 1);
      }
      
      const weeksData: Date[][] = [];
      for (let i = 0; i < dateArray.length; i += 7) {
        weeksData.push(dateArray.slice(i, i + 7));
      }
      
      setWeeks(weeksData);
      setDateRange(format(currentDate, 'MMMM yyyy'));
    } else if (viewMode === 'year') {
      setDateRange(format(currentDate, 'yyyy'));
    }
  }, [currentDate, viewMode]);
  
  const goToPrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else if (viewMode === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (viewMode === 'year') {
      setCurrentDate(prev => subYears(prev, 1));
    }
  };
  
  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else if (viewMode === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (viewMode === 'year') {
      setCurrentDate(prev => addYears(prev, 1));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const getEntriesForDay = (day: Date): TimeEntry[] => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    return entries.filter(entry => entry.date === formattedDate);
  };
  
  const getDurationForDay = (day: Date): number => {
    const entriesForDay = getEntriesForDay(day);
    return entriesForDay.reduce((total, entry) => total + entry.duration, 0);
  };
  
  const getColorForDuration = (minutes: number): string => {
    if (minutes === 0) return '';
    if (minutes < 240) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (minutes < 480) return 'bg-emerald-300 dark:bg-emerald-700/60';
    return 'bg-emerald-500 dark:bg-emerald-400';
  };
  
  return (
    <div className={cn("section-container", className)}>
      <h2 className="section-title mb-6">Activity</h2>
      
      <ActivityControls 
        viewMode={viewMode}
        setViewMode={setViewMode}
        dateRange={dateRange}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        goToToday={goToToday}
      />
      
      {viewMode === 'week' && (
        <WeekView 
          daysInView={daysInView}
          dateRange={dateRange}
          getEntriesForDay={getEntriesForDay}
          getDurationForDay={getDurationForDay}
          getColorForDuration={getColorForDuration}
        />
      )}
      
      {viewMode === 'month' && (
        <MonthView 
          weeks={weeks}
          currentDate={currentDate}
          getEntriesForDay={getEntriesForDay}
          getDurationForDay={getDurationForDay}
          getColorForDuration={getColorForDuration}
        />
      )}
      
      {viewMode === 'year' && (
        <YearCalendar 
          currentYear={getYear(currentDate)} 
          onYearChange={(year) => setCurrentDate(new Date(year, 0, 1))}
        />
      )}
    </div>
  );
};

export default ActivityCalendar;
