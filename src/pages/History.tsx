
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Edit2, Plus, Trash2 } from 'lucide-react';
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

const History = () => {
  const { entries, updateEntry, deleteEntry } = useTimeEntries();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  
  // Edit entry state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Filter entries by selected date
  useEffect(() => {
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      setFilteredEntries(
        entries.filter(entry => entry.date === selectedDateStr)
      );
    } else {
      const sortedEntries = [...entries].sort((a, b) => {
        // Sort by date descending
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setFilteredEntries(sortedEntries);
    }
  }, [entries, selectedDate]);
  
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
      <div className="flex justify-between items-center mb-6">
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
              {selectedDate ? format(selectedDate, 'PPP') : <span>All entries</span>}
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
        
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto ml-2"
            onClick={() => setSelectedDate(undefined)}
          >
            Clear filter
          </Button>
        )}
        
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
                    {selectedDate 
                      ? 'No entries found for the selected date' 
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
