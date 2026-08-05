import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface QuizzesHeaderProps {
  onCreateClick: () => void;
  onGenerateClick: () => void;
}

export function QuizzesHeader({ onCreateClick, onGenerateClick }: QuizzesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
        <p className="text-muted-foreground mt-1">Create, manage, assign, and monitor AI-powered and manually created quizzes.</p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={onCreateClick}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </Button>
        <Button
          onClick={onGenerateClick}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
      </div>
    </div>
  );
}
