
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TimeControls from '@/components/ui-components/TimeControls';
import { calculateTotalDuration } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

const Stats = () => {
  const { entries, workSchedule, viewMode, setViewMode } = useTimeEntries();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  // Calculate stats for the current period
  useEffect(() => {
    // Weekly view stats
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    // Set date range display
    setDateRange(`${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`);
    
    // Generate weekly chart data
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayEntries = entries.filter(entry => entry.date === dateStr);
      const totalMinutes = calculateTotalDuration(dayEntries);
      const totalHours = totalMinutes / 60;
      
      chartData.push({
        name: format(date, 'EEE'),
        hours: parseFloat(totalHours.toFixed(1)),
        date: dateStr,
      });
    }
    
    setWeeklyData(chartData);
  }, [currentDate, entries, viewMode]);

  // Navigate to previous period
  const goToPrevious = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  // Navigate to next period
  const goToNext = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  // Go to current period
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate total hours worked
  const calculateTotalHours = () => {
    const totalMinutes = calculateTotalDuration(entries);
    return (totalMinutes / 60).toFixed(1);
  };
  
  // Calculate days worked
  const calculateDaysWorked = () => {
    const uniqueDays = new Set();
    entries.forEach(entry => {
      uniqueDays.add(entry.date);
    });
    return uniqueDays.size;
  };
  
  // Calculate overtime hours
  const calculateOvertimeHours = () => {
    const regularHoursPerWeek = workSchedule.regularHoursPerWeek;
    const totalHours = parseFloat(calculateTotalHours());
    return totalHours > regularHoursPerWeek ? (totalHours - regularHoursPerWeek).toFixed(1) : '0';
  };

  // Format data for display
  const formatWeeklyProgressData = () => {
    const totalHours = parseFloat(calculateTotalHours());
    const targetHours = workSchedule.regularHoursPerWeek;
    const percentage = Math.min(100, Math.round((totalHours / targetHours) * 100));
    const remaining = Math.max(0, targetHours - totalHours);
    
    return {
      totalHours,
      targetHours,
      percentage,
      remaining,
    };
  };
  
  const progressData = formatWeeklyProgressData();

  return (
    <div className="page-container">
      <h1 className="page-title">Stats</h1>
      <p className="page-subtitle">View and analyze your time tracking statistics</p>
      
      {/* Weekly Progress */}
      <div className="section-container mb-8">
        <h2 className="section-title">Weekly Progress</h2>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              {progressData.totalHours} <span className="text-sm text-muted-foreground font-normal">of {progressData.targetHours} hours</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {progressData.percentage}%
            </div>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
            <div 
              className="bg-black dark:bg-white h-3 rounded-full transition-all"
              style={{ width: `${progressData.percentage}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {progressData.remaining} more hours to reach your weekly target
          </div>
        </div>
      </div>
      
      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="section-container">
          <h2 className="section-title">Weekly Summary</h2>
          <div className="text-sm mb-2">{dateRange}</div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Days Worked</div>
              <div className="text-3xl font-bold">{calculateDaysWorked()}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Total Hours</div>
              <div className="text-3xl font-bold">{calculateTotalHours()}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Overtime</div>
              <div className="text-3xl font-bold">{calculateOvertimeHours()}</div>
            </div>
          </div>
        </div>
        
        <div className="section-container">
          <h2 className="section-title">Weekly Trend</h2>
          <div className="text-sm mb-2">{dateRange}</div>
          
          <div className="h-[200px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#000000" barSize={24} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Export Data */}
      <div className="section-container mb-8">
        <h2 className="section-title">Export Data</h2>
        
        <div className="mb-4">
          <Label htmlFor="month-select" className="mb-2 block">Select Month</Label>
          <Input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-auto"
          />
        </div>
        
        <Button 
          className="w-full bg-black hover:bg-black/90 text-white flex items-center gap-2"
          onClick={() => alert('This feature will be implemented in the next version')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export to PDF
        </Button>
        
        <div className="mt-2 text-sm text-muted-foreground">
          Export your time tracking data for the selected month to a PDF file.
        </div>
      </div>
      
      {/* Activity */}
      <div className="section-container">
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
        
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className={cn(
              "flex flex-col items-center py-3",
              i === 0 && "border-l-4 border-l-black dark:border-l-white rounded-l-lg",
              i === 6 && "rounded-r-lg"
            )}>
              <div className="text-sm font-medium mb-2">{day}</div>
              <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full",
                i === 0 && "bg-black text-white"
              )}>
                {10 + i}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
