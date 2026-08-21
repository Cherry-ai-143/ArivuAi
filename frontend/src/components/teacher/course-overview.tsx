'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowRight } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useTeacherDashboard } from '@/hooks/useDashboard'

const COLORS = ['#10b981', '#3b82f6', '#ef4444']

export function CourseOverview() {
  const router = useRouter()
  const { data, isLoading } = useTeacherDashboard()

  const overview = data?.course_overview
  const completed = overview?.completed ?? 0
  const inProgress = overview?.in_progress ?? 0
  const notStarted = overview?.not_started ?? 0

  const totalStudents = overview?.total_students ?? (completed + inProgress + notStarted)

  const chartData = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Not Started', value: notStarted },
  ]

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm p-8 space-y-4">
        <div className="h-6 w-44 bg-muted rounded animate-pulse" />
        <div className="h-40 w-40 mx-auto rounded-full bg-muted/50 animate-pulse" />
        <div className="space-y-2 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-muted/60 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Course Overview
        </h3>

        {totalStudents === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-border rounded-xl">
            <p className="font-semibold text-foreground text-sm">No students enrolled yet</p>
            <p className="text-xs text-muted-foreground">
              Students who enroll in your courses will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Enrolled Students</p>
            </div>
          </div>
        )}

        {totalStudents > 0 && (
          <div className="mt-8 space-y-3 border-t border-border pt-6">
            {chartData.map((item, idx) => {
              const pct = totalStudents > 0 ? ((item.value / totalStudents) * 100).toFixed(0) : '0'
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {item.value} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/teacher-dashboard/analytics')}
        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
      >
        View Detailed Analytics <ArrowRight className="size-4" />
      </button>
    </div>
  )
}


