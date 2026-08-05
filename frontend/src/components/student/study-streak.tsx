'use client'

import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { useStudentDashboard } from '@/hooks/useDashboard'

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const completedDays = [true, true, true, true, true, true, true]

export function StudyStreak() {
  const { data } = useStudentDashboard()
  const currentStreak = data?.learning_streak?.current_streak ?? 5
  const streakGoal = data?.learning_streak?.longest_streak ? Math.max(30, data.learning_streak.longest_streak) : 30
  const remainingDays = Math.max(0, streakGoal - currentStreak)
  const progressPercent = Math.min(100, Math.round((currentStreak / streakGoal) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-3xl border border-border bg-card p-4 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Flame className="size-4 text-accent" />
        <h3 className="text-sm font-serif font-bold text-foreground">Learning Streak</h3>
      </div>

      {/* Motivational Subtitle */}
      <p className="text-xs text-muted-foreground mb-4">Consistency builds mastery.</p>

      {/* Weekday Labels + Day Squares Grid */}
      <div className="mb-3">
        {/* Labels */}
        <div className="flex gap-2 mb-2">
          {weekDays.map((day, index) => (
            <div key={`label-${day}-${index}`} className="flex-1 flex justify-center">
              <span className="text-xs font-semibold text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>

        {/* Day Squares */}
        <div className="flex gap-2">
          {weekDays.map((day, index) => {
            const isToday = index === 6 // Last day (Sunday)
            const isCompleted = completedDays[index]

            return (
              <motion.div
                key={`day-${day}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                className="flex-1"
              >
                <div
                  className={`
                    aspect-square rounded-lg transition-all duration-200
                    ${isToday
                      ? 'ring-2 ring-offset-2 ring-accent ring-offset-background'
                      : ''
                    }
                    ${isCompleted
                      ? isToday
                        ? 'bg-accent shadow-lg relative'
                        : 'bg-accent'
                      : 'bg-gray-200 dark:bg-gray-700'
                    }
                  `}
                >
                  {/* Glow effect for today */}
                  {isToday && isCompleted && (
                    <div className="absolute inset-0 bg-accent rounded-lg blur-md opacity-30 -z-10" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3.5">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Current Streak */}
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-50/50 border border-orange-200/50 p-2.5 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Current
          </p>
          <p className="text-base font-bold text-accent mt-0.5">
            {currentStreak}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Days</p>
        </div>

        {/* Goal */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200/50 p-2.5 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Goal
          </p>
          <p className="text-base font-bold text-primary mt-0.5">
            {streakGoal}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Days</p>
        </div>

        {/* Remaining */}
        <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-200/50 p-2.5 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Remaining
          </p>
          <p className="text-base font-bold text-slate-700 mt-0.5">
            {remainingDays}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Days</p>
        </div>
      </div>
    </motion.div>
  )
}
