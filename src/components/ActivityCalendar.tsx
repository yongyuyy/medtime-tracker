
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, getDay, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';
import { formatTime, formatDurationCompact } from '@/utils/timeUtils';
import TimeControls from './ui-components/TimeControls';

interface ActivityCalendarProps {
  className?: string;
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ className }) => {
  const { entries, viewMode, setViewMode } = useTimeEntries();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  const [daysInView, setDaysInView] = useState<Date[]>([]);
  
  // Update days in view when current date or view mode changes
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setDaysInView(days);
    
    // Update date range display
    const startDate = format(days[0], 'MMM d');
    const endDate = format(days[6], 'MMM d');
    setDateRange(`${startDate} - ${endDate}`);
  }, [currentDate, viewMode]);
  
  // Navigate to previous week
  const goToPrevious = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };
  
  // Navigate to next week
  const goToNext = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };
  
  // Go to current week
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Find entries for a specific day
  const getEntriesForDay = (day: Date): TimeEntry[] => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, day);
    });
  };
  
  return (
    <div className={cn("section-container", className)}>
      <h2 className="section-title mb-6">Activity</h2>
      
      <TimeControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        dateRange={dateRange}
        className="mb-6"
      />
      
      {/* Week view calendar */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Day names */}
        {daysInView.map((day, index) => (
          <div key={`day-name-${index}`} className="text-sm font-medium">
            {format(day, 'EEE')}
          </div>
        ))}
        
        {/* Day numbers */}
        {daysInView.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const dayEntries = getEntriesForDay(day);
          const hasEntries = dayEntries.length > 0;
          
          return (
            <div key={`day-${index}`} className="relative">
              <div 
                className={cn(
                  "w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm transition-all",
                  isToday && "bg-black text-white",
                  !isToday && hasEntries && "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                )}
              >
                {format(day, 'd')}
              </div>
              
              {hasEntries && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1.5 h-1.5 bg-medtime-500 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityCalendar;
