'use client';

import { NotificationsHeader } from '@/components/teacher/notifications/notifications-header';
import { NotificationsFilters } from '@/components/teacher/notifications/notifications-filters';
import { NotificationsList } from '@/components/teacher/notifications/notifications-list';

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <NotificationsHeader />
      <NotificationsFilters />
      <NotificationsList />
    </div>
  );
}


