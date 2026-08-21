import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface AssignmentsHeaderProps {
  onAIGenerateClick: () => void;
}

export function AssignmentsHeader({ onAIGenerateClick }: AssignmentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create, publish, and grade student learning assignments
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onAIGenerateClick}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          Generate with AI
        </Button>

        <Link href="/teacher-dashboard/assignments/create">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-sm font-medium">
            <Plus className="w-4 h-4" />
            Create Assignment
          </Button>
        </Link>
      </div>
    </div>
  );
}
