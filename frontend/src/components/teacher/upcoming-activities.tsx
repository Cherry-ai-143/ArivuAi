'use client'

import { CheckSquare, Zap, File, ArrowRight } from 'lucide-react'

interface Activity {
  id: string
  title: string
  subtitle: string
  time: string
  date: string
  type: 'quiz' | 'test' | 'assignment'
  badge: string
}

const activities: Activity[] = [
  {
    id: '1',
    title: 'Data Structures Quiz',
    subtitle: 'DSA Basics',
    date: 'MAY',
    time: '10:00 AM',
    type: 'quiz',
    badge: 'Quiz',
  },
  {
    id: '2',
    title: 'Machine Learning Test',
    subtitle: 'Supervised Learning',
    date: 'MAY',
    time: '02:00 PM',
    type: 'test',
    badge: 'Test',
  },
  {
    id: '3',
    title: 'Python Assignment',
    subtitle: 'Functions & Modules',
    date: 'MAY',
    time: '11:59 PM',
    type: 'assignment',
    badge: 'Assignment',
  },
]

function getActivityIcon(type: string) {
  switch (type) {
    case 'quiz':
      return <CheckSquare className="size-5" />
    case 'test':
      return <Zap className="size-5" />
    case 'assignment':
      return <File className="size-5" />
    default:
      return <CheckSquare className="size-5" />
  }
}

function getBadgeColor(type: string) {
  switch (type) {
    case 'quiz':
      return 'bg-orange-100 text-orange-700'
    case 'test':
      return 'bg-purple-100 text-purple-700'
    case 'assignment':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function UpcomingActivities() {
  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Upcoming Activities
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
          >
            <div className="pt-1 text-accent">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.subtitle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">
                {activity.date} <br /> {activity.time}
              </p>
              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-md mt-2 ${getBadgeColor(activity.type)}`}>
                {activity.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">
        View All Activities <ArrowRight className="size-4" />
      </button>
    </div>
  )
}


