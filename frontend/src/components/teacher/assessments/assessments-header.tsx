import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AssessmentsHeaderProps {
  onCreateClick: () => void;
}

export function AssessmentsHeader({ onCreateClick }: AssessmentsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
        <p className="text-muted-foreground mt-1">Create and manage quizzes, exams, and assignments</p>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Assessment
      </Button>
    </div>
  );
}


