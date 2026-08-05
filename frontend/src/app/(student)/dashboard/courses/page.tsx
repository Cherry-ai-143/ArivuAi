'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Zap,
  Award,
  Loader2,
  CheckCircle2,
  BookMarked,
} from 'lucide-react'
import { getCourses, Course } from '@/lib/services/course.service'
import {
  getMyEnrollments,
  enrollInCourse,
  CourseEnrollmentResponse,
} from '@/lib/services/enrollment.service'
import { getCourseProgress } from '@/lib/services/progress.service'
import { useQueryClient } from '@tanstack/react-query'

const THUMBNAIL_GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
  'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
  'linear-gradient(135deg, #701a75 0%, #86198f 50%, #a21caf 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
]

interface CourseWithMeta extends Course {
  enrolledCount: number
  isEnrolled: boolean
  progress: number
  completed: boolean
}

export default function StudentCoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const initialTab = searchParams.get('tab') === 'my-learning' ? 'my-learning' : 'explore'

  const [activeTab, setActiveTab] = useState<'explore' | 'my-learning'>(initialTab)
  const [courses, setCourses] = useState<CourseWithMeta[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')

  const fetchBackendCourses = async () => {
    try {
      setIsLoading(true)

      const res = await getCourses()
      const allBackendCourses = res.items || []
      const publishedCourses = allBackendCourses.filter(
        (c: Course) => c.is_published === true
      )

      // 2. Fetch logged in student enrollments
      const enrollments = await getMyEnrollments()
      const enrolledMap = new Map<number, CourseEnrollmentResponse>()
      enrollments.forEach((e) => enrolledMap.set(e.course_id, e))

      // 3. Map course progress & meta
      const enriched: CourseWithMeta[] = []
      for (const course of publishedCourses) {
        const enc = enrolledMap.get(course.id)
        const isEnrolled = Boolean(enc)
        let progPct = 0
        let isCompleted = false

        if (isEnrolled) {
          try {
            const pRes = await getCourseProgress(course.id)
            if (pRes) {
              progPct = pRes.progress || 0
              isCompleted = progPct === 100
            }
          } catch (e) {
            console.error('Failed getting course progress for', course.id, e)
          }
        }

        enriched.push({
          ...course,
          enrolledCount: course.students_count || (isEnrolled ? 1 : 0),
          isEnrolled,
          progress: progPct,
          completed: isCompleted,
        })
      }

      setCourses(enriched)
    } catch (err) {
      console.error('Failed fetching published backend courses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBackendCourses()
  }, [])

  // Handle Enrollment
  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingCourseId(courseId)

      const result = await enrollInCourse(courseId)
      if (result) {
        // Invalidate React Query caches so student and teacher analytics stay refreshed
        queryClient.invalidateQueries({ queryKey: ['courses'] })
        queryClient.invalidateQueries({ queryKey: ['enrollments'] })
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] })

        // Update local state instantly
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  isEnrolled: true,
                  enrolledCount: c.enrolledCount + 1,
                }
              : c
          )
        )
      }
    } catch (err) {
      console.error('Enrollment error:', err)
    } finally {
      setEnrollingCourseId(null)
    }
  }

  // Filtered List based on Active Tab, Search, and Difficulty
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Tab filter
      if (activeTab === 'my-learning' && !c.isEnrolled) return false

      // Search filter
      if (
        searchQuery &&
        !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Difficulty filter
      if (
        selectedDifficulty !== 'ALL' &&
        c.level?.toUpperCase() !== selectedDifficulty.toUpperCase()
      ) {
        return false
      }

      return true
    })
  }, [courses, activeTab, searchQuery, selectedDifficulty])

  const enrolledCount = courses.filter((c) => c.isEnrolled).length

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {activeTab === 'explore' ? 'Explore Published Courses' : 'My Learning'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === 'explore'
              ? 'Discover expert-created courses and start learning with AI'
              : 'Track your active enrollments and continue your lessons'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-muted rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="size-3.5 text-primary" /> Explore Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('my-learning')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my-learning'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookMarked className="size-3.5 text-indigo-600" /> My Learning ({enrolledCount})
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <Filter className="size-3.5" /> Level:
          </span>
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedDifficulty(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDifficulty === lvl
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {lvl === 'ALL' ? 'All Levels' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid / Empty States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading published courses from backend...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <BookOpen className="mx-auto size-12 text-primary opacity-50" />
          {activeTab === 'my-learning' ? (
            <>
              <h3 className="text-lg font-bold text-foreground">No Enrolled Courses Yet</h3>
              <p className="text-xs text-muted-foreground">
                Start your learning journey today by exploring published courses created by teachers.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition-all"
              >
                <Sparkles className="size-4" /> Explore Published Courses
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-foreground">No Published Courses Available</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery || selectedDifficulty !== 'ALL'
                  ? 'No courses matched your filter criteria. Try clearing search filters.'
                  : 'No teacher-published courses are available at the moment. Please check back later!'}
              </p>
              {(searchQuery || selectedDifficulty !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDifficulty('ALL')
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Clear Filters
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, idx) => {
            const isEnrolling = enrollingCourseId === course.id
            const thumbUrl = course.thumbnail
              ? course.thumbnail.startsWith('/uploads/')
                ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'}${course.thumbnail}`
                : course.thumbnail
              : null
            const bgGrad = THUMBNAIL_GRADIENTS[idx % THUMBNAIL_GRADIENTS.length]

            return (
              <div
                key={course.id}
                className="group rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Card Header with Null Fallback */}
                  <div
                    className="h-44 w-full relative overflow-hidden flex items-center justify-center border-b border-border/40"
                    style={{ background: thumbUrl ? '#090d16' : bgGrad }}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={course.title}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-5xl font-serif font-bold text-white/30 mb-1">
                          {course.title[0]?.toUpperCase() || 'C'}
                        </div>
                        <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
                          Arivu AI Course
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur">
                        {course.level || 'BEGINNER'}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.description || 'Comprehensive curriculum created by Arivu AI Instructors.'}
                    </p>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-primary" />
                        <span>{course.duration_hours || 40}h Duration</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-indigo-600" />
                        <span>{course.enrolledCount} Students</span>
                      </div>
                    </div>

                    {/* Progress Bar (If Enrolled) */}
                    {course.isEnrolled && (
                      <div className="space-y-1 pt-2 border-t border-border/50">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-muted-foreground">Learning Progress</span>
                          <span className="text-primary font-bold">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button State Machine */}
                <div className="p-5 pt-0">
                  {course.completed ? (
                    <button
                      onClick={() => router.push(`/dashboard/course-completion`)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
                    >
                      <Award className="size-4" /> View Certificate
                    </button>
                  ) : course.isEnrolled ? (
                    <button
                      onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      Continue Learning <ArrowRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={isEnrolling}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-primary text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-75"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" /> Enrolling...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5" /> Enroll Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
