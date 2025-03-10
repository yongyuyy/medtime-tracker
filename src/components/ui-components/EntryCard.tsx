
import React from 'react';
import { format } from 'date-fns';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, formatDurationCompact, getTimeAgo } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/types';

interface EntryCardProps {
  entry: TimeEntry;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const EntryCard: React.FC<EntryCardProps> = ({ 
  entry,
  onEdit,
  onDelete,
  className
}) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <div className={cn("border rounded-lg p-4 transition-all hover:border-medtime-300", className)}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">
            {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {formatTime(entry.timeIn)} - {formatTime(entry.timeOut)}
            </span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full ml-2">
              {formatDurationCompact(entry.duration)}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {getTimeAgo(entry.updatedAt)}
        </div>
      </div>

      {entry.notes && (
        <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
          {entry.notes}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EntryCard;
