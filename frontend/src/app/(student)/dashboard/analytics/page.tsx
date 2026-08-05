'use client'

import { BarChart3, TrendingUp, Award, Target, Calendar, Download } from 'lucide-react'

export default function AnalyticsPage() {
  const studyStats = {
    totalHours: 156,
    weeklyHours: 24,
    avgSessionDuration: 45,
    lastSessionDate: 'Today',
    strongSubjects: ['React', 'TypeScript', 'CSS'],
    weakSubjects: ['System Design', 'Algorithms'],
  }

  const performanceData = [
    { subject: 'React', score: 92, attempts: 5 },
    { subject: 'TypeScript', score: 88, attempts: 4 },
    { subject: 'CSS', score: 85, attempts: 3 },
    { subject: 'JavaScript', score: 78, attempts: 6 },
    { subject: 'Algorithms', score: 65, attempts: 3 },
  ]

  const weeklyProgress = [
    { day: 'Mon', hours: 3.5, quizzes: 2 },
    { day: 'Tue', hours: 4, quizzes: 3 },
    { day: 'Wed', hours: 2.5, quizzes: 1 },
    { day: 'Thu', hours: 5, quizzes: 4 },
    { day: 'Fri', hours: 3, quizzes: 2 },
    { day: 'Sat', hours: 4.5, quizzes: 3 },
    { day: 'Sun', hours: 2.5, quizzes: 1 },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your learning progress and performance
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium hover:border-primary/50 transition-all flex items-center gap-2">
          <Download className="size-4" />
          Download Report
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Study Hours</p>
              <p className="text-3xl font-bold text-foreground">{studyStats.totalHours}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="size-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {studyStats.weeklyHours}h this week
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Avg Session Duration</p>
              <p className="text-3xl font-bold text-foreground">{studyStats.avgSessionDuration}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <TrendingUp className="size-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">minutes per session</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Overall Accuracy</p>
              <p className="text-3xl font-bold text-green-600">82%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Target className="size-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">across all quizzes</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Achievements</p>
              <p className="text-3xl font-bold text-accent">12</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Award className="size-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">badges earned</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Weekly Study Activity */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-6">Weekly Study Activity</h2>
          <div className="space-y-4">
            {weeklyProgress.map((day) => (
              <div key={day.day}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{day.day}</span>
                  <span className="text-xs text-muted-foreground">{day.hours}h • {day.quizzes} quizzes</span>
                </div>
                <div className="flex gap-1">
                  <div
                    className="h-3 bg-gradient-to-r from-primary to-accent rounded-full"
                    style={{ width: `${(day.hours / 5) * 100}%` }}
                  />
                  <div className="flex-1 h-3 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-6">Subject Performance</h2>
          <div className="space-y-4">
            {performanceData.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{subject.subject}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">{subject.score}%</span>
                    <span className="text-xs text-muted-foreground">{subject.attempts} attempts</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      subject.score >= 85
                        ? 'bg-green-500'
                        : subject.score >= 75
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${subject.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-green-600" />
            Strongest Subjects
          </h2>
          <div className="space-y-3">
            {studyStats.strongSubjects.map((subject) => (
              <div
                key={subject}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
              >
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <span className="text-sm font-medium text-foreground">{subject}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="size-5 text-red-600" />
            Areas for Improvement
          </h2>
          <div className="space-y-3">
            {studyStats.weakSubjects.map((subject) => (
              <div
                key={subject}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <div className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-sm font-medium text-foreground">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
