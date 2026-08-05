import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MaterialsHeaderProps {
  onCreateClick: () => void;
}

export function MaterialsHeader({ onCreateClick }: MaterialsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Study Materials</h1>
        <p className="text-muted-foreground mt-1">Manage PDFs, videos, and other learning resources</p>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        Upload Material
      </Button>
    </div>
  );
}


