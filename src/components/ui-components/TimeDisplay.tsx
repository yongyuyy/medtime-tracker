
import React, { useState, useEffect } from 'react';
import { formatTimeDisplay } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';

interface TimeDisplayProps {
  isRunning?: boolean;
  startTime?: string; // HH:MM format
  className?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  isRunning = false, 
  startTime,
  className 
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState('00:00:00');

  useEffect(() => {
    let intervalId: number;

    if (isRunning && startTime) {
      // Parse the start time
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      // Set initial elapsed time
      const initialElapsed = Math.floor((Date.now() - startDate.getTime()) / 1000);
      setElapsedSeconds(initialElapsed > 0 ? initialElapsed : 0);
      
      // Update every second
      intervalId = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, startTime]);

  useEffect(() => {
    setTimeDisplay(formatTimeDisplay(elapsedSeconds));
  }, [elapsedSeconds]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="time-display font-mono">
        <span>{timeDisplay.substring(0, 2)}</span>
        <span className="time-separator">:</span>
        <span>{timeDisplay.substring(3, 5)}</span>
        <span className="time-separator">:</span>
        <span>{timeDisplay.substring(6, 8)}</span>
      </div>
    </div>
  );
};

export default TimeDisplay;
