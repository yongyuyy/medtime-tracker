import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getDate, getMonth, getYear, isSameDay, parse, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';
import { formatTime, formatDurationCompact } from '@/utils/timeUtils';
import TimeControls from './ui-components/TimeControls';
import YearCalendar from './YearCalendar';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ActivityCalendarProps {
  className?: string;
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ className }) => {
  const { entries, viewMode, setViewMode } = useTimeEntries();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  const [daysInView, setDaysInView] = useState<Date[]>([]);
  
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

  const renderWeekView = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-medium">{dateRange}</div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-4 text-center">
          {daysInView.map((day, index) => (
            <div key={`day-name-${index}`} className="text-sm font-medium">
              {format(day, 'EEE')}
            </div>
          ))}
          
          {daysInView.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const dayEntries = getEntriesForDay(day);
            const hasEntries = dayEntries.length > 0;
            const dayDuration = getDurationForDay(day);
            const colorClass = getColorForDuration(dayDuration);
            
            return (
              <TooltipProvider key={`day-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      <div 
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-base transition-all",
                          colorClass,
                          isToday && !colorClass && "ring-2 ring-black dark:ring-white"
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                    </div>
                  </TooltipTrigger>
                  {hasEntries && (
                    <TooltipContent>
                      <div className="p-1">
                        <div className="font-medium">{format(day, 'EEEE, MMMM d')}</div>
                        <div className="text-sm">{formatDurationCompact(dayDuration)} worked</div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </>
    );
  };
  
  const renderMonthView = () => {
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
    
    const weeks: Date[][] = [];
    for (let i = 0; i < dateArray.length; i += 7) {
      weeks.push(dateArray.slice(i, i + 7));
    }
    
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-medium">{dateRange}</div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-sm font-medium">{day}</div>
          ))}
        </div>
        
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 mb-1 text-center">
            {week.map((day, dayIndex) => {
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const dayEntries = getEntriesForDay(day);
              const hasEntries = dayEntries.length > 0;
              const dayDuration = getDurationForDay(day);
              const colorClass = getColorForDuration(dayDuration);
              
              return (
                <TooltipProvider key={`day-${weekIndex}-${dayIndex}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <div 
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all",
                            !isCurrentMonth && "text-slate-400 dark:text-slate-500",
                            colorClass,
                            isToday && !colorClass && "ring-2 ring-black dark:ring-white"
                          )}
                        >
                          {format(day, 'd')}
                        </div>
                      </div>
                    </TooltipTrigger>
                    {hasEntries && (
                      <TooltipContent>
                        <div className="p-1">
                          <div className="font-medium">{format(day, 'EEEE, MMMM d')}</div>
                          <div className="text-sm">{formatDurationCompact(dayDuration)} worked</div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </>
    );
  };
  
  return (
    <div className={cn("section-container", className)}>
      <h2 className="section-title mb-6">Activity</h2>
      
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="inline-flex rounded-md shadow-sm bg-slate-100 dark:bg-slate-800 p-1">
          {['Week', 'Month', 'Year'].map((mode) => (
            <Button
              key={mode}
              variant="ghost"
              className={cn(
                "rounded-md h-9 px-4",
                viewMode === mode.toLowerCase() && "bg-white dark:bg-black shadow-sm"
              )}
              onClick={() => setViewMode(mode.toLowerCase() as any)}
            >
              {mode}
            </Button>
          ))}
        </div>
        
        <div className="flex-grow"></div>
        
        {viewMode !== 'year' && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="rounded-full"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
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
