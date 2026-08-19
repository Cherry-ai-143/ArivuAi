'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Award,
  Loader2,
  Target,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { getCourseById, Course } from '@/lib/services/course.service'
import { getPublishedAssessmentForLesson } from '@/lib/services/assessment.service'
import type { PublishedAssessment } from '@/types/assessment'

function DoneWithLearningContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params.courseId as string
  const lessonId = searchParams.get('lessonId')

  const [course, setCourse] = useState<Course | null>(null)
  const [assessment, setAssessment] = useState<PublishedAssessment | null>(null)
  const [assessmentLoading, setAssessmentLoading] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const numericId = parseInt(courseId, 10)
    if (isNaN(numericId)) return

    const loadCourseData = async () => {
      try {
        setIsLoading(true)
        const res = await getCourseById(numericId)
        if (res) setCourse(res)
      } catch (err) {
        console.error('Failed to load course details for Done page:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [courseId])

  // Fetch published assessment for the lesson
  useEffect(() => {
    const loadAssessment = async () => {
      if (!lessonId) {
        setAssessmentLoading(false)
        return
      }
      try {
        setAssessmentLoading(true)
        const res = await getPublishedAssessmentForLesson(parseInt(lessonId, 10))
        setAssessment(res)
      } catch (err) {
        console.error('Failed to load published assessment:', err)
        setAssessment(null)
      } finally {
        setAssessmentLoading(false)
      }
    }
    loadAssessment()
  }, [lessonId])

  const handleStartAssessment = () => {
    if (assessment) {
      router.push(`/dashboard/assessments/${assessment.id}/take`)
    } else {
      router.push(`/dashboard/assessments?courseId=${courseId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 lg:p-12 flex flex-col justify-center items-center">
      {/* Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 md:p-12 shadow-xl text-center space-y-8 relative overflow-hidden"
      >
        {/* Decorative Background Element */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 pointer-events-none" />

        {/* Celebration Header Graphic */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto flex items-center justify-center size-20 rounded-3xl bg-gradient-to-br from-primary to-accent shadow-lg text-primary-foreground"
        >
          <GraduationCap className="size-10" />
        </motion.div>

        {/* Title & Celebration Text */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
            <CheckCircle2 className="size-4" /> Lesson Complete
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
            🎉 Lesson Complete!
          </h1>

          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Congratulations! You've successfully completed all learning materials for{' '}
            <strong className="text-foreground">{course?.title || 'this course'}</strong>.
            {assessment
              ? " Now it's time to test your understanding with the assessment below."
              : ' Great job on finishing this lesson!'}
          </p>
        </div>

        {/* Course Summary Pill */}
        {isLoading ? (
          <div className="flex justify-center p-6 text-muted-foreground text-xs gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Loading course info...</span>
          </div>
        ) : course ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-5 grid grid-cols-2 gap-4 text-left relative z-10">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Course Title
              </span>
              <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-0.5">
                {course.title}
              </h4>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Difficulty Level
              </span>
              <h4 className="text-xs font-bold text-primary mt-0.5">
                {course.level || 'Beginner'}
              </h4>
            </div>
          </div>
        ) : null}

        {/* Assessment Card */}
        {assessmentLoading ? (
          <div className="flex justify-center p-4 text-muted-foreground text-xs gap-2 relative z-10">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Loading assessment...</span>
          </div>
        ) : assessment ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6 space-y-4 text-left relative z-10"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Assessment Ready
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  {assessment.title}
                </h3>
              </div>
            </div>

            {/* Assessment Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AssessmentStat
                icon={<FileText className="size-3.5" />}
                label="Questions"
                value={assessment.question_count}
              />
              <AssessmentStat
                icon={<Clock className="size-3.5" />}
                label="Duration"
                value={`${assessment.duration_minutes}m`}
              />
              <AssessmentStat
                icon={<Target className="size-3.5" />}
                label="Pass Score"
                value={`${assessment.passing_score}%`}
              />
              <AssessmentStat
                icon={<RotateCcw className="size-3.5" />}
                label="Attempts"
                value={`${assessment.attempts_used ?? (assessment.max_attempts - assessment.attempts_remaining)}/${assessment.max_attempts}`}
              />
            </div>

            {(assessment.attempts_remaining <= 0 || (assessment.attempts_used !== undefined && assessment.attempts_used >= assessment.max_attempts)) && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-600">
                You have reached the maximum attempt limit ({assessment.max_attempts}) for this assessment.
              </div>
            )}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center relative z-10">
            <p className="text-sm text-muted-foreground">
              No assessment has been published yet for this lesson.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="size-4" /> Return to Dashboard
          </button>

          {assessment && (assessment.attempts_remaining > 0 && (assessment.attempts_used === undefined || assessment.attempts_used < assessment.max_attempts)) && (
            <button
              onClick={handleStartAssessment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
            >
              <Sparkles className="size-4" /> Start Assessment <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function AssessmentStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}

export default function DoneWithLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <DoneWithLearningContent />
    </Suspense>
  )
}