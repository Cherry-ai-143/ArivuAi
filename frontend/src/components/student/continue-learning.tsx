'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Clock, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getMyEnrollments, CourseEnrollmentResponse } from '@/lib/services/enrollment.service'
import { getCourseProgress } from '@/lib/services/progress.service'

const THUMBNAILS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
]

interface EnrolledCourseCardItem {
  id: number
  title: string
  level: string
  progress: number
  thumbnail?: string | null
  enrolledAt: string
}

export function ContinueLearning() {
  const [items, setItems] = useState<EnrolledCourseCardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEnrolled = async () => {
      try {
        setIsLoading(true)
        const enrollments = await getMyEnrollments()
        if (enrollments && enrollments.length > 0) {
          const list: EnrolledCourseCardItem[] = []

          for (const enc of enrollments) {
            const course = enc.course
            if (!course) continue

            let pct = 0
            try {
              const prog = await getCourseProgress(course.id)
              if (prog) pct = prog.progress || 0
            } catch (e) {
              console.error('Failed fetching progress for course', course.id, e)
            }

            list.push({
              id: course.id,
              title: course.title,
              level: course.level || 'Beginner',
              progress: pct,
              thumbnail: course.thumbnail,
              enrolledAt: enc.enrolled_at,
            })
          }

          // Sort priority: Most recently enrolled / highest incomplete progress
          list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
          setItems(list)
        }
      } catch (err) {
        console.error('Failed loading enrolled courses for ContinueLearning:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEnrolled()
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
        <div className="h-6 w-48 bg-muted rounded mb-6 animate-pulse" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-border bg-card p-4 animate-pulse">
              <div className="h-32 bg-muted rounded mb-3" />
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="rounded-3xl border border-border bg-card p-7 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">
            Continue Learning
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pick up where you left off
          </p>
        </div>
        <Link
          href="/dashboard/courses"
          className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
        >
          View All Courses
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
          <BookOpen className="mx-auto size-10 text-primary opacity-60" />
          <h4 className="font-bold text-foreground text-base">You haven't enrolled in any courses yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Start your learning journey today by exploring published courses created by teachers.
          </p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition-all"
          >
            <Sparkles className="size-4" /> Explore Published Courses
          </Link>
        </div>
      ) : (
        /* Course Cards */
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((course, index) => {
            const progress = course.progress
            const level = course.level
            const bgGrad = THUMBNAILS[index % THUMBNAILS.length]
            const thumbUrl = course.thumbnail
              ? course.thumbnail.startsWith('/uploads/')
                ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'}${course.thumbnail}`
                : course.thumbnail
              : null

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                className="group rounded-2xl border border-border overflow-hidden bg-gradient-to-b from-card to-muted/50 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {/* Thumbnail Header with Fallback */}
                <div
                  className="h-32 w-full relative overflow-hidden flex items-center justify-center"
                  style={{ background: thumbUrl ? '#0f172a' : bgGrad }}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={course.title}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <div className="text-3xl font-serif font-bold text-white/40">
                        {course.title[0]?.toUpperCase() || 'C'}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold text-foreground text-sm line-clamp-2 mb-3">
                    {course.title}
                  </h4>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{progress}% Complete</span>
                      <span className="text-xs font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-primary/10 text-primary">
                      {level}
                    </span>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="w-full rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Continue Learning
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
