import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface LessonHeaderProps {
  onCreateClick: () => void;
}

export function LessonHeader({ onCreateClick }: LessonHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lessons</h1>
        <p className="text-muted-foreground mt-1">Manage your course lessons and content</p>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Lesson
      </Button>
    </div>
  );
}


