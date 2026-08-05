import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

export function StudentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all your enrolled students</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" />
          Invite Student
        </Button>
      </div>
    </div>
  );
}


