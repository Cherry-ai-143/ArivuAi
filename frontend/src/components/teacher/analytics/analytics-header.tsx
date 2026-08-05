import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnalyticsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into your teaching performance</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Last 30 Days
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          Export Report
        </Button>
      </div>
    </div>
  );
}


