
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import TimeDisplay from '@/components/ui-components/TimeDisplay';
import ManualEntryDialog from '@/components/ui-components/ManualEntryDialog';
import ActivityCalendar from '@/components/ActivityCalendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { formatTime, formatDurationCompact } from '@/utils/timeUtils';
import { Clock, Edit2, Trash2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';

const Index = () => {
  const { entries, activeTimerId, startTimer, stopTimer, deleteEntry, deleteAllEntries, updateEntry } = useTimeEntries();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false);
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Edit entry state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const activeEntry = entries.find(entry => entry.id === activeTimerId);
  
  const recentEntries = entries
    .filter(entry => entry.id !== activeTimerId)
    .slice(0, 3);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClockIn = () => {
    startTimer();
  };
  
  const handleClockOut = () => {
    setIsClockOutDialogOpen(true);
  };
  
  const submitClockOut = () => {
    stopTimer(clockOutNotes);
    setClockOutNotes('');
    setIsClockOutDialogOpen(false);
  };
  
  const confirmDeleteAll = () => {
    deleteAllEntries();
    setDeleteConfirmOpen(false);
  };
  
  const getTodayHours = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => 
      entry.date === today && entry.id !== activeTimerId && entry.timeOut
    );
    
    const totalMinutes = todayEntries.reduce((total, entry) => total + entry.duration, 0);
    return Math.floor(totalMinutes / 60);
  };
  
  // Handle edit button click
  const handleEditClick = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditDate(new Date(entry.date));
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
  
  return (
    <div className="page-container">
      <div className="section-container mb-8 flex flex-col items-center py-10">
        <div className="mb-4 text-center text-xs text-muted-foreground uppercase tracking-wider">
          TODAY
        </div>
        <div className="text-xl font-medium mb-6">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
        
        {activeTimerId ? (
          <TimeDisplay 
            isRunning={true} 
            startTime={activeEntry?.timeIn}
            className="mb-8"
          />
        ) : (
          <TimeDisplay 
            showLocalTime={true}
            className="mb-8"
          />
        )}
        
        {activeTimerId ? (
          <div className="flex flex-col items-center">
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6"
              onClick={handleClockOut}
            >
              Clock Out
            </Button>
            {activeEntry && (
              <div className="mt-4 text-sm text-muted-foreground">
                Working since {formatTime(activeEntry.timeIn)}
              </div>
            )}
          </div>
        ) : (
          <Button 
            className="bg-black hover:bg-black/80 text-white dark:bg-white dark:text-black dark:hover:bg-white/80 rounded-full px-8 py-6"
            onClick={handleClockIn}
          >
            Clock In
          </Button>
        )}
      </div>
      
      <div className="section-container mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title mb-0">Today's Summary</h2>
          <ManualEntryDialog />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Hours Worked</div>
            <div className="text-4xl font-bold">{getTodayHours()}</div>
          </div>
        </div>
      </div>
      
      <div className="section-container mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title mb-0">Recent Entries</h2>
          <Button 
            variant="outline" 
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Entries
          </Button>
        </div>
        
        {recentEntries.length > 0 ? (
          <div className="divide-y">
            {recentEntries.map(entry => (
              <div key={entry.id} className="py-4">
                <div className="mb-2 font-medium">
                  {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg">
                      {formatTime(entry.timeIn)} - {formatTime(entry.timeOut)}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDurationCompact(entry.duration)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleEditClick(entry)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No recent entries found. Start tracking your time!
          </div>
        )}
      </div>
      
      <ActivityCalendar />
      
      <Dialog open={isClockOutDialogOpen} onOpenChange={setIsClockOutDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-up">
          <DialogHeader>
            <DialogTitle>Clock Out</DialogTitle>
            <DialogDescription>
              Add any notes about this time entry before clocking out.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add notes (optional)..."
              value={clockOutNotes}
              onChange={(e) => setClockOutNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClockOutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitClockOut}>
              Clock Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Entries</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all time entries? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAll}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

export default Index;
