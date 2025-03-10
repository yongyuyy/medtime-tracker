
import { format, differenceInMinutes, formatDistance, parseISO, isSameDay, addDays } from 'date-fns';
import { TimeEntry } from '@/types';

// Format a date string
export const formatDate = (date: string | Date, formatString: string = 'PPP'): string => {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return format(dateObject, formatString);
};

// Format time from 24-hour format to 12-hour format
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hoursInt = parseInt(hours, 10);
  const period = hoursInt >= 12 ? 'PM' : 'AM';
  const displayHours = hoursInt % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
};

// Calculate duration between time in and time out
export const calculateDuration = (timeIn: string, timeOut: string, date: string): number => {
  const dateObj = new Date(date);
  const [inHours, inMinutes] = timeIn.split(':').map(Number);
  const [outHours, outMinutes] = timeOut.split(':').map(Number);
  
  const timeInDate = new Date(dateObj);
  timeInDate.setHours(inHours, inMinutes, 0, 0);
  
  const timeOutDate = new Date(dateObj);
  // If timeOut is earlier than timeIn, it's assumed to be the next day
  if (outHours < inHours || (outHours === inHours && outMinutes < inMinutes)) {
    timeOutDate.setDate(timeOutDate.getDate() + 1);
  }
  timeOutDate.setHours(outHours, outMinutes, 0, 0);
  
  return differenceInMinutes(timeOutDate, timeInDate);
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format duration in minutes to compact format (for display in tables)
export const formatDurationCompact = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Calculate total duration for a list of entries
export const calculateTotalDuration = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.duration, 0);
};

// Get time ago string (e.g., "3 minutes ago")
export const getTimeAgo = (date: string): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Check if two dates are the same day
export const isSameDayCheck = (dateA: string | Date, dateB: string | Date): boolean => {
  const dateAObj = typeof dateA === 'string' ? new Date(dateA) : dateA;
  const dateBObj = typeof dateB === 'string' ? new Date(dateB) : dateB;
  return isSameDay(dateAObj, dateBObj);
};

// Get current date in ISO format
export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

// Get current time in HH:MM format
export const getCurrentTime = (): string => {
  const now = new Date();
  return format(now, 'HH:mm');
};

// Get time from date in HH:MM format
export const getTimeFromDate = (date: Date): string => {
  return format(date, 'HH:mm');
};

// Parse an ISO string to a Date object
export const parseISODate = (isoString: string): Date => {
  return parseISO(isoString);
};

// Format a duration in minutes to HH:MM:SS format
export const formatTimeDisplay = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
