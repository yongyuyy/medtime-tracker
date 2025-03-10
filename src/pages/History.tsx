
import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { CalendarIcon, Edit2, Plus, Trash2, CalendarRange } from 'lucide-react';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { formatTime, formatDurationCompact } from '@/utils/timeUtils';
import { TimeEntry } from '@/types';
import { cn } from '@/lib/utils';
import ManualEntryDialog from '@/components/ui-components/ManualEntryDialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';

const History = () => {
  const { entries, updateEntry, deleteEntry } = useTimeEntries();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState<'single' | 'range' | 'all'>('all');
  
  // Edit entry state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Filter entries based on selected filter type
  useEffect(() => {
    let filtered = [...entries];
    
    if (filterType === 'single' && selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = entries.filter(entry => entry.date === selectedDateStr);
    } 
    else if (filterType === 'range' && dateRange?.from) {
      filtered = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to });
        } else if (dateRange.from) {
          // If only from date is selected, match that exact date
          return format(entryDate, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd');
        }
        return true;
      });
    }
    
    // Sort filtered entries by date (newest first)
    const sortedEntries = filtered.sort((a, b) => {
      // Sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setFilteredEntries(sortedEntries);
  }, [entries, selectedDate, dateRange, filterType]);
  
  // Handle quick filter selection
  const handleQuickFilter = (type: string) => {
    const today = new Date();
    
    switch (type) {
      case 'today':
        setFilterType('single');
        setSelectedDate(today);
        setDateRange(undefined);
        break;
      case 'thisWeek':
        setFilterType('range');
        setDateRange({
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        });
        setSelectedDate(undefined);
        break;
      case 'thisMonth':
        setFilterType('range');
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        setSelectedDate(undefined);
        break;
      case 'all':
        setFilterType('all');
        setSelectedDate(undefined);
        setDateRange(undefined);
        break;
    }
  };
  
  // Get display text for filter
  const getFilterDisplayText = () => {
    if (filterType === 'single' && selectedDate) {
      return format(selectedDate, 'PPP');
    } else if (filterType === 'range' && dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, 'PPP')} to ${format(dateRange.to, 'PPP')}`;
      }
      return format(dateRange.from, 'PPP');
    }
    return 'All entries';
  };
  
  // Handle edit button click
  const handleEditClick = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditDate(parseISO(entry.date));
    setEditTimeIn(entry.timeIn);
    setEditTimeOut(entry.timeOut);
    setEditNotes(entry.notes || '');
    setIsEditDialogOpen(true);
  };
  
  // Handle save edit
  const handleSaveEdit = () => {
    if (editingEntry && editDate) {
      updateEntry(editingEntry.id, {
        date: format(editDate, 'yyyy-MM-dd'),
        timeIn: editTimeIn,
        timeOut: editTimeOut,
        notes: editNotes.trim() || undefined,
      });
      
      setIsEditDialogOpen(false);
      setEditingEntry(null);
    }
  };
  
  // Handle delete confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id);
    }
  };
  
  return (
    <div className="page-container">
      <h1 className="page-title">History</h1>
      <p className="page-subtitle">View and manage your time entries</p>
      
      {/* Date filter and add entry button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select
            value={filterType}
            onValueChange={(value: 'single' | 'range' | 'all') => {
              setFilterType(value);
              if (value === 'all') {
                setSelectedDate(undefined);
                setDateRange(undefined);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entries</SelectItem>
              <SelectItem value="single">Single date</SelectItem>
              <SelectItem value="range">Date range</SelectItem>
            </SelectContent>
          </Select>
          
          {filterType === 'single' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
          
          {filterType === 'range' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickFilter('today')}
              className={cn(filterType === 'single' && selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && "bg-slate-100 dark:bg-slate-800")}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickFilter('thisWeek')}
              className={cn(filterType === 'range' && dateRange?.from && format(dateRange.from, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') && "bg-slate-100 dark:bg-slate-800")}
            >
              This Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickFilter('thisMonth')}
              className={cn(filterType === 'range' && dateRange?.from && format(dateRange.from, 'yyyy-MM-dd') === format(startOfMonth(new Date()), 'yyyy-MM-dd') && "bg-slate-100 dark:bg-slate-800")}
            >
              This Month
            </Button>
            {(filterType !== 'all' || selectedDate || dateRange) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('all')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        
        <ManualEntryDialog />
      </div>
      
      {/* Entries table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Time In</th>
                <th className="text-left p-4 font-medium">Time Out</th>
                <th className="text-left p-4 font-medium">Duration</th>
                <th className="text-left p-4 font-medium">Notes</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      {formatTime(entry.timeIn)}
                    </td>
                    <td className="p-4">
                      {entry.timeOut ? formatTime(entry.timeOut) : 'In progress'}
                    </td>
                    <td className="p-4">
                      {entry.duration ? formatDurationCompact(entry.duration) : '-'}
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {entry.notes || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {filterType !== 'all'
                      ? 'No entries found for the selected date(s)' 
                      : 'No entries found. Start tracking your time!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-up">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Make changes to your time entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-date"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !editDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(date) => date && setEditDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-time-in">Time In</Label>
                <Input
                  id="edit-time-in"
                  type="time"
                  value={editTimeIn}
                  onChange={(e) => setEditTimeIn(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time-out">Time Out</Label>
                <Input
                  id="edit-time-out"
                  type="time"
                  value={editTimeOut}
                  onChange={(e) => setEditTimeOut(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                placeholder="Add any additional information..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
