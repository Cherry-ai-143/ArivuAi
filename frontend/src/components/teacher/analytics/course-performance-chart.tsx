'use client'

import { motion } from 'motion/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const courseData = [
  { name: 'Python Programming', completion: 76, studentProgress: 82, assignments: 78, quizAvg: 79 },
  { name: 'Web Development', completion: 82, studentProgress: 88, assignments: 85, quizAvg: 83 },
  { name: 'Data Science', completion: 68, studentProgress: 75, assignments: 72, quizAvg: 70 },
  { name: 'Database Systems', completion: 71, studentProgress: 78, assignments: 75, quizAvg: 72 },
]

const colors = ['#3b82f6', '#a855f7', '#f97316', '#10b981']

export function CoursePerformanceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground">
          Course Performance Analytics
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Track completion rates and student progress across all courses
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={courseData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis dataKey="name" type="category" stroke="#64748b" width={195} style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => `${value}%`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="completion" fill="#3b82f6" name="Completion %" radius={[0, 8, 8, 0]} />
            <Bar dataKey="studentProgress" fill="#a855f7" name="Student Progress %" radius={[0, 8, 8, 0]} />
            <Bar dataKey="assignments" fill="#f97316" name="Assignments Done %" radius={[0, 8, 8, 0]} />
            <Bar dataKey="quizAvg" fill="#10b981" name="Quiz Average %" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {courseData.map((course, index) => (
          <motion.div
            key={course.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="p-3 rounded-lg bg-muted/50 border border-border"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {course.name.split(' ')[0]}
            </p>
            <p className="text-lg font-bold text-foreground mt-1">{course.completion}%</p>
            <p className="text-xs text-muted-foreground mt-1">Complete</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}


