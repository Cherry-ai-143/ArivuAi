'use client'

import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const weeklyData = [
  { day: 'Mon', studyHours: 2.5, quizTime: 1.2, aiSessions: 0.8 },
  { day: 'Tue', studyHours: 3.2, quizTime: 1.5, aiSessions: 1.1 },
  { day: 'Wed', studyHours: 2.8, quizTime: 1.3, aiSessions: 0.9 },
  { day: 'Thu', studyHours: 3.8, quizTime: 2.1, aiSessions: 1.4 },
  { day: 'Fri', studyHours: 3.5, quizTime: 1.8, aiSessions: 1.2 },
  { day: 'Sat', studyHours: 4.2, quizTime: 2.5, aiSessions: 1.6 },
  { day: 'Sun', studyHours: 3.9, quizTime: 2.2, aiSessions: 1.5 },
]

export function LearningProgress() {
  const totalStudyHours = weeklyData.reduce((sum, day) => sum + day.studyHours, 0).toFixed(1)
  const totalSessions = weeklyData.reduce((sum, day) => sum + day.aiSessions, 0).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">
            Weekly Study Activity
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your learning breakdown across different activities
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          This Week
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          <p className="text-xs text-blue-600 font-semibold mb-1">STUDY HOURS</p>
          <p className="text-2xl font-bold text-blue-900">{totalStudyHours}h</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
          <p className="text-xs text-purple-600 font-semibold mb-1">QUIZ TIME</p>
          <p className="text-2xl font-bold text-purple-900">{(weeklyData.reduce((sum, day) => sum + day.quizTime, 0)).toFixed(1)}h</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
          <p className="text-xs text-orange-600 font-semibold mb-1">AI SESSIONS</p>
          <p className="text-2xl font-bold text-orange-900">{totalSessions}</p>
        </div>
      </div>

      {/* Area Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              cursor={{ stroke: '#f97316', strokeWidth: 2 }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="studyHours"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStudy)"
              name="Study Hours"
              isAnimationActive={true}
            />
            <Area
              type="monotone"
              dataKey="quizTime"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorQuiz)"
              name="Quiz Time"
              isAnimationActive={true}
            />
            <Area
              type="monotone"
              dataKey="aiSessions"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAI)"
              name="AI Sessions"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex gap-4 border-t border-border pt-6">
        <button className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
          Generate from Topic
        </button>
        <button className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition-all">
          View All Progress
        </button>
      </div>
    </motion.div>
  )
}


