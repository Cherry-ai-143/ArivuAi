'use client'

import { motion } from 'motion/react'
import { Clock, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useStudentDashboard } from '@/hooks/useDashboard'

export function UpcomingAssessments() {
  const { data, isLoading } = useStudentDashboard()
  const pendingQuizzes = data?.pending_quizzes || []

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="h-5 w-40 bg-muted rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-foreground">
            Upcoming Assessments
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Stay on track with pending quizzes
          </p>
        </div>
        <Link
          href="/dashboard/assessments"
          className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
        >
          View All
        </Link>
      </div>

      {pendingQuizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
          <CheckCircle className="mx-auto size-6 text-emerald-500" />
          <p className="text-sm font-semibold text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground">You have no pending assessments.</p>
        </div>
      ) : (
        /* List */
        <div className="space-y-3">
          {pendingQuizzes.slice(0, 3).map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
              className="p-3 rounded-lg border border-border bg-muted/30 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {quiz.title}
                    </p>
                    <AlertCircle className="size-3.5 text-accent flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {quiz.total_marks ? `${quiz.total_marks} Marks` : 'Assessment'}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>

              <div className="mt-2 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" />
                  {quiz.duration_minutes ? `${quiz.duration_minutes} mins` : '30 mins'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/dashboard/assessments"
        className="mt-4 block w-full text-center rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        View All Assessments
      </Link>
    </motion.div>
  )
}
