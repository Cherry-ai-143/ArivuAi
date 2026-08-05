'use client'

import { motion } from 'motion/react'
import { Zap, TrendingUp, AlertCircle, Star, Brain } from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const radarData = [
  { subject: 'React', value: 88 },
  { subject: 'Python', value: 82 },
  { subject: 'Java', value: 86 },
  { subject: 'Database', value: 79 },
  { subject: 'AI', value: 91 },
  { subject: 'Algorithms', value: 76 },
]

const insights = [
  { icon: Zap, label: 'Strongest Skill', value: 'AI (91%)', color: 'text-amber-600' },
  { icon: TrendingUp, label: 'Fastest Improving', value: 'Python (+12%)', color: 'text-emerald-600' },
  { icon: AlertCircle, label: 'Needs Practice', value: 'Algorithms (76%)', color: 'text-orange-600' },
  { icon: Star, label: 'Highest Quiz Score', value: 'Java (94%)', color: 'text-blue-600' },
]

export function SubjectPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="rounded-3xl border border-border bg-card p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-serif font-bold text-foreground">
          Subject Mastery
        </h3>
      </div>

      {/* Radar Chart */}
      <div className="h-56 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" stroke="#64748b" style={{ fontSize: '11px' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
            <Radar
              name="Skill Level"
              dataKey="value"
              stroke="#f97316"
              fill="url(#radarGradient)"
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-3 rounded-lg border border-border bg-gradient-to-br from-muted/50 to-muted/25 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Icon className={`size-4 flex-shrink-0 mt-0.5 ${insight.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                    {insight.label}
                  </p>
                  <p className="text-xs font-bold text-foreground mt-0.5 line-clamp-1">
                    {insight.value}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI Confidence Note - Compact */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 flex items-start gap-2">
        <Brain className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900">AI Analysis</p>
          <p className="text-xs text-blue-800 mt-0.5">
            Personalized recommendations for improvement.
          </p>
        </div>
      </div>
    </motion.div>
  )
}


