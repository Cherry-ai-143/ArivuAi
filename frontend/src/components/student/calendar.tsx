'use client'

import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4)) // May 2026

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-3xl border border-border bg-card p-4 shadow-sm"
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-serif font-bold text-foreground">{monthName}</h3>
        <div className="flex gap-0.5">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg border border-border p-1 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="size-3 text-foreground" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border border-border p-1 hover:bg-muted transition-colors"
          >
            <ChevronRight className="size-3 text-foreground" />
          </button>
        </div>
      </div>

      {/* Day headers - Tighter spacing */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-0.5">
            {day[0]}
          </div>
        ))}
      </div>

      {/* Days - Compact grid */}
      <div className="grid grid-cols-7 gap-0.5 mb-2.5">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {days.map((day) => {
          const isToday = day === 21
          const hasEvent = [15, 21, 25].includes(day)

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              className={`
                relative aspect-square rounded-md text-xs font-semibold transition-all
                ${isToday
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : hasEvent
                    ? 'bg-secondary text-primary border border-primary/20'
                    : 'text-foreground hover:bg-muted'
                }
              `}
            >
              {day}
              {hasEvent && (
                <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 size-0.5 rounded-full ${
                  isToday ? 'bg-accent-foreground' : 'bg-accent'
                }`} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Today's highlight - Ultra compact */}
      <div className="p-2 rounded-lg bg-secondary/50 border border-primary/10">
        <p className="text-xs font-semibold text-foreground">May 21</p>
        <p className="text-xs text-muted-foreground mt-0.25">
          2 assessments • 1 assignment
        </p>
      </div>
    </motion.div>
  )
}


