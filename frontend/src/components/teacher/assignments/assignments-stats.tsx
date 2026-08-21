import { AssignmentStats } from '@/types/assignment';
import { BookOpen, CheckCircle, Clock, Percent, Award } from 'lucide-react';

interface AssignmentsStatsProps {
  stats?: AssignmentStats;
  isLoading?: boolean;
}

export function AssignmentsStats({ stats, isLoading }: AssignmentsStatsProps) {
  const cards = [
    {
      title: 'Total Assignments',
      value: stats?.total_assignments ?? 0,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Active',
      value: stats?.active_assignments ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Pending Review',
      value: stats?.pending_review_count ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Avg Submission Rate',
      value: `${stats?.average_submission_rate ?? 0}%`,
      icon: Percent,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Average Score',
      value: `${stats?.average_score ?? 0}%`,
      icon: Award,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl border ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
