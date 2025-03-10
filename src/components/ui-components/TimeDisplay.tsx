
import React, { useState, useEffect } from 'react';
import { formatTimeDisplay } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';

interface TimeDisplayProps {
  isRunning?: boolean;
  startTime?: string; // HH:MM format
  className?: string;
  showLocalTime?: boolean;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  isRunning = false, 
  startTime,
  className,
  showLocalTime = false
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState('00:00:00');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let intervalId: number;

    if (showLocalTime) {
      // Update current time every second
      intervalId = window.setInterval(() => {
        setCurrentTime(new Date());
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentTime.getSeconds().toString().padStart(2, '0');
        setTimeDisplay(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else if (isRunning && startTime) {
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
  }, [isRunning, startTime, showLocalTime]);

  useEffect(() => {
    if (!showLocalTime) {
      setTimeDisplay(formatTimeDisplay(elapsedSeconds));
    }
  }, [elapsedSeconds, showLocalTime]);

  // Set initial local time display on mount
  useEffect(() => {
    if (showLocalTime) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTimeDisplay(`${hours}:${minutes}:${seconds}`);
    }
  }, [showLocalTime]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="time-display font-mono text-7xl tracking-[0.3em] font-bold">
        <span className="tabular-nums">{timeDisplay.substring(0, 2)}</span>
        <span className="time-separator mx-1">:</span>
        <span className="tabular-nums">{timeDisplay.substring(3, 5)}</span>
        <span className="time-separator mx-1">:</span>
        <span className="tabular-nums">{timeDisplay.substring(6, 8)}</span>
      </div>
    </div>
  );
};

export default TimeDisplay;
