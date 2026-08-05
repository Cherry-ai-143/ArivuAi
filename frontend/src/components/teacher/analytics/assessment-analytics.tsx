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

const assessmentData = [
  { name: 'Python Quiz 1', quiz: 78, assignment: 85, exam: 72, courseAvg: 78 },
  { name: 'Web Dev Midterm', quiz: 82, assignment: 92, exam: 88, courseAvg: 87 },
  { name: 'Data Science Project', quiz: 85, assignment: 78, exam: 82, courseAvg: 82 },
  { name: 'Database Assignment', quiz: 72, assignment: 68, exam: 75, courseAvg: 72 },
]

const getColor = (value: number) => {
  if (value >= 90) return '#10b981'
  if (value >= 80) return '#3b82f6'
  if (value >= 70) return '#f59e0b'
  return '#ef4444'
}

export function AssessmentAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-xl font-serif font-bold text-foreground">
          Assessment Performance Heat Map
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive performance metrics across assessment types
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={assessmentData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
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
            <Bar dataKey="quiz" fill="#3b82f6" name="Quiz Average" radius={[8, 8, 0, 0]} />
            <Bar dataKey="assignment" fill="#a855f7" name="Assignment Average" radius={[8, 8, 0, 0]} />
            <Bar dataKey="exam" fill="#f97316" name="Exam Average" radius={[8, 8, 0, 0]} />
            <Bar dataKey="courseAvg" fill="#10b981" name="Course Average" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heat Map Grid */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-foreground mb-4">Performance Grid</p>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Headers */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessment</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Quiz</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Assignment</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Exam</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Avg</div>
            </div>

            {/* Rows */}
            {assessmentData.map((assessment, index) => (
              <motion.div
                key={assessment.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="grid grid-cols-5 gap-2 mb-2"
              >
                <div className="text-sm font-medium text-foreground truncate">{assessment.name}</div>
                <div
                  className="text-sm font-bold text-center text-white rounded-lg py-2 transition-all"
                  style={{ backgroundColor: getColor(assessment.quiz) }}
                >
                  {assessment.quiz}%
                </div>
                <div
                  className="text-sm font-bold text-center text-white rounded-lg py-2 transition-all"
                  style={{ backgroundColor: getColor(assessment.assignment) }}
                >
                  {assessment.assignment}%
                </div>
                <div
                  className="text-sm font-bold text-center text-white rounded-lg py-2 transition-all"
                  style={{ backgroundColor: getColor(assessment.exam) }}
                >
                  {assessment.exam}%
                </div>
                <div
                  className="text-sm font-bold text-center text-white rounded-lg py-2 transition-all"
                  style={{ backgroundColor: getColor(assessment.courseAvg) }}
                >
                  {assessment.courseAvg}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-xs text-muted-foreground">90-100% (Excellent)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
          <span className="text-xs text-muted-foreground">80-89% (Good)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
          <span className="text-xs text-muted-foreground">70-79% (Fair)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-xs text-muted-foreground">Below 70% (Needs Improvement)</span>
        </div>
      </div>
    </motion.div>
  )
}


