'use client'

import {
  BookOpen,
  Users,
  CheckSquare,
  ClipboardList,
} from 'lucide-react'
import { useTeacherDashboard } from '@/hooks/useDashboard'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

function StatCard({ icon, label, value, change, changeType }: StatCardProps) {
  const changeColor = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-600',
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          <p className={`text-xs font-medium ${changeColor[changeType]} mt-3`}>
            {change}
          </p>
        </div>
        <div className="rounded-xl bg-accent/10 p-3 text-accent">{icon}</div>
      </div>
    </div>
  )
}

export function TeacherTopStats() {
  const { data, isLoading } = useTeacherDashboard()
  const statsData = data?.statistics

  const stats = [
    {
      icon: <BookOpen className="size-6" />,
      label: 'Courses Created',
      value: isLoading ? '...' : String(statsData?.total_courses ?? 0),
      change: 'Active courses',
      changeType: 'positive' as const,
    },
    {
      icon: <Users className="size-6" />,
      label: 'Students Enrolled',
      value: isLoading ? '...' : String(statsData?.total_students ?? 0),
      change: 'Active learners',
      changeType: 'positive' as const,
    },
    {
      icon: <CheckSquare className="size-6" />,
      label: 'Questions in Bank',
      value: isLoading ? '...' : String(statsData?.total_questions ?? 0),
      change: 'AI & custom bank',
      changeType: 'positive' as const,
    },
    {
      icon: <ClipboardList className="size-6" />,
      label: 'Assessments Created',
      value: isLoading ? '...' : String(statsData?.total_assessments ?? 0),
      change: 'Active assessments',
      changeType: 'positive' as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-border bg-card p-6 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  )
}
