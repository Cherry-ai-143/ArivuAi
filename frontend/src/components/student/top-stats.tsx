'use client'

import { motion } from 'motion/react'
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  Flame,
  ArrowUp,
} from 'lucide-react'

import { useStudentDashboard } from '@/hooks/useDashboard'

export function TopStats() {
  const { data, isLoading } = useStudentDashboard()
  const statsData = data?.statistics

  const stats = [
    {
      label: 'Courses Enrolled',
      value: isLoading ? '...' : String(statsData?.total_courses ?? 0),
      icon: BookOpen,
      change: '+2 this month',
      color: 'from-blue-500/10 to-blue-600/5',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'AI Quizzes Completed',
      value: isLoading ? '...' : String(statsData?.quizzes_taken ?? 0),
      icon: Sparkles,
      change: '+18 this week',
      color: 'from-purple-500/10 to-purple-600/5',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Average Score',
      value: isLoading ? '...' : `${statsData?.average_score ?? 0}%`,
      icon: TrendingUp,
      change: '+6% improvement',
      color: 'from-orange-500/10 to-orange-600/5',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Study Streak',
      value: isLoading ? '...' : String(data?.learning_streak?.current_streak ?? 0),
      icon: Flame,
      change: 'days in a row',
      color: 'from-red-500/10 to-red-600/5',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-border bg-card p-5 animate-pulse">
            <div className="size-9 rounded-lg bg-muted mb-3" />
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative rounded-2xl border border-border bg-gradient-to-br from-white to-muted p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
          >
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

            <div className="relative z-10">
              {/* Icon */}
              <div className={`${stat.iconBg} w-fit rounded-lg p-2.5 mb-3`}>
                <Icon className={`size-5 ${stat.iconColor}`} />
              </div>

              {/* Content */}
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-foreground font-serif">
                {stat.value}
              </p>

              {/* Change indicator */}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600">
                <ArrowUp className="size-3.5" />
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
