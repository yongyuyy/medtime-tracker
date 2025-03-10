
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatDurationCompact } from '@/utils/timeUtils';
import { TimeEntry } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeekViewProps {
  daysInView: Date[];
  dateRange: string;
  getEntriesForDay: (day: Date) => TimeEntry[];
  getDurationForDay: (day: Date) => number;
  getColorForDuration: (minutes: number) => string;
}

const WeekView: React.FC<WeekViewProps> = ({
  daysInView,
  dateRange,
  getEntriesForDay,
  getDurationForDay,
  getColorForDuration
}) => {
  return (
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
  );
};

export default WeekView;
