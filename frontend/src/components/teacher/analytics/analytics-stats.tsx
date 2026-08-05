import { TrendingUp, Users, BookOpen, Target } from 'lucide-react';

export function AnalyticsStats() {
  const stats = [
    {
      label: 'Total Engagement',
      value: '87%',
      change: '+12%',
      icon: TrendingUp,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Students',
      value: '342',
      change: '+24%',
      icon: Users,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Course Completion',
      value: '76%',
      change: '+8%',
      icon: BookOpen,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Avg Assessment Score',
      value: '78%',
      change: '+5%',
      icon: Target,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-green-600">{stat.change}</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}


