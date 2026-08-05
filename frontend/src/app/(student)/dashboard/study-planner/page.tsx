'use client'

import { useState } from 'react'
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  Trash2,
  Edit2,
  BookOpen,
  Zap,
  Target,
  AlertCircle,
  Play,
} from 'lucide-react'

interface StudySession {
  id: string
  title: string
  subject: string
  date: string
  startTime: string
  duration: number
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

interface Goal {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly'
  target: number
  current: number
  unit: string
}

const mockSessions: StudySession[] = [
  {
    id: '1',
    title: 'React Hooks Study',
    subject: 'React',
    date: '2024-02-15',
    startTime: '09:00',
    duration: 60,
    completed: true,
    priority: 'high',
  },
  {
    id: '2',
    title: 'CSS Flexbox Practice',
    subject: 'CSS',
    date: '2024-02-15',
    startTime: '11:00',
    duration: 45,
    completed: false,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'TypeScript Quiz',
    subject: 'TypeScript',
    date: '2024-02-15',
    startTime: '14:00',
    duration: 30,
    completed: false,
    priority: 'high',
  },
]

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Daily Study Goal',
    type: 'daily',
    target: 120,
    current: 95,
    unit: 'minutes',
  },
  {
    id: '2',
    title: 'Weekly Quizzes',
    type: 'weekly',
    target: 10,
    current: 7,
    unit: 'quizzes',
  },
  {
    id: '3',
    title: 'Monthly Courses',
    type: 'monthly',
    target: 3,
    current: 1,
    unit: 'courses',
  },
]

type ViewMode = 'calendar' | 'list' | 'goals'

export default function StudyPlannerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [pomodoroTimer, setPomodoroTimer] = useState(25)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const completedToday = mockSessions.filter((s) => s.completed).length
  const totalToday = mockSessions.length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Study Planner</h1>
          <p className="text-muted-foreground">
            Plan your study sessions and track your goals
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all flex items-center gap-2">
          <Plus className="size-4" />
          Add Session
        </button>
      </div>

      {/* Pomodoro Timer */}
      <div className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <Zap className="size-5 text-accent" />
          Pomodoro Timer
        </h2>
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-bold text-primary font-mono">
            {String(Math.floor(pomodoroTimer / 60)).padStart(2, '0')}:
            {String(pomodoroTimer % 60).padStart(2, '0')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all"
            >
              {isTimerRunning ? 'Pause' : 'Start'} Timer
            </button>
            <button className="px-6 py-3 rounded-lg border border-border bg-card text-foreground font-medium hover:border-primary/50 transition-all">
              Reset
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:border-primary/50 transition-all">
              25 min
            </button>
            <button className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:border-primary/50 transition-all">
              5 min Break
            </button>
            <button className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:border-primary/50 transition-all">
              15 min Break
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {['list', 'calendar', 'goals'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as ViewMode)}
            className={`pb-4 px-2 font-medium text-sm transition-colors ${
              viewMode === mode
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div>
          <div className="mb-6 flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <span className="text-sm text-muted-foreground">
              Today's Progress: {completedToday}/{totalToday} completed
            </span>
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${(completedToday / totalToday) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {mockSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
              >
                <button className="flex-shrink-0">
                  {session.completed ? (
                    <CheckCircle className="size-6 text-green-600" />
                  ) : (
                    <Circle className="size-6 text-muted-foreground hover:text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${session.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {session.title}
                  </h3>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3" />
                      {session.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {session.startTime} • {session.duration} mins
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      session.priority === 'high'
                        ? 'bg-red-50 text-red-700'
                        : session.priority === 'medium'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {session.priority}
                  </span>
                </div>

                <div className="flex-shrink-0 flex gap-2">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 className="size-4" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar dates */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => {
                const date = i + 1
                const isToday = date === 15
                const hasSession = [10, 15, 20].includes(date)

                return (
                  <button
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      isToday
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                        : hasSession
                        ? 'bg-accent/20 text-foreground border border-accent'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {date <= 29 ? date : ''}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Goals View */}
      {viewMode === 'goals' && (
        <div className="grid gap-4">
          {mockGoals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {goal.current}/{goal.target}
                  </p>
                  <p className="text-xs text-muted-foreground">{goal.unit}</p>
                </div>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${(goal.current / goal.target) * 100}%` }}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                {Math.round((goal.current / goal.target) * 100)}% complete
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
