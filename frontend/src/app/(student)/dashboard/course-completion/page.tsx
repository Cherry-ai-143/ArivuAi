'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Award,
  Download,
  Trophy,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Loader2,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react'
import { getCourseById, Course } from '@/lib/services/course.service'
import { getCourseProgress, CourseProgressResponse } from '@/lib/services/progress.service'

const REQUIRED_PASSING_SCORE = 60 // 60% required passing grade

export default function CourseCompletionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('courseId')
  const scoreParam = searchParams.get('score')

  const [course, setCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<CourseProgressResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const assessmentScore = scoreParam ? parseInt(scoreParam, 10) : 85 // Default or passed score
  const isPassed = assessmentScore >= REQUIRED_PASSING_SCORE

  useEffect(() => {
    const numericId = courseIdParam ? parseInt(courseIdParam, 10) : null
    if (!numericId || isNaN(numericId)) {
      setIsLoading(false)
      return
    }

    const loadBackendData = async () => {
      try {
        setIsLoading(true)
        const courseRes = await getCourseById(numericId)
        if (courseRes) setCourse(courseRes)

        const progRes = await getCourseProgress(numericId)
        if (progRes) setProgress(progRes)
      } catch (err) {
        console.error('Failed loading completion details:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadBackendData()
  }, [courseIdParam])

  const handleDownloadCertificate = () => {
    if (!course) return
    alert(`Downloading Official Certificate of Completion for "${course.title}"`)
  }

  const handleRetakeAssessment = () => {
    if (courseIdParam) {
      router.push(`/dashboard/assessments?courseId=${courseIdParam}`)
    } else {
      router.push('/dashboard/assessments')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Verifying course completion & assessment records...</p>
      </div>
    )
  }

  // State A: Assessment Failed Screen
  if (!isPassed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/5 via-background to-amber-500/5 p-6 lg:p-12 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-card p-8 md:p-10 shadow-xl text-center space-y-6"
        >
          <div className="mx-auto flex items-center justify-center size-20 rounded-3xl bg-red-500/10 text-red-600 border border-red-500/20 shadow-md">
            <ShieldAlert className="size-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              ❌ Assessment Not Passed
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              You scored <strong className="text-red-600 font-bold">{assessmentScore}%</strong> on the evaluation. A minimum passing score of <strong className="text-foreground">{REQUIRED_PASSING_SCORE}%</strong> is required to earn your certificate.
            </p>
          </div>

          {/* Score breakdown pill */}
          <div className="rounded-2xl border border-border bg-muted/40 p-4 grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Your Score
              </span>
              <p className="text-lg font-bold text-red-600">{assessmentScore}%</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Passing Requirement
              </span>
              <p className="text-lg font-bold text-foreground">{REQUIRED_PASSING_SCORE}%</p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-xs font-bold hover:bg-muted transition-all"
            >
              <ArrowLeft className="size-3.5" /> Return to Dashboard
            </button>
            <button
              onClick={handleRetakeAssessment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md"
            >
              <RotateCcw className="size-3.5" /> Retake Assessment
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // State B: Course Completed Successfully & Certificate Available Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Main Completion Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-xl text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />

          {/* Trophy Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto flex items-center justify-center size-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl"
          >
            <Trophy className="size-10" />
          </motion.div>

          {/* Heading */}
          <div className="space-y-3 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              🎉 Course Completed!
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Congratulations! You have successfully completed all learning modules and passed the required evaluation for{' '}
              <strong className="text-foreground">{course?.title || 'your course'}</strong>.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 relative z-10">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Lessons Completed
              </span>
              <p className="text-xl font-bold text-primary mt-0.5">
                {progress?.completed_lessons || progress?.total_lessons || 100}%
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Assessment Score
              </span>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{assessmentScore}%</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-muted/40 p-4 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Course Level
              </span>
              <p className="text-xl font-bold text-accent mt-0.5">
                {course?.level || 'Beginner'}
              </p>
            </div>
          </div>

          {/* Certificate Download Card */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-card p-6 text-left space-y-4 relative z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Award className="size-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Official Certificate Available</h4>
                <p className="text-xs text-muted-foreground">
                  Verified by Arivu AI Learning Platform
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadCertificate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md"
            >
              <Download className="size-4" /> Download Certificate
            </button>
          </div>

          {/* Bottom Navigation CTAs */}
          <div className="pt-4 border-t border-border flex justify-between items-center gap-4 relative z-10">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Return to Dashboard
            </button>

            <button
              onClick={() => router.push('/dashboard/courses')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              Browse More Courses <ArrowRight className="size-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
