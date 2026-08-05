'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Menu,
  X,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  ArrowLeft,
  FileText,
  Video,
  ExternalLink,
  Loader2,
  Play,
  GitBranch,
  Lock,
  Award,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { getCourseById } from '@/lib/services/course.service'
import { getChaptersByCourse } from '@/lib/services/chapter.service'
import { getLessonsByChapter } from '@/lib/services/lesson.service'
import { getLessonResources } from '@/lib/services/lesson-resource.service'
import {
  getCourseProgress,
  getLessonProgress,
  updateLessonProgress,
  CourseProgressResponse,
} from '@/lib/services/progress.service'
import { useQueryClient } from '@tanstack/react-query'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface RealResource {
  id: number
  title: string
  resource_type: string
  url?: string
  file_path?: string
  size_bytes?: number
}

interface RealLesson {
  id: number
  title: string
  description?: string
  order_number: number
  completed: boolean
  timeSpentSeconds?: number
  resources: RealResource[]
}

interface RealChapter {
  id: number
  title: string
  lessons: RealLesson[]
  completed: boolean
}

function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?enablejsapi=1`
    : null
}

function getResourceUrl(urlOrPath: string | undefined): string {
  if (!urlOrPath) return '#'
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath
  }
  if (urlOrPath.startsWith('/uploads/')) {
    const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'
    return `${backendBase}${urlOrPath}`
  }
  return urlOrPath
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function CourseLearningPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const courseId = params.courseId as string

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [courseTitle, setCourseTitle] = useState<string>('Loading Course...')
  const [chapters, setChapters] = useState<RealChapter[]>([])
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Overall Course Progress
  const [courseProgress, setCourseProgress] = useState<CourseProgressResponse | null>(null)

  // Live Video Playback & Watched Duration Tracking State
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const maxWatchedPositionRef = useRef<number>(0)
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0)
  const [videoTotalDuration, setVideoTotalDuration] = useState<number>(0)
  const [watchPercentage, setWatchPercentage] = useState<number>(0)
  const [seekWarning, setSeekWarning] = useState<string | null>(null)

  // YouTube IFrame Player Instance Ref
  const ytPlayerRef = useRef<any>(null)

  // Ref to track completed lessons safely without duplicate triggers
  const completedLessonsRef = useRef<Set<number>>(new Set())

  // Load Course, Chapters, Lessons & Saved Progress
  useEffect(() => {
    const numericId = parseInt(courseId, 10)
    if (isNaN(numericId)) return

    const loadRealCourseData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Course metadata
        const courseRes = await getCourseById(numericId)
        if (courseRes) {
          setCourseTitle(courseRes.title)
        }

        // 2. Fetch Course Progress
        const progRes = await getCourseProgress(numericId)
        if (progRes) setCourseProgress(progRes)

        // 3. Fetch Chapters & Lessons dynamically from backend
        const rawChapters = await getChaptersByCourse(numericId)
        if (rawChapters && rawChapters.length > 0) {
          const loadedChapters: RealChapter[] = []

          for (const chap of rawChapters) {
            const loadedLessons: RealLesson[] = []
            try {
              const lesRes = await getLessonsByChapter(chap.id)
              if (lesRes && lesRes.items) {
                for (const l of lesRes.items) {
                  let isCompleted = false
                  let timeSpent = 0

                  // Fetch lesson progress
                  const lProg = await getLessonProgress(l.id)
                  if (lProg) {
                    isCompleted = lProg.completed || lProg.progress_percentage === 100
                    timeSpent = lProg.time_spent_seconds || 0
                    if (isCompleted) {
                      completedLessonsRef.current.add(l.id)
                    }
                  }

                  // Fetch lesson resources
                  let resList: RealResource[] = []
                  try {
                    const grouped = await getLessonResources(l.id)
                    if (grouped) {
                      const all = grouped.all_resources || []
                      resList = all.map((r) => ({
                        id: r.id,
                        title: r.title,
                        resource_type: r.resource_type,
                        url: r.url || undefined,
                        file_path: r.file_path || undefined,
                        size_bytes: r.file_size || undefined,
                      }))
                    }
                  } catch (e) {
                    console.error('Failed fetching resources for lesson', l.id, e)
                  }

                  loadedLessons.push({
                    id: l.id,
                    title: l.title,
                    description: l.description || '',
                    order_number: l.order_number || 1,
                    completed: isCompleted,
                    timeSpentSeconds: timeSpent,
                    resources: resList,
                  })
                }
              }
            } catch (e) {
              console.error('Failed fetching lessons for chapter', chap.id, e)
            }

            const isChapCompleted =
              loadedLessons.length > 0 && loadedLessons.every((l) => l.completed)

            loadedChapters.push({
              id: chap.id,
              title: chap.title,
              lessons: loadedLessons,
              completed: isChapCompleted,
            })
          }

          setChapters(loadedChapters)
          if (loadedChapters.length > 0 && loadedChapters[0].lessons.length > 0) {
            const firstIncomplete = loadedChapters
              .flatMap((c) => c.lessons)
              .find((l) => !l.completed)
            setActiveLessonId(firstIncomplete ? firstIncomplete.id : loadedChapters[0].lessons[0].id)
          }
        }
      } catch (err) {
        console.error('Failed loading real course:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRealCourseData()
  }, [courseId])

  // Reset playback state when active lesson changes
  useEffect(() => {
    maxWatchedPositionRef.current = 0
    setVideoCurrentTime(0)
    setVideoTotalDuration(0)
    setWatchPercentage(0)
    setSeekWarning(null)

    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
      try {
        ytPlayerRef.current.destroy()
      } catch (e) {
        // ignore
      }
      ytPlayerRef.current = null
    }
  }, [activeLessonId])

  const allLessons = chapters.flatMap((c) => c.lessons)
  const activeLesson = allLessons.find((l) => l.id === activeLessonId)
  const activeChapter = chapters.find((c) => c.lessons.some((l) => l.id === activeLessonId))
  const activeLessonIndex = allLessons.findIndex((l) => l.id === activeLessonId)

  const isCurrentLessonCompleted =
    Boolean(activeLesson?.completed) ||
    (activeLessonId ? completedLessonsRef.current.has(activeLessonId) : false)

  // Identify resources by type
  const videoResource = activeLesson?.resources.find(
    (r) =>
      r.resource_type === 'YouTube Video' ||
      r.resource_type === 'Video' ||
      (r.url && (r.url.includes('youtube.com') || r.url.includes('youtu.be')))
  )

  const youtubeEmbedUrl = videoResource ? getYouTubeEmbedUrl(videoResource.url) : null

  // Instant Lesson Completion Handler
  const triggerLessonCompletion = async (completedLessonId: number) => {
    if (!completedLessonId) return

    // Immediately mark in local Ref and React state so Next Lesson unlocks INSTANTLY
    completedLessonsRef.current.add(completedLessonId)

    setChapters((prev) =>
      prev.map((chap) => ({
        ...chap,
        lessons: chap.lessons.map((les) =>
          les.id === completedLessonId ? { ...les, completed: true } : les
        ),
        completed: chap.lessons.every((les) =>
          les.id === completedLessonId ? true : les.completed
        ),
      }))
    )

    try {
      await updateLessonProgress(completedLessonId, {
        progress_percentage: 100,
        time_spent_seconds: Math.round(maxWatchedPositionRef.current || videoTotalDuration || 10),
      })

      const numericId = parseInt(courseId, 10)
      if (!isNaN(numericId)) {
        const newProg = await getCourseProgress(numericId)
        if (newProg) setCourseProgress(newProg)
      }

      queryClient.invalidateQueries({ queryKey: ['progress'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    } catch (err) {
      console.error('Failed saving lesson completion:', err)
    }
  }

  // HTML5 Video Time Update & Seek Prevention
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const duration = videoRef.current.duration || 1

    setVideoTotalDuration(duration)

    // Seek Prevention: Prevent jumping ahead past maxWatchedPosition + 3 seconds
    if (current > maxWatchedPositionRef.current + 3) {
      videoRef.current.currentTime = maxWatchedPositionRef.current
      setSeekWarning('You skipped part of this lesson. Please watch the skipped content before continuing.')
      return
    }

    setSeekWarning(null)
    if (current > maxWatchedPositionRef.current) {
      maxWatchedPositionRef.current = current
    }

    setVideoCurrentTime(maxWatchedPositionRef.current)

    const pct = Math.min(100, Math.round((maxWatchedPositionRef.current / duration) * 100))
    setWatchPercentage(pct)

    // Auto-complete if 95% of video length has been watched
    if (pct >= 95 && activeLesson) {
      triggerLessonCompletion(activeLesson.id)
    }
  }

  // YouTube IFrame Player API Integration
  useEffect(() => {
    if (!youtubeEmbedUrl || !activeLesson) return

    // Function to initialize YouTube Player
    const initYTPlayer = () => {
      const iframe = document.getElementById('youtube-iframe-player') as HTMLIFrameElement
      if (!iframe || !window.YT || !window.YT.Player) return

      try {
        ytPlayerRef.current = new window.YT.Player('youtube-iframe-player', {
          events: {
            onStateChange: (event: any) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                if (activeLesson) {
                  setWatchPercentage(100)
                  triggerLessonCompletion(activeLesson.id)
                }
              }
            },
          },
        })
      } catch (e) {
        console.error('YouTube player init error:', e)
      }
    }

    // Load YouTube IFrame API script if not already present
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer()
      }
    } else {
      setTimeout(initYTPlayer, 500)
    }

    // Polling timer to update watched position and enforce seek prevention on YouTube player
    const pollInterval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const curr = ytPlayerRef.current.getCurrentTime() || 0
          const dur = ytPlayerRef.current.getDuration() || 1

          if (dur > 0) {
            setVideoTotalDuration(dur)

            // Seek Prevention Check
            if (curr > maxWatchedPositionRef.current + 3) {
              ytPlayerRef.current.seekTo(maxWatchedPositionRef.current, true)
              setSeekWarning('You skipped part of this lesson. Please watch the skipped content before continuing.')
              return
            }

            setSeekWarning(null)
            if (curr > maxWatchedPositionRef.current) {
              maxWatchedPositionRef.current = curr
            }

            setVideoCurrentTime(maxWatchedPositionRef.current)

            const pct = Math.min(100, Math.round((maxWatchedPositionRef.current / dur) * 100))
            setWatchPercentage(pct)

            // Auto-complete if 95% of video length has been watched
            if (pct >= 95 && activeLesson && !isCurrentLessonCompleted) {
              triggerLessonCompletion(activeLesson.id)
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [youtubeEmbedUrl, activeLesson, isCurrentLessonCompleted])

  const completedCount = allLessons.filter(
    (l) => l.completed || completedLessonsRef.current.has(l.id)
  ).length
  const calculatedProgressPct =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0

  // Handle Next Lesson / Done with Learning Transition
  const handleNextOrFinish = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[activeLessonIndex + 1].id)
    } else {
      router.push(`/dashboard/courses/${courseId}/done?lessonId=${activeLessonId}`)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Curriculum Tree */}
      <div
        className={`${sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 overflow-hidden bg-card border-r border-border flex flex-col flex-shrink-0`}
      >
        {/* Course Header & Progress Bar */}
        <div className="p-4 border-b border-border space-y-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Course Overview
          </button>
          <h3 className="font-bold text-foreground line-clamp-2 text-sm">{courseTitle}</h3>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Course Progress</span>
              <span className="font-bold text-primary">
                {courseProgress ? courseProgress.progress : calculatedProgressPct}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-indigo-500 to-accent transition-all duration-500"
                style={{
                  width: `${courseProgress ? courseProgress.progress : calculatedProgressPct}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {completedCount} of {allLessons.length} lessons completed
            </p>
          </div>
        </div>

        {/* Chapters & Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-xs gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Fetching course curriculum...</span>
            </div>
          ) : chapters.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No chapters or lessons added yet.
            </div>
          ) : (
            chapters.map((chap, cIdx) => (
              <div key={chap.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div
                    className={`size-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${chap.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-primary/10 text-primary'
                      }`}
                  >
                    {chap.completed ? <CheckCircle2 className="size-3.5" /> : cIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-2">{chap.title}</p>
                  </div>
                </div>

                <div className="ml-6 space-y-1">
                  {chap.lessons.map((les, lIdx) => {
                    const isActive = activeLessonId === les.id
                    const isDone = les.completed || completedLessonsRef.current.has(les.id)
                    const hasVideo = les.resources.some(
                      (r) => r.resource_type === 'YouTube Video' || r.resource_type === 'Video'
                    )

                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLessonId(les.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs flex items-center gap-2 ${isActive
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : isDone
                              ? 'text-foreground bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                      >
                        {isDone ? (
                          <CheckCircle2
                            className={`size-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'
                              }`}
                          />
                        ) : hasVideo ? (
                          <Video className="size-3.5 flex-shrink-0" />
                        ) : (
                          <FileText className="size-3.5 flex-shrink-0" />
                        )}

                        <span className="flex-1 truncate">
                          L{lIdx + 1}: {les.title}
                        </span>

                        {isDone && (
                          <span
                            className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-600'
                              }`}
                          >
                            Done
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content & Video Player */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {activeChapter?.title || 'Chapter'}
              </p>
              <h2 className="text-sm font-bold text-foreground">
                {activeLesson?.title || 'Select a lesson'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real Video Duration & Watched Time Counter Badge */}
            {isCurrentLessonCompleted ? (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" />
                <span>Lesson Completed</span>
              </div>
            ) : videoTotalDuration > 0 ? (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <Clock className="size-3.5 animate-spin" />
                <span>
                  Watched {formatTime(videoCurrentTime)} / {formatTime(videoTotalDuration)} ({watchPercentage}%)
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <FileText className="size-3.5" />
                <span>Study Materials Lesson</span>
              </div>
            )}

            <button
              onClick={() => router.back()}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-accent transition-colors"
            >
              Exit Player
            </button>
          </div>
        </div>

        {/* Lesson View Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Loading lesson content...</p>
            </div>
          ) : !activeLesson ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
              <BookOpen className="size-12 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-bold text-foreground">No Lesson Selected</h3>
              <p className="text-xs text-muted-foreground">Select a lesson from the left curriculum panel to begin learning.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* VIDEO PLAYER SECTION */}
              {videoResource ? (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg space-y-2">
                  <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                    {youtubeEmbedUrl ? (
                      <iframe
                        key={`${activeLessonId}-${youtubeEmbedUrl}`}
                        id="youtube-iframe-player"
                        src={youtubeEmbedUrl}
                        title={videoResource.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : videoResource.url || videoResource.file_path ? (
                      <video
                        key={`${activeLessonId}-${getResourceUrl(videoResource.file_path || videoResource.url)}`}
                        ref={videoRef}
                        src={getResourceUrl(videoResource.file_path || videoResource.url)}
                        controls
                        onTimeUpdate={handleVideoTimeUpdate}
                        onSeeking={handleVideoTimeUpdate}
                        onEnded={() => activeLesson && triggerLessonCompletion(activeLesson.id)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-white text-center p-6">
                        <Video className="size-12 mx-auto mb-2 text-rose-500" />
                        <p className="font-semibold text-sm">{videoResource.title}</p>
                      </div>
                    )}
                  </div>

                  {/* SEEK WARNING NOTICE */}
                  {seekWarning && (
                    <div className="mx-4 my-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                      <ShieldAlert className="size-4 text-amber-500 flex-shrink-0" />
                      <span>{seekWarning}</span>
                    </div>
                  )}

                  <div className="p-4 bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                      <Video className="size-4" />
                      <span>{videoResource.title}</span>
                    </div>
                    {videoTotalDuration > 0 && (
                      <span className="text-xs font-bold text-muted-foreground">
                        Duration: {formatTime(videoTotalDuration)}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* LESSON DETAILS */}
              <div className="space-y-3 border-b border-border pb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      Lesson {activeLessonIndex + 1}
                    </span>
                    <h1 className="text-2xl font-bold text-foreground">{activeLesson.title}</h1>
                  </div>

                  {isCurrentLessonCompleted && (
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeLesson.description ||
                    'Welcome to this lesson! Watch the full video duration and review the attached study materials below.'}
                </p>
              </div>

              {/* ATTACHED STUDY MATERIALS */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-indigo-600" /> Lesson Study Materials ({activeLesson.resources.length})
                </h3>

                {activeLesson.resources.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No additional study files attached to this lesson yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeLesson.resources.map((res) => {
                      const isPdf =
                        res.resource_type === 'PDF' ||
                        res.resource_type === 'Document' ||
                        res.file_path
                      const isRepo = res.resource_type === 'GitHub Repository'
                      const targetUrl = getResourceUrl(res.file_path || res.url)

                      return (
                        <div
                          key={res.id}
                          className="rounded-2xl border border-border bg-card p-4 space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-xl flex-shrink-0 ${isPdf
                                  ? 'bg-indigo-500/10 text-indigo-600'
                                  : isRepo
                                    ? 'bg-purple-500/10 text-purple-600'
                                    : 'bg-rose-500/10 text-rose-600'
                                }`}
                            >
                              {isPdf ? (
                                <FileText className="size-5" />
                              ) : isRepo ? (
                                <GitBranch className="size-5" />
                              ) : (
                                <Video className="size-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {res.resource_type}
                              </span>
                              <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-0.5">
                                {res.title}
                              </h4>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                            <a
                              href={targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => activeLesson && triggerLessonCompletion(activeLesson.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-xs"
                            >
                              {isPdf ? <Download className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                              {isPdf ? 'Download / View Document' : 'Open Resource Link'}
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* AUTOMATICALLY UNLOCKED NEXT LESSON / DONE WITH LEARNING BUTTON */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground font-medium">
                  {isCurrentLessonCompleted ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Lesson Progress Saved ({formatTime(videoCurrentTime)} / {formatTime(videoTotalDuration)})
                    </span>
                  ) : (
                    <span>
                      Watched: <strong className="text-foreground">{formatTime(videoCurrentTime)}</strong> / {formatTime(videoTotalDuration)} ({watchPercentage}% / 95% required)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNextOrFinish}
                  disabled={!isCurrentLessonCompleted}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold shadow-md transition-all ${isCurrentLessonCompleted
                      ? 'bg-primary text-primary-foreground hover:brightness-110'
                      : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed border border-border'
                    }`}
                >
                  {!isCurrentLessonCompleted && <Lock className="size-3.5" />}
                  {activeLessonIndex < allLessons.length - 1 ? (
                    <>
                      Next Lesson <ChevronRight className="size-4" />
                    </>
                  ) : (
                    <>
                      Done with Learning <Award className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
