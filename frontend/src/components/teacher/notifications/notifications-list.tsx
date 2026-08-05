import { Trash2, CheckCircle } from 'lucide-react';

export function NotificationsList() {
  const notifications = [
    {
      id: 1,
      type: 'submission',
      title: '3 new assignments submitted',
      message: 'Students have submitted assignments for Python Programming course',
      time: '2 hours ago',
      read: false,
      icon: '📝',
    },
    {
      id: 2,
      type: 'system',
      title: 'System maintenance scheduled',
      message: 'Maintenance window on Jan 20 from 2-4 AM UTC',
      time: '4 hours ago',
      read: false,
      icon: '⚙️',
    },
    {
      id: 3,
      type: 'course',
      title: 'Course enrollment updated',
      message: '5 new students enrolled in Web Development',
      time: '1 day ago',
      read: true,
      icon: '👥',
    },
    {
      id: 4,
      type: 'alert',
      title: 'Low engagement alert',
      message: 'Michael Brown has low engagement. Last activity 3 days ago',
      time: '2 days ago',
      read: true,
      icon: '⚠️',
    },
    {
      id: 5,
      type: 'submission',
      title: 'Quiz completed by 25 students',
      message: 'Data Science quiz has been completed',
      time: '3 days ago',
      read: true,
      icon: '✅',
    },
  ];

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-4 p-4 rounded-lg border ${
            notification.read
              ? 'bg-gray-50 border-gray-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <span className="text-2xl">{notification.icon}</span>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
          </div>

          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          )}

          <div className="flex gap-2 flex-shrink-0">
            <button className="text-gray-400 hover:text-gray-600">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button className="text-red-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


