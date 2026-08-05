'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowRight } from 'lucide-react'

const data = [
  { name: 'Completed', value: 120 },
  { name: 'In Progress', value: 156 },
  { name: 'Not Started', value: 76 },
]

const COLORS = ['#10b981', '#3b82f6', '#ef4444']

export function CourseOverview() {
  const totalStudents = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Course Overview
      </h3>

      <div className="flex flex-col items-center">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Students</p>
        </div>
      </div>

      <div className="mt-8 space-y-3 border-t border-border pt-6">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx] }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {item.value} ({((item.value / totalStudents) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors">
        View Detailed Analytics <ArrowRight className="size-4" />
      </button>
    </div>
  )
}


