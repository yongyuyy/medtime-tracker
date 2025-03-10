
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeViewMode } from '@/types';

interface ActivityControlsProps {
  viewMode: TimeViewMode;
  setViewMode: (mode: TimeViewMode) => void;
  dateRange: string;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
}

const ActivityControls: React.FC<ActivityControlsProps> = ({
  viewMode,
  setViewMode,
  dateRange,
  goToPrevious,
  goToNext,
  goToToday
}) => {
  return (
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
  );
};

export default ActivityControls;
