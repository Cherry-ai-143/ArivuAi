'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Trophy,
  BookOpen,
  BarChart3,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  HelpCircle,
  X,
  AlertTriangle,
} from 'lucide-react'
import {
  getAvailableStudentAssessments,
  getStudentTakeAssessment,
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from '@/lib/services/assessment.service'
import type {
  PublishedAssessment,
  StudentTakeAssessment,
  AssessmentSubmitResponse,
} from '@/types/assessment'

type FilterStatus = 'all' | 'upcoming' | 'in-progress' | 'completed'

export default function StudentAssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<PublishedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all')

  // Test Taking State
  const [activeTest, setActiveTest] = useState<StudentTakeAssessment | null>(null)
  const [activeAttemptId, setActiveAttemptId] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingTest, setLoadingTest] = useState(false)
  const [submittingTest, setSubmittingTest] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)

  // Result State
  const [testResult, setTestResult] = useState<AssessmentSubmitResponse | null>(null)

  const loadAssessments = async () => {
    try {
      setLoading(true)
      const data = await getAvailableStudentAssessments()
      setAssessments(data)
    } catch (err) {
      console.error('Failed to load student assessments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssessments()
  }, [])

  // Timer countdown hook
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0 || !activeTest) return
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerSeconds, activeTest])

  // Handle starting/resuming test
  const handleStartTest = async (assessment: PublishedAssessment) => {
    try {
      setLoadingTest(true)
      const attempt = await startAssessmentAttempt(assessment.id)
      const testData = await getStudentTakeAssessment(assessment.id)
      setActiveAttemptId(attempt.id)
      setActiveTest(testData)
      setUserAnswers({})
      setCurrentIndex(0)
      setTimerSeconds(testData.duration_minutes ? testData.duration_minutes * 60 : null)
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to start assessment attempt.')
    } finally {
      setLoadingTest(false)
    }
  }

  // Handle answer selection
  const handleSelectOption = (questionId: number, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }))
  }

  // Handle final submission
  const handleConfirmSubmit = async () => {
    if (!activeAttemptId || !activeTest) return
    try {
      setSubmittingTest(true)
      const payloadAnswers = Object.entries(userAnswers).map(([qId, opt]) => ({
        question_id: Number(qId),
        selected_option: opt,
      }))
      const res = await submitAssessmentAttempt(activeAttemptId, payloadAnswers)
      setTestResult(res)
      setActiveTest(null)
      setActiveAttemptId(null)
      setShowConfirmModal(false)
      loadAssessments()
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to submit assessment.')
    } finally {
      setSubmittingTest(false)
    }
  }

  // Format timer string (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const filteredAssessments = assessments.filter((a) => {
    if (selectedFilter === 'upcoming') return a.attempts_used === 0
    if (selectedFilter === 'in-progress') return a.attempts_used > 0 && a.attempts_remaining > 0
    if (selectedFilter === 'completed') return a.attempts_remaining === 0
    return true
  })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-2">
          <BookOpen className="size-8 text-primary" /> Enrolled Course Assessments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Take published quizzes and chapter tests for your active enrolled courses.
        </p>
      </div>

      {/* RESULT VIEW */}
      {testResult ? (
        <div className="rounded-3xl border border-border bg-card p-8 max-w-2xl mx-auto shadow-lg space-y-6 text-center">
          <div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-primary/20 to-emerald-500/20 flex items-center justify-center">
            <Trophy className="size-10 text-primary" />
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                testResult.passed
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
              }`}
            >
              {testResult.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </span>
            <h2 className="text-2xl font-bold text-foreground mt-3">Assessment Results</h2>
          </div>

          {/* Score Display Card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-emerald-500/10 p-6 border border-border">
            <p className="text-5xl font-black text-primary tracking-tight">
              {testResult.score} / {testResult.total_marks}
            </p>
            <p className="text-lg font-bold text-muted-foreground mt-1">
              Score Percentage: <strong className="text-foreground">{testResult.percentage}%</strong>
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="rounded-xl border border-border bg-emerald-500/5 p-4 flex items-center gap-3">
              <CheckCircle className="size-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Correct Answers</p>
                <p className="text-xl font-bold text-emerald-600">{testResult.correct_count}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-rose-500/5 p-4 flex items-center gap-3">
              <AlertCircle className="size-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Incorrect / Unanswered</p>
                <p className="text-xl font-bold text-rose-600">{testResult.incorrect_count}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setTestResult(null)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all shadow-md"
          >
            Back to Available Assessments
          </button>
        </div>
      ) : activeTest ? (
        /* INTERACTIVE TEST TAKING VIEW */
        <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 max-w-4xl mx-auto shadow-xl space-y-6">
          {/* Test Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                {activeTest.assessment_type} • {activeTest.scope} Scope
              </span>
              <h2 className="text-xl font-bold text-foreground mt-1">{activeTest.title}</h2>
            </div>

            {/* Timer */}
            {timerSeconds !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border shadow-xs ${
                  timerSeconds < 180
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse'
                    : 'bg-muted text-foreground border-border'
                }`}
              >
                <Clock className="size-4 text-primary" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            )}
          </div>

          {/* Question Slide Navigation Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>
              Question <strong className="text-foreground">{currentIndex + 1}</strong> of{' '}
              {activeTest.questions.length}
            </span>
            <span>
              Total Marks: {activeTest.total_marks} ({activeTest.questions[currentIndex]?.marks || 1} mark)
            </span>
          </div>

          {/* Active Question Box */}
          {activeTest.questions.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-muted/30 border border-border p-5">
                <p className="text-base font-bold text-foreground leading-relaxed">
                  {activeTest.questions[currentIndex].question_text}
                </p>
              </div>

              {/* Options Radio List */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'A', text: activeTest.questions[currentIndex].option_a },
                  { key: 'B', text: activeTest.questions[currentIndex].option_b },
                  { key: 'C', text: activeTest.questions[currentIndex].option_c },
                  { key: 'D', text: activeTest.questions[currentIndex].option_d },
                ]
                  .filter((opt) => Boolean(opt.text))
                  .map((opt) => {
                    const qId = activeTest.questions[currentIndex].question_id
                    const isSelected = userAnswers[qId] === opt.key

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(qId, opt.key)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-sm'
                            : 'border-border bg-card text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <div
                          className={`size-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {opt.key}
                        </div>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Test Action Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>

            {currentIndex < activeTest.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(activeTest.questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md"
              >
                Next <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md"
              >
                <Send className="size-4" /> Submit Assessment
              </button>
            )}
          </div>

          {/* Submission Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
                <AlertTriangle className="size-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-bold text-foreground">Submit Assessment?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You have answered{' '}
                  <strong className="text-foreground">{Object.keys(userAnswers).length}</strong> of{' '}
                  <strong className="text-foreground">{activeTest.questions.length}</strong> questions.
                  Are you sure you want to submit your attempt?
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-all"
                  >
                    Continue Answering
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={submittingTest}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {submittingTest && <Loader2 className="size-4 animate-spin" />}
                    Confirm Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MAIN AVAILABLE ASSESSMENTS LIST VIEW */
        <div className="space-y-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'upcoming', 'in-progress', 'completed'] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === tab
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab === 'all'
                  ? 'All Assessments'
                  : tab === 'upcoming'
                  ? 'Available'
                  : tab === 'in-progress'
                  ? 'In Progress'
                  : 'Completed'}
              </button>
            ))}
          </div>

          {/* Content Loading / Empty / List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs font-semibold">Fetching available course assessments...</p>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3 max-w-md mx-auto my-6">
              <BookOpen className="size-12 text-primary mx-auto opacity-40" />
              <h3 className="text-base font-bold text-foreground">No Published Assessments Found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                There are no published assessments available for your enrolled courses under this filter right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssessments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                        {a.assessment_type}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {a.course_title || 'Enrolled Course'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground leading-snug">{a.title}</h3>
                    {a.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {a.description}
                      </p>
                    )}
                  </div>

                    <div className="space-y-4 pt-3 border-t border-border/50">
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-primary" />
                          <span>{a.duration_minutes} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="size-3.5 text-amber-500" />
                          <span>{a.total_marks} marks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="size-3.5 text-indigo-500" />
                          <span>
                            {a.attempts_used} / {a.max_attempts} attempts
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const isMaxAttempts = a.attempts_remaining <= 0 || a.attempts_used >= a.max_attempts
                        return (
                          <button
                            onClick={() => router.push(`/dashboard/assessments/${a.id}/take`)}
                            disabled={isMaxAttempts}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              isMaxAttempts
                                ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60'
                                : 'bg-primary text-primary-foreground hover:brightness-110 shadow-md'
                            }`}
                          >
                            <Play className="size-4" />
                            {isMaxAttempts
                              ? 'Maximum Attempts Reached'
                              : a.attempts_used > 0
                              ? 'Resume Assessment'
                              : 'Start Assessment'}
                          </button>
                        )
                      })()}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
