'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  X,
} from 'lucide-react'
import {
  getStudentTakeAssessment,
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from '@/lib/services/assessment.service'
import type {
  StudentTakeAssessment,
  AssessmentSubmitResponse,
} from '@/types/assessment'

function AssessmentTakeContent() {
  const params = useParams()
  const router = useRouter()
  const assessmentIdStr = params?.id as string
  const assessmentId = parseInt(assessmentIdStr, 10)

  // State
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Test Taking State
  const [activeTest, setActiveTest] = useState<StudentTakeAssessment | null>(null)
  const [activeAttemptId, setActiveAttemptId] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)

  // Result State
  const [testResult, setTestResult] = useState<AssessmentSubmitResponse | null>(null)

  useEffect(() => {
    if (isNaN(assessmentId)) {
      setErrorMsg('Invalid assessment ID provided.')
      setLoading(false)
      return
    }

    const initTest = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)

        // 1. Start or resume attempt (returns existing IN_PROGRESS attempt if available)
        const attempt = await startAssessmentAttempt(assessmentId)
        setActiveAttemptId(attempt.id)

        // 2. Fetch secure questions for assessment (No answer keys or explanations)
        const testData = await getStudentTakeAssessment(assessmentId)
        setActiveTest(testData)
        setUserAnswers({})
        setCurrentIndex(0)
        setTimerSeconds(testData.duration_minutes ? testData.duration_minutes * 60 : null)
      } catch (err: any) {
        console.error('Failed to initialize assessment take page:', err)
        const detail = err?.response?.data?.detail || 'Failed to start or resume assessment.'
        setErrorMsg(detail)
      } finally {
        setLoading(false)
      }
    }

    initTest()
  }, [assessmentId])

  // Timer countdown effect
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0 || !activeTest || testResult) return
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
  }, [timerSeconds, activeTest, testResult])

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }))
  }

  const handleConfirmSubmit = async () => {
    if (!activeAttemptId || !activeTest) return
    try {
      setSubmitting(true)
      const payloadAnswers = Object.entries(userAnswers).map(([qId, opt]) => ({
        question_id: Number(qId),
        selected_option: opt,
      }))
      const res = await submitAssessmentAttempt(activeAttemptId, payloadAnswers)
      setTestResult(res)
      setShowConfirmModal(false)
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to submit assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // --- RENDER 1: LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Preparing assessment environment...</p>
      </div>
    )
  }

  // --- RENDER 2: ERROR STATE ---
  if (errorMsg) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto my-12">
        <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-6 shadow-md">
          <div className="size-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Assessment Unavailable</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {errorMsg}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/assessments')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md"
          >
            <ArrowLeft className="size-4" /> Back to Assessments
          </button>
        </div>
      </div>
    )
  }

  // --- RENDER 3: RESULTS SCORE CARD VIEW ---
  if (testResult) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto my-6 space-y-6 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl space-y-6">
          <div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-primary/20 to-emerald-500/20 flex items-center justify-center">
            <Trophy className="size-10 text-primary" />
          </div>

          <div>
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                testResult.passed
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
              }`}
            >
              {testResult.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </span>
            <h2 className="text-2xl font-bold text-foreground mt-3">{activeTest?.title || 'Assessment Results'}</h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-emerald-500/10 p-6 border border-border">
            <p className="text-5xl font-black text-primary tracking-tight">
              {testResult.score} / {testResult.total_marks}
            </p>
            <p className="text-base font-bold text-muted-foreground mt-1">
              Percentage: <strong className="text-foreground">{testResult.percentage}%</strong>
            </p>
          </div>

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
            onClick={() => router.push('/dashboard/assessments')}
            className="w-full py-3.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" /> Return to Assessments
          </button>
        </div>
      </div>
    )
  }

  // --- RENDER 4: INTERACTIVE TEST TAKING VIEW ---
  if (!activeTest || activeTest.questions.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto my-12 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 space-y-4 shadow-md">
          <BookOpen className="size-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No Questions Found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This assessment currently has no questions configured. Please check back later.
          </p>
          <button
            onClick={() => router.push('/dashboard/assessments')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:brightness-110 transition-all"
          >
            <ArrowLeft className="size-4" /> Back to Assessments
          </button>
        </div>
      </div>
    )
  }

  const currentQ = activeTest.questions[currentIndex]

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6 min-h-screen">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {activeTest.assessment_type} • {activeTest.scope} Scope
            </span>
            <h1 className="text-xl font-bold text-foreground mt-1">{activeTest.title}</h1>
          </div>

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

        {/* Question Counter Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>
            Question <strong className="text-foreground">{currentIndex + 1}</strong> of{' '}
            {activeTest.questions.length}
          </span>
          <span>
            Marks: {currentQ?.marks || 1} / Total: {activeTest.total_marks}
          </span>
        </div>

        {/* Current Question Text */}
        <div className="rounded-2xl bg-muted/30 border border-border p-5">
          <p className="text-base font-bold text-foreground leading-relaxed">
            {currentQ?.question_text}
          </p>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'A', text: currentQ?.option_a },
            { key: 'B', text: currentQ?.option_b },
            { key: 'C', text: currentQ?.option_c },
            { key: 'D', text: currentQ?.option_d },
          ]
            .filter((opt) => Boolean(opt.text))
            .map((opt) => {
              const qId = currentQ.question_id
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

        {/* Navigation Buttons */}
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
              Are you sure you want to submit your assessment?
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
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DynamicAssessmentTakePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <AssessmentTakeContent />
    </Suspense>
  )
}
