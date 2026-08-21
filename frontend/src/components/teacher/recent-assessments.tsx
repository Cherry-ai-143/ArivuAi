'use client'

import { ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { useTeacherDashboard } from '@/hooks/useDashboard'

export function RecentAssessments() {
  const { data, isLoading } = useTeacherDashboard()
  const assessmentsList = data?.recent_assessments || []

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-sm p-8">
        <div className="h-6 w-44 bg-muted rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Assessments</h3>
        <Link
          href="/teacher-dashboard/assessments"
          className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
        >
          View All
        </Link>
      </div>

      {assessmentsList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <ClipboardCheck className="mx-auto size-8 text-muted-foreground" />
          <h4 className="font-semibold text-foreground">No recent assessments</h4>
          <p className="text-xs text-muted-foreground font-medium">Create your first quiz or exam for your students.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-2">
                  Assessment Title
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-2">
                  Marks
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-2">
                  Duration
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-2">
                  Attempts
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {assessmentsList.map((assessment) => (
                <tr key={assessment.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">
                    <p className="text-sm font-medium text-foreground">
                      {assessment.title}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs font-medium text-foreground">
                      {assessment.total_marks ?? 0} Marks
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs text-muted-foreground">
                      {assessment.duration_minutes ? `${assessment.duration_minutes} mins` : '20 mins'}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs font-medium text-foreground">
                      {assessment.attempts_count ?? 0}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      assessment.status === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {assessment.status || 'DRAFT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
