
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatDurationCompact } from '@/utils/timeUtils';
import { TimeEntry } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MonthViewProps {
  weeks: Date[][];
  currentDate: Date;
  getEntriesForDay: (day: Date) => TimeEntry[];
  getDurationForDay: (day: Date) => number;
  getColorForDuration: (minutes: number) => string;
}

const MonthView: React.FC<MonthViewProps> = ({
  weeks,
  currentDate,
  getEntriesForDay,
  getDurationForDay,
  getColorForDuration
}) => {
  return (
    <>
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

export default MonthView;
