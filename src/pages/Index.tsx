import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import TimeDisplay from '@/components/ui-components/TimeDisplay';
import EntryCard from '@/components/ui-components/EntryCard';
import ManualEntryDialog from '@/components/ui-components/ManualEntryDialog';
import ActivityCalendar from '@/components/ActivityCalendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatTime, formatDurationCompact } from '@/utils/timeUtils';

const Index = () => {
  const { entries, activeTimerId, startTimer, stopTimer, deleteEntry } = useTimeEntries();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false);
  const [clockOutNotes, setClockOutNotes] = useState('');
  
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
  
  const getTodayHours = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => 
      entry.date === today && entry.id !== activeTimerId && entry.timeOut
    );
    
    const totalMinutes = todayEntries.reduce((total, entry) => total + entry.duration, 0);
    return Math.floor(totalMinutes / 60);
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
        
        <TimeDisplay 
          isRunning={!!activeTimerId} 
          startTime={activeEntry?.timeIn}
          className="mb-8"
        />
        
        {activeTimerId ? (
          <Button className="clock-button" onClick={handleClockOut}>
            Clock Out
          </Button>
        ) : (
          <Button className="clock-button" onClick={handleClockIn}>
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
          <Button variant="outline" onClick={() => toast.info('This feature will be available in the next update')}>
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
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
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
    </div>
  );
};

export default Index;
