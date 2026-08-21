'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { TrendingUp, ArrowRight, Award } from 'lucide-react'

import { useTeacherDashboard } from '@/hooks/useDashboard'

export function TopPerformingStudents() {
  const router = useRouter()
  const { data, isLoading } = useTeacherDashboard()

  const studentsList = data?.top_performing_students || []

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm p-8 space-y-6">
        <div className="h-6 w-56 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/40 border border-border animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Top Performing Students
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Based on completed quiz and assessment scores
          </p>
        </div>
        <button
          onClick={() => router.push('/teacher-dashboard/students')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-muted rounded-lg transition-colors"
        >
          View All <ArrowRight className="size-4" />
        </button>
      </div>

      {studentsList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <Award className="mx-auto size-8 text-muted-foreground" />
          <h4 className="font-semibold text-foreground text-sm">No student performance data yet</h4>
          <p className="text-xs text-muted-foreground">
            Top performing students will appear here once students submit assessment attempts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {studentsList.map((student) => (
            <div
              key={student.id}
              className="rounded-xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Rank Badge */}
              <div className="flex items-start justify-between mb-2">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-sm">
                  #{student.rank}
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center mb-3">
                <Image
                  src={student.avatar}
                  alt={student.name}
                  width={52}
                  height={52}
                  className="w-13 h-13 rounded-full mb-2 border border-border"
                />
                <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                  {student.name}
                </h4>
              </div>

              {/* Score */}
              <div className="py-2 border-y border-border/50 mb-3">
                <p className="text-[11px] text-muted-foreground text-center">
                  Average Score
                </p>
                <p className="text-base font-bold text-foreground text-center">
                  {student.score}%
                </p>
              </div>

              {/* Improvement */}
              {student.improvement > 0 ? (
                <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-semibold">
                  <TrendingUp className="size-3" />
                  +{student.improvement}% improvement
                </div>
              ) : (
                <div className="text-center text-[11px] text-muted-foreground">
                  Active learner
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


