import { BarChart3 } from 'lucide-react';

export function ProgressHeader() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-orange-500" />
        <h1 className="text-3xl font-bold text-foreground">Student Progress</h1>
      </div>
      <p className="text-muted-foreground">Track individual student progress across all courses and assessments</p>
    </div>
  );
}


