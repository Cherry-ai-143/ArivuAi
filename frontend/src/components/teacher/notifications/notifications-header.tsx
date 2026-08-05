import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications and alerts</p>
        </div>
      </div>
      <Button variant="outline" className="gap-2">
        <Trash2 className="w-4 h-4" />
        Clear All
      </Button>
    </div>
  );
}


