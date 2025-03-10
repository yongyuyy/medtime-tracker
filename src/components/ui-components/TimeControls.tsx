
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeControlsProps {
  viewMode: 'week' | 'month' | 'year';
  onViewModeChange: (mode: 'week' | 'month' | 'year') => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  dateRange: string;
  className?: string;
}

const TimeControls: React.FC<TimeControlsProps> = ({
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  dateRange,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 flex">
          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-all",
              viewMode === 'week' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-all",
              viewMode === 'month' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('year')}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-all",
              viewMode === 'year' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full time-nav-button"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="mx-1 text-xs h-8"
            onClick={onToday}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full time-nav-button"
            onClick={onNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium">{dateRange}</div>
      </div>
    </div>
  );
};

export default TimeControls;
