
import React, { useEffect, useState } from 'react';
import { format, getYear, getMonth, getDaysInMonth } from 'date-fns';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { TimeEntry } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDurationCompact } from '@/utils/timeUtils';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface YearCalendarProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

const YearCalendar: React.FC<YearCalendarProps> = ({ currentYear, onYearChange }) => {
  const { entries } = useTimeEntries();
  const [yearData, setYearData] = useState<Record<string, TimeEntry[]>>({});
  
  // Process entries for the current year
  useEffect(() => {
    const yearStr = currentYear.toString();
    const entriesInYear = entries.filter(entry => entry.date.startsWith(yearStr));
    
    // Group entries by day
    const groupedByDay = entriesInYear.reduce((acc: Record<string, TimeEntry[]>, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {});
    
    setYearData(groupedByDay);
  }, [entries, currentYear]);
  
  // Get the color based on hours worked
  const getActivityColor = (entries: TimeEntry[]): string => {
    const totalMinutes = entries.reduce((total, entry) => total + entry.duration, 0);
    const hours = totalMinutes / 60;
    
    if (hours === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (hours < 4) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (hours < 8) return 'bg-emerald-300 dark:bg-emerald-700/60';
    if (hours < 12) return 'bg-emerald-500 dark:bg-emerald-500/80';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };
  
  // Generate tooltip content for a day
  const getDayTooltipContent = (date: string, entries: TimeEntry[]) => {
    const totalMinutes = entries.reduce((total, entry) => total + entry.duration, 0);
    const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy');
    
    return (
      <div className="p-2 max-w-xs">
        <div className="font-semibold mb-1">{formattedDate}</div>
        <div className="text-sm">Total: {formatDurationCompact(totalMinutes)}</div>
      </div>
    );
  };
  
  // Generate calendar grid for one month
  const renderMonth = (monthIndex: number) => {
    const monthDate = new Date(currentYear, monthIndex, 1);
    const monthName = format(monthDate, 'MMM');
    const daysInMonth = getDaysInMonth(monthDate);
    const rows = Math.ceil(daysInMonth / 7);
    const firstDayOfWeek = monthDate.getDay(); // 0 = Sunday
    
    // Generate labels for days of week (M-T-W-T-F-S-S)
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    // Adjust to start with Monday (1) and end with Sunday (0)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    return (
      <div className="month-grid" key={monthIndex}>
        <div className="mb-2 font-medium">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayLabels.map((day, i) => (
            <div key={`header-${monthIndex}-${i}`} className="text-xs text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-start-${monthIndex}-${i}`} className="w-5 h-5"></div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const date = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntries = yearData[date] && yearData[date].length > 0;
            
            return (
              <TooltipProvider key={`day-${monthIndex}-${day}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                        ${hasEntries ? getActivityColor(yearData[date]) : 'bg-slate-100 dark:bg-slate-800'}`}
                    >
                      &nbsp;
                    </div>
                  </TooltipTrigger>
                  {hasEntries && (
                    <TooltipContent side="top">
                      {getDayTooltipContent(date, yearData[date])}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
          
          {/* Empty cells for days after the last day of month */}
          {Array.from({ length: 7 - ((adjustedFirstDay + daysInMonth) % 7) }).map((_, i) => (
            <div key={`empty-end-${monthIndex}-${i}`} className="w-5 h-5"></div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => onYearChange(currentYear - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xl font-semibold">{currentYear}</div>
        <Button variant="outline" size="icon" onClick={() => onYearChange(currentYear + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => renderMonth(i))}
      </div>
    </div>
  );
};

export default YearCalendar;
