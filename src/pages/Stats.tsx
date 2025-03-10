
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { calculateTotalDuration } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { generatePdfReport } from '@/utils/pdfUtils';
import { toast } from 'sonner';
import ActivityCalendar from '@/components/ActivityCalendar';

const Stats = () => {
  const { entries, workSchedule, viewMode, setViewMode } = useTimeEntries();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [exportType, setExportType] = useState<'month' | 'year'>('month');
  
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
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    const weekEntries = entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    const totalMinutes = calculateTotalDuration(weekEntries);
    return (totalMinutes / 60).toFixed(1);
  };
  
  // Calculate days worked
  const calculateDaysWorked = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    const uniqueDays = new Set();
    
    entries.forEach(entry => {
      const entryDate = parseISO(entry.date);
      if (entryDate >= weekStart && entryDate <= weekEnd) {
        uniqueDays.add(entry.date);
      }
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
  
  // Handle PDF export
  const handleExportPdf = async () => {
    let period = '';
    
    if (exportType === 'month') {
      period = selectedMonth;
    } else {
      period = selectedYear;
    }
    
    const success = await generatePdfReport(entries, period);
    
    if (success) {
      toast.success('Report exported successfully!');
    } else {
      toast.error('Failed to export report.');
    }
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
      
      {/* Weekly Summary & Trend */}
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
          <div className="flex justify-between items-center">
            <h2 className="section-title">Weekly Trend</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm mb-2">{dateRange}</div>
          
          <div className="h-[200px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Monthly Trend */}
      <div className="section-container mb-8">
        <div className="flex justify-between items-center">
          <h2 className="section-title">Monthly Trend</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => subMonths(prev, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => addMonths(prev, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm mb-6">{format(currentDate, 'MMMM yyyy')}</div>
        
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array.from({ length: 5 }).map((_, i) => ({
              name: `Week ${i + 1}`,
              hours: i === 1 ? 8 : 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#000000" barSize={36} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Export Data */}
      <div className="section-container mb-8">
        <h2 className="section-title">Export Data</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="export-type" className="mb-2 block">Export Type</Label>
            <div className="inline-flex rounded-md shadow-sm bg-slate-100 dark:bg-slate-800 p-1 mb-4">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-md h-9 px-4",
                  exportType === 'month' && "bg-white dark:bg-black shadow-sm"
                )}
                onClick={() => setExportType('month')}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-md h-9 px-4",
                  exportType === 'year' && "bg-white dark:bg-black shadow-sm"
                )}
                onClick={() => setExportType('year')}
              >
                Year
              </Button>
            </div>
            
            {exportType === 'month' ? (
              <div className="mb-4">
                <Label htmlFor="month-select" className="mb-2 block">Select Month</Label>
                <div className="relative">
                  <Input
                    id="month-select"
                    type="text"
                    value={format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}
                    className="w-full cursor-pointer pr-10"
                    onClick={() => setShowMonthPicker(true)}
                    readOnly
                  />
                  <div className="absolute right-3 top-[50%] transform -translate-y-[50%]">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <Label htmlFor="year-select" className="mb-2 block">Select Year</Label>
                <div className="relative">
                  <Input
                    id="year-select"
                    type="text"
                    value={selectedYear}
                    className="w-full cursor-pointer pr-10"
                    onClick={() => setShowYearPicker(true)}
                    readOnly
                  />
                  <div className="absolute right-3 top-[50%] transform -translate-y-[50%]">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
          </div>
            
          <div className="self-end">
            <Button 
              className="w-full bg-black hover:bg-black/90 text-white flex items-center gap-2"
              onClick={handleExportPdf}
            >
              <Download className="h-4 w-4" />
              Export to PDF
            </Button>
            
            <div className="mt-2 text-sm text-muted-foreground">
              Export your time tracking data for the selected {exportType} to a PDF file.
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Calendar */}
      <ActivityCalendar />
      
      {/* Month Picker Sheet */}
      <Sheet open={showMonthPicker} onOpenChange={setShowMonthPicker}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Select Month and Year</SheetTitle>
            <SheetDescription>
              Choose the month for your export
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <div className="inline-flex rounded-md shadow-sm bg-slate-100 dark:bg-slate-800 p-1 mb-6">
              <Button
                variant="ghost"
                className="rounded-md h-9 px-4 bg-white dark:bg-black shadow-sm"
              >
                Month
              </Button>
              <Button
                variant="ghost"
                className="rounded-md h-9 px-4"
                onClick={() => {
                  setExportType('year');
                  setShowMonthPicker(false);
                  setShowYearPicker(true);
                }}
              >
                Year
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Array.from({ length: 10 }).map((_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <Button
                    key={year}
                    variant="outline"
                    className={cn(
                      "h-12",
                      parseInt(selectedMonth.split('-')[0]) === year && "bg-black text-white dark:bg-white dark:text-black"
                    )}
                    onClick={() => {
                      setSelectedMonth(`${year}-${selectedMonth.split('-')[1]}`);
                    }}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => {
                const month = i + 1;
                const monthStr = month.toString().padStart(2, '0');
                const isSelected = selectedMonth.split('-')[1] === monthStr;
                
                return (
                  <Button
                    key={month}
                    variant="outline"
                    className={cn(
                      "h-12",
                      isSelected && "bg-black text-white dark:bg-white dark:text-black"
                    )}
                    onClick={() => {
                      const yearPart = selectedMonth.split('-')[0];
                      setSelectedMonth(`${yearPart}-${monthStr}`);
                      setShowMonthPicker(false);
                    }}
                  >
                    {format(new Date(2000, i, 1), 'MMM')}
                  </Button>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowMonthPicker(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setShowMonthPicker(false);
                }}
                className="w-full ml-2"
              >
                Done
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Year Picker Sheet */}
      <Sheet open={showYearPicker} onOpenChange={setShowYearPicker}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Select Year</SheetTitle>
            <SheetDescription>
              Choose the year for your export
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <div className="inline-flex rounded-md shadow-sm bg-slate-100 dark:bg-slate-800 p-1 mb-6">
              <Button
                variant="ghost"
                className="rounded-md h-9 px-4"
                onClick={() => {
                  setExportType('month');
                  setShowYearPicker(false);
                  setShowMonthPicker(true);
                }}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                className="rounded-md h-9 px-4 bg-white dark:bg-black shadow-sm"
              >
                Year
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 10 }).map((_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <Button
                    key={year}
                    variant="outline"
                    className={cn(
                      "h-12",
                      selectedYear === year.toString() && "bg-black text-white dark:bg-white dark:text-black"
                    )}
                    onClick={() => {
                      setSelectedYear(year.toString());
                      setShowYearPicker(false);
                    }}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowYearPicker(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setShowYearPicker(false);
                }}
                className="w-full ml-2"
              >
                Done
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Stats;
