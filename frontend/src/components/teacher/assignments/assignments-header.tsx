import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AssignmentsHeaderProps {
  onCreateClick: () => void;
}

export function AssignmentsHeader({ onCreateClick }: AssignmentsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-1">Create and grade student assignments</p>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Assignment
      </Button>
    </div>
  );
}


