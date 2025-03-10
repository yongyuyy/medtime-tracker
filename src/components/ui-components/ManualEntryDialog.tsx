
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { cn } from '@/lib/utils';
import { getCurrentDate, getCurrentTime } from '@/utils/timeUtils';

interface ManualEntryDialogProps {
  triggerClassName?: string;
}

const ManualEntryDialog: React.FC<ManualEntryDialogProps> = ({ 
  triggerClassName 
}) => {
  const { addEntry, workSchedule } = useTimeEntries();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [timeIn, setTimeIn] = useState(workSchedule.defaultStartTime);
  const [timeOut, setTimeOut] = useState(workSchedule.defaultEndTime);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addEntry({
      date: format(date, 'yyyy-MM-dd'),
      timeIn,
      timeOut,
      notes: notes.trim() || undefined,
    });
    
    // Reset form and close dialog
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setDate(new Date());
    setTimeIn(workSchedule.defaultStartTime);
    setTimeOut(workSchedule.defaultEndTime);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("bg-black hover:bg-black/90 text-white", triggerClassName)}>
          Add Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] animate-scale-up">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
          <DialogDescription>
            Add a new time entry for your work hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="timeIn">Time In</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="timeIn"
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeOut">Time Out</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="timeOut"
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualEntryDialog;
