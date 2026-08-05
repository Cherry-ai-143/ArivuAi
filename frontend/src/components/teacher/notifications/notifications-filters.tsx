export function NotificationsFilters() {
  return (
    <div className="flex items-center gap-2">
      <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
        <option>All Notifications</option>
        <option>Unread</option>
        <option>Student Submissions</option>
        <option>System Alerts</option>
        <option>Course Updates</option>
      </select>

      <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
        <option>All Time</option>
        <option>Last 24 Hours</option>
        <option>This Week</option>
        <option>This Month</option>
      </select>

      <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm ml-auto">
        <option>Sort: Newest</option>
        <option>Sort: Oldest</option>
        <option>Sort: Unread First</option>
      </select>
    </div>
  );
}


