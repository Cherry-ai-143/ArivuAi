'use client'

import { useState } from 'react'
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
import { ChevronDown } from 'lucide-react'

const data = [
  {
    day: 'Mon',
    averageScore: 65,
    completionRate: 40,
  },
  {
    day: 'Tue',
    averageScore: 72,
    completionRate: 45,
  },
  {
    day: 'Wed',
    averageScore: 68,
    completionRate: 52,
  },
  {
    day: 'Thu',
    averageScore: 75,
    completionRate: 58,
  },
  {
    day: 'Fri',
    averageScore: 82,
    completionRate: 72,
  },
  {
    day: 'Sat',
    averageScore: 78,
    completionRate: 65,
  },
  {
    day: 'Sun',
    averageScore: 82,
    completionRate: 76,
  },
  {
    day: 'Thu, 18 May',
    averageScore: 82,
    completionRate: 76,
  },
]

export function StudentPerformanceOverview() {
  const [timeRange, setTimeRange] = useState('thisWeek')

  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Student Performance Overview
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track average scores and completion rates
          </p>
        </div>

        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm font-medium">
            {timeRange === 'thisWeek' && 'This Week'}
            {timeRange === 'thisMonth' && 'This Month'}
            {timeRange === 'thisYear' && 'This Year'}
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="averageScore"
              stroke="#1E3A8A"
              strokeWidth={2}
              name="Average Score"
              dot={{ fill: '#1E3A8A', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#F97316"
              strokeWidth={2}
              name="Completion Rate"
              dot={{ fill: '#F97316', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Average Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Completion Rate</span>
        </div>
      </div>
    </div>
  )
}


