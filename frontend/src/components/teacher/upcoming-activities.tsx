'use client'

import { useRouter } from 'next/navigation'
import { CheckSquare, Zap, File, ArrowRight, CalendarX } from 'lucide-react'
import { useTeacherDashboard } from '@/hooks/useDashboard'

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
  const router = useRouter()
  const { data, isLoading } = useTeacherDashboard()

  const activitiesList = data?.upcoming_activities || []

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm p-8 space-y-4">
        <div className="h-6 w-44 bg-muted rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Upcoming Activities
        </h3>

        {activitiesList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
            <CalendarX className="mx-auto size-8 text-muted-foreground" />
            <h4 className="font-semibold text-foreground text-sm">No upcoming activities</h4>
            <p className="text-xs text-muted-foreground">
              Newly created quizzes or assessments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activitiesList.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
              >
                <div className="pt-1 text-accent">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {activity.subtitle}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-foreground">
                    {activity.date} <br /> {activity.time}
                  </p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md mt-1 ${getBadgeColor(activity.type)}`}>
                    {activity.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/teacher-dashboard/quizzes')}
        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
      >
        View All Activities <ArrowRight className="size-4" />
      </button>
    </div>
  )
}


