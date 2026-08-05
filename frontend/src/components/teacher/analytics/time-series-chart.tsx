'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const trendData = [
  { week: 'Week 1', logins: 245, quizUsage: 156, submissions: 120, lessonViews: 89 },
  { week: 'Week 2', logins: 312, quizUsage: 201, submissions: 145, lessonViews: 112 },
  { week: 'Week 3', logins: 389, quizUsage: 267, submissions: 198, lessonViews: 156 },
  { week: 'Week 4', logins: 456, quizUsage: 334, submissions: 245, lessonViews: 201 },
]

const metricsOptions = [
  { key: 'logins', label: 'Student Logins', color: '#3b82f6' },
  { key: 'quizUsage', label: 'AI Quiz Usage', color: '#a855f7' },
  { key: 'submissions', label: 'Assignment Submissions', color: '#f97316' },
  { key: 'lessonViews', label: 'Lesson Views', color: '#10b981' },
]

export function TimeSeriesChart() {
  const [selectedMetrics, setSelectedMetrics] = useState(['logins', 'quizUsage', 'submissions'])

  const toggleMetric = (key: string) => {
    if (selectedMetrics.includes(key)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== key))
    } else {
      setSelectedMetrics([...selectedMetrics, key])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground">
          Engagement Trend Analysis
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Track student engagement metrics over time
        </p>
      </div>

      {/* Metric Toggles */}
      <div className="mb-6 flex flex-wrap gap-2">
        {metricsOptions.map((metric) => (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedMetrics.includes(metric.key)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              {metric.label}
            </div>
          </button>
        ))}
      </div>

      {/* Line Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="lineGradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {selectedMetrics.includes('logins') && (
              <Line
                type="monotone"
                dataKey="logins"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Student Logins"
                isAnimationActive={true}
              />
            )}
            {selectedMetrics.includes('quizUsage') && (
              <Line
                type="monotone"
                dataKey="quizUsage"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ fill: '#a855f7', r: 4 }}
                activeDot={{ r: 6 }}
                name="AI Quiz Usage"
                isAnimationActive={true}
              />
            )}
            {selectedMetrics.includes('submissions') && (
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ fill: '#f97316', r: 4 }}
                activeDot={{ r: 6 }}
                name="Assignment Submissions"
                isAnimationActive={true}
              />
            )}
            {selectedMetrics.includes('lessonViews') && (
              <Line
                type="monotone"
                dataKey="lessonViews"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Lesson Views"
                isAnimationActive={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/50">
        <p className="text-sm font-semibold text-emerald-900">Trend Summary</p>
        <p className="text-xs text-emerald-700 mt-2">
          Student engagement is trending upward with a {Math.round(((456 - 245) / 245) * 100)}% increase in logins over 4 weeks.
        </p>
      </div>
    </motion.div>
  )
}


