'use client'

import { useState } from 'react'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Trophy,
  BookOpen,
  BarChart3,
  Eye,
  Download,
  Share2,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface Assessment {
  id: string
  title: string
  course: string
  status: 'upcoming' | 'in-progress' | 'completed' | 'missed'
  dueDate: string
  duration: number
  totalMarks: number
  obtainedMarks?: number
  attempts: number
  attemptLimit: number
  completionPercentage?: number
}

const mockAssessments: Assessment[] = [
  {
    id: '1',
    title: 'React Fundamentals Quiz',
    course: 'Advanced React Patterns',
    status: 'upcoming',
    dueDate: '2024-02-15 10:00 AM',
    duration: 30,
    totalMarks: 50,
    attempts: 0,
    attemptLimit: 3,
  },
  {
    id: '2',
    title: 'TypeScript Deep Dive Assessment',
    course: 'TypeScript Mastery',
    status: 'completed',
    dueDate: '2024-02-10',
    duration: 45,
    totalMarks: 100,
    obtainedMarks: 92,
    attempts: 2,
    attemptLimit: 3,
    completionPercentage: 92,
  },
  {
    id: '3',
    title: 'CSS Layout Challenge',
    course: 'CSS Grid & Flexbox',
    status: 'in-progress',
    dueDate: '2024-02-16 02:00 PM',
    duration: 40,
    totalMarks: 75,
    attempts: 1,
    attemptLimit: 2,
    completionPercentage: 45,
  },
  {
    id: '4',
    title: 'Web Design Final Project',
    course: 'Web Design Fundamentals',
    status: 'missed',
    dueDate: '2024-02-05',
    duration: 120,
    totalMarks: 150,
    attempts: 0,
    attemptLimit: 1,
  },
]

type FilterStatus = 'all' | 'upcoming' | 'completed' | 'missed' | 'in-progress'

export default function AssessmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all')
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [showResults, setShowResults] = useState(false)

  const filteredAssessments = mockAssessments.filter(
    (a) => selectedFilter === 'all' || a.status === selectedFilter
  )

  const stats = {
    completed: mockAssessments.filter((a) => a.status === 'completed').length,
    upcoming: mockAssessments.filter((a) => a.status === 'upcoming').length,
    missed: mockAssessments.filter((a) => a.status === 'missed').length,
    avgScore:
      mockAssessments
        .filter((a) => a.obtainedMarks)
        .reduce((sum, a) => sum + (a.completionPercentage || 0), 0) /
        mockAssessments.filter((a) => a.obtainedMarks).length || 0,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border border-green-200'
      case 'upcoming':
        return 'text-blue-600 bg-blue-50 border border-blue-200'
      case 'missed':
        return 'text-red-600 bg-red-50 border border-red-200'
      case 'in-progress':
        return 'text-orange-600 bg-orange-50 border border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-5" />
      case 'missed':
        return <AlertCircle className="size-5" />
      case 'in-progress':
        return <Loader2 className="size-5 animate-spin" />
      default:
        return <Clock className="size-5" />
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Assessments</h1>
        <p className="text-muted-foreground">
          Track your tests, quizzes, and assignments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Completed</p>
          <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Upcoming</p>
          <p className="text-2xl font-bold text-foreground">{stats.upcoming}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Missed</p>
          <p className="text-2xl font-bold text-red-600">{stats.missed}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Avg Score</p>
          <p className="text-2xl font-bold text-foreground">{Math.round(stats.avgScore)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'upcoming', 'completed', 'in-progress', 'missed'] as FilterStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {selectedAssessment && showResults ? (
        // Results View
        <div className="rounded-2xl border border-border bg-card p-8 max-w-3xl mx-auto">
          <button
            onClick={() => {
              setShowResults(false)
              setSelectedAssessment(null)
            }}
            className="text-primary hover:text-primary/80 font-medium mb-6 flex items-center gap-1"
          >
            ← Back to Assessments
          </button>

          {/* Score Card */}
          <div className="text-center mb-8">
            <Trophy className="size-16 text-accent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              Assessment Results
            </p>
            <h2 className="text-2xl font-bold text-foreground mb-6">{selectedAssessment.title}</h2>

            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8 mb-6">
              <p className="text-5xl font-bold text-primary mb-2">
                {selectedAssessment.obtainedMarks}/{selectedAssessment.totalMarks}
              </p>
              <p className="text-2xl font-semibold text-accent">
                {selectedAssessment.completionPercentage}%
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Correct Answers</p>
                <p className="text-xl font-bold text-green-600">
                  {Math.round((selectedAssessment.obtainedMarks || 0) / 4)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Wrong Answers</p>
                <p className="text-xl font-bold text-red-600">
                  {Math.round((selectedAssessment.totalMarks - (selectedAssessment.obtainedMarks || 0)) / 4)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all flex items-center gap-2">
                <Download className="size-4" />
                Download Report
              </button>
              <button className="px-6 py-3 rounded-lg border border-border bg-card text-foreground font-medium hover:border-primary/50 transition-all flex items-center gap-2">
                <Share2 className="size-4" />
                Share Results
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Assessments List
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                        assessment.status
                      )}`}
                    >
                      {getStatusIcon(assessment.status)}
                      {assessment.status.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{assessment.course}</p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3" />
                      {assessment.duration} mins
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Trophy className="size-3" />
                      {assessment.totalMarks} marks
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BarChart3 className="size-3" />
                      {assessment.attempts}/{assessment.attemptLimit} attempts
                    </div>
                    <div className="text-muted-foreground">{assessment.dueDate}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {assessment.status === 'completed' && assessment.completionPercentage && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {assessment.completionPercentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  )}

                  {assessment.status === 'upcoming' && (
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all flex items-center gap-2">
                      <Play className="size-4" />
                      Start
                    </button>
                  )}

                  {assessment.status === 'in-progress' && (
                    <button className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium hover:brightness-110 transition-all flex items-center gap-2">
                      <Play className="size-4" />
                      Resume
                    </button>
                  )}

                  {assessment.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedAssessment(assessment)
                        setShowResults(true)
                      }}
                      className="px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium hover:border-primary/50 transition-all flex items-center gap-2"
                    >
                      <Eye className="size-4" />
                      View
                    </button>
                  )}
                </div>
              </div>

              {assessment.status === 'in-progress' && assessment.completionPercentage && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold text-primary">{assessment.completionPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${assessment.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredAssessments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No assessments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
