'use client'

import { motion } from 'motion/react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const engagementData = [
  { name: 'High', value: 89, color: '#10b981' },
  { name: 'Medium', value: 156, color: '#3b82f6' },
  { name: 'Low', value: 67, color: '#f59e0b' },
  { name: 'Very Low', value: 30, color: '#ef4444' },
]

const total = engagementData.reduce((sum, item) => sum + item.value, 0)

export function StudentEngagementChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground">
          Student Engagement Distribution
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Breakdown of student engagement levels
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Donut Chart */}
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value) => [`${value} students`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="text-sm font-semibold text-foreground mb-4">Engagement Levels</div>
          {engagementData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-xl border border-border bg-gradient-to-r from-muted/50 to-muted/25 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.name === 'High' && '80-100%'}
                        {item.name === 'Medium' && '60-80%'}
                        {item.name === 'Low' && '40-60%'}
                        {item.name === 'Very Low' && '<40%'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
        <p className="text-sm font-semibold text-blue-900">Total Students</p>
        <p className="text-2xl font-bold text-blue-900 mt-1">{total}</p>
        <p className="text-xs text-blue-700 mt-2">
          {engagementData[0].value} highly engaged students need to be leveraged for peer learning
        </p>
      </div>
    </motion.div>
  )
}


