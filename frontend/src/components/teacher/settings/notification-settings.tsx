import { Button } from '@/components/ui/button';

export function NotificationSettings() {
  const categories = [
    {
      title: 'Student Submissions',
      description: 'When students submit assignments or complete assessments',
      settings: ['Email', 'In-app'],
    },
    {
      title: 'Course Updates',
      description: 'When there are updates to your courses',
      settings: ['Email', 'In-app', 'SMS'],
    },
    {
      title: 'Engagement Alerts',
      description: 'When students have low engagement or are at risk',
      settings: ['Email', 'In-app'],
    },
    {
      title: 'System Notifications',
      description: 'Important system updates and maintenance alerts',
      settings: ['Email'],
    },
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.title} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{category.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            {category.settings.map((setting) => (
              <label key={setting} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">{setting} notifications</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          Save Preferences
        </Button>
        <Button variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}


