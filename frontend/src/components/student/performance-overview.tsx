'use client'

import { motion } from 'motion/react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const performanceData = [
  { week: 'Week 1', score: 72, average: 65 },
  { week: 'Week 2', score: 75, average: 68 },
  { week: 'Week 3', score: 78, average: 70 },
  { week: 'Week 4', score: 81, average: 72 },
  { week: 'Week 5', score: 84, average: 75 },
  { week: 'Week 6', score: 86, average: 77 },
  { week: 'Week 7', score: 88, average: 79 },
]

export function PerformanceOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground">
          Performance Overview
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your progress over the last 7 weeks
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={performanceData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="week"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px',
            }}
            cursor={{ fill: '#f97316', opacity: 0.1 }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="score"
            fill="#f97316"
            radius={[8, 8, 0, 0]}
            name="Your Score"
          />
          <Bar
            dataKey="average"
            fill="#1e3a8a"
            radius={[8, 8, 0, 0]}
            name="Class Average"
            opacity={0.6}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Quiz Accuracy', value: '86%', color: 'text-orange-600' },
          { label: 'Time Spent', value: '48.6h', color: 'text-blue-600' },
          { label: 'Avg Score Trend', value: '+14%', color: 'text-emerald-600' },
          { label: 'Consistency', value: '95%', color: 'text-purple-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-gradient-to-br from-muted/50 to-white p-4"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold font-serif ${stat.color} mt-2`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}


