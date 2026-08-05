'use client'

import { TrendingUp, Users, Zap, Award } from 'lucide-react'

interface Insight {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  value: string
  color: string
}

const insights: Insight[] = [
  {
    id: '1',
    icon: <TrendingUp className="size-5" />,
    title: 'Engagement Rate',
    description: '85% of students engaging with your content.',
    value: '85%',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: '2',
    icon: <Award className="size-5" />,
    title: 'Content Effectiveness',
    description: 'Your quizzes are 20% more effective than last month.',
    value: '+20%',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: '3',
    icon: <Users className="size-5" />,
    title: 'Student Improvement',
    description: 'Average score improvement of 18% across all courses.',
    value: '+18%',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: '4',
    icon: <Zap className="size-5" />,
    title: 'Quiz Performance',
    description: 'Students completing 25% more quizzes this week.',
    value: '+25%',
    color: 'bg-orange-100 text-orange-600',
  },
]

export function TeachingInsights() {
  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Teaching Insights
      </h3>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${insight.color}`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {insight.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-foreground">
                  {insight.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
        View Full Insights
      </button>
    </div>
  )
}


