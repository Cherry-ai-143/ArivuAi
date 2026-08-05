'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  Trophy,
  Zap,
  FileText,
  Play,
  CheckCircle2,
  Target,
} from 'lucide-react'
import Image from 'next/image'
import { getCourseById } from '@/lib/services/course.service'
import { getChaptersByCourse } from '@/lib/services/chapter.service'
import { getLessonsByChapter } from '@/lib/services/lesson.service'
import { getLessonResources } from '@/lib/services/lesson-resource.service'
import type { Course } from '@/types/course'

interface CourseDetail {
  id: string
  title: string
  instructor: string
  description: string
  difficulty: string
  duration: string
  chapters: number
  lessons: number
  rating: number
  enrolled: number
  thumbnail: string
  skillsLearned: string[]
  prerequisites: string[]
  learningOutcomes: string[]
  resources: {
    pdfs: number
    videos: number
    assignments: number
    aiQuiz: boolean
  }
  estimatedCompletion: string
}

const courseData: { [key: string]: CourseDetail } = {
  '1': {
    id: '1',
    title: 'Advanced React Patterns',
    instructor: 'Sarah Chen',
    description:
      'Master advanced React patterns including custom hooks, render props, compound components, and performance optimization techniques. This comprehensive course will transform you into a React expert.',
    difficulty: 'Advanced',
    duration: '28 hours',
    chapters: 8,
    lessons: 24,
    rating: 4.8,
    enrolled: 2841,
    thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=react',
    skillsLearned: [
      'Custom Hooks',
      'Render Props',
      'Compound Components',
      'Performance Optimization',
      'Context API',
      'Concurrent Features',
    ],
    prerequisites: ['React Fundamentals', 'JavaScript ES6+', 'HTML/CSS'],
    learningOutcomes: [
      'Build scalable React applications',
      'Optimize performance',
      'Create reusable component patterns',
      'Handle complex state management',
      'Debug React applications efficiently',
    ],
    resources: {
      pdfs: 12,
      videos: 24,
      assignments: 8,
      aiQuiz: true,
    },
    estimatedCompletion: '4-6 weeks',
  },
  '2': {
    id: '2',
    title: 'Web Design Fundamentals',
    instructor: 'Mike Johnson',
    description:
      'Learn the fundamentals of modern web design. From layout principles to typography, color theory, and responsive design. Build beautiful, user-centered websites.',
    difficulty: 'Beginner',
    duration: '24 hours',
    chapters: 6,
    lessons: 20,
    rating: 4.6,
    enrolled: 5420,
    thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=design',
    skillsLearned: [
      'Layout & Grids',
      'Typography',
      'Color Theory',
      'Responsive Design',
      'User Experience',
      'Accessibility',
    ],
    prerequisites: ['Basic HTML/CSS'],
    learningOutcomes: [
      'Design professional websites',
      'Understand design principles',
      'Create responsive layouts',
      'Implement accessible design',
      'Use design tools effectively',
    ],
    resources: {
      pdfs: 8,
      videos: 20,
      assignments: 6,
      aiQuiz: true,
    },
    estimatedCompletion: '3-4 weeks',
  },
  '3': {
    id: '3',
    title: 'TypeScript Mastery',
    instructor: 'Emma Davis',
    description:
      'Become a TypeScript expert. Learn static typing, generics, decorators, and advanced patterns. Transform your JavaScript code into robust, type-safe applications.',
    difficulty: 'Advanced',
    duration: '32 hours',
    chapters: 10,
    lessons: 30,
    rating: 4.9,
    enrolled: 3120,
    thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=typescript',
    skillsLearned: [
      'Static Typing',
      'Generics',
      'Decorators',
      'Type Guards',
      'Advanced Types',
      'Utility Types',
    ],
    prerequisites: ['JavaScript ES6+', 'OOP Concepts'],
    learningOutcomes: [
      'Write type-safe code',
      'Use advanced TypeScript features',
      'Migrate JavaScript to TypeScript',
      'Design scalable architectures',
      'Debug TypeScript effectively',
    ],
    resources: {
      pdfs: 15,
      videos: 30,
      assignments: 10,
      aiQuiz: true,
    },
    estimatedCompletion: '5-7 weeks',
  },
}

export default function CourseOverviewPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<CourseDetail>(courseData[courseId] || courseData['1'])

  useEffect(() => {
    const numericId = parseInt(courseId, 10)
    if (!isNaN(numericId)) {
      const loadCourseStats = async () => {
        try {
          const data = await getCourseById(numericId)
          let totalChapters = 0
          let totalLessons = 0
          let pdfCount = 0
          let videoCount = 0

          try {
            const chapters = await getChaptersByCourse(numericId)
            if (chapters && chapters.length > 0) {
              totalChapters = chapters.length
              for (const chap of chapters) {
                const lesRes = await getLessonsByChapter(chap.id)
                if (lesRes && lesRes.items) {
                  totalLessons += lesRes.items.length
                  for (const les of lesRes.items) {
                    try {
                      const resData = await getLessonResources(les.id)
                      if (resData) {
                        pdfCount += (resData.pdfs?.length || 0) + (resData.ppt?.length || 0)
                        videoCount += (resData.videos?.length || 0) + (resData.youtube?.length || 0)
                      }
                    } catch (e) {
                      console.error('Failed fetching resources for lesson:', e)
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('Failed fetching chapters:', e)
          }

          if (data) {
            setCourse({
              id: String(data.id),
              title: data.title,
              instructor: 'Arivu AI Instructor',
              description: data.description || 'Course details & curriculum',
              difficulty: data.level || 'Beginner',
              duration: `${data.duration_hours || 40} hours`,
              chapters: totalChapters || 1,
              lessons: totalLessons || 1,
              rating: 4.9,
              enrolled: 1,
              thumbnail: data.thumbnail
                ? data.thumbnail.startsWith('/uploads/')
                  ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'}${data.thumbnail}`
                  : data.thumbnail
                : 'https://api.dicebear.com/7.x/shapes/svg?seed=' + data.title,
              skillsLearned: ['Foundational Concepts', 'Practical Problem Solving', 'Assessments & Quizzes'],
              prerequisites: ['Basic Prerequisites'],
              learningOutcomes: ['Master core subject principles', 'Hands-on practice & assignments'],
              resources: {
                pdfs: pdfCount,
                videos: videoCount,
                assignments: 0,
                aiQuiz: true,
              },
              estimatedCompletion: '4 weeks',
            })
          }
        } catch (err) {
          console.error('Failed to load course detail:', err)
        }
      }

      loadCourseStats()
    }
  }, [courseId])

  const handleEnroll = () => {
    router.push(`/dashboard/courses/${courseId}/learn`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Courses
          </button>
        </div>
      </div>

      {/* Course Thumbnail Hero Container */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="relative w-full rounded-3xl overflow-hidden border border-border bg-slate-950/90 shadow-xl flex items-center justify-center min-h-[260px] max-h-[480px]">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-auto max-h-[480px] object-contain rounded-3xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Meta */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{course.title}</h1>
              <div className="flex items-center gap-4 flex-wrap text-muted-foreground">
                <span className="text-primary font-semibold">{course.instructor}</span>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <span>{course.rating} ({course.enrolled.toLocaleString()} students)</span>
                </div>
                <span className="text-accent font-semibold">{course.difficulty}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">About this course</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{course.description}</p>
            </div>

            {/* Skills Learned */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="size-5 text-accent" />
                Skills you will learn
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {course.skillsLearned.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20 text-foreground"
                  >
                    <CheckCircle2 className="size-4 text-accent flex-shrink-0" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Learning outcomes
              </h2>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Prerequisites</h2>
              <div className="space-y-2">
                {course.prerequisites.map((prereq) => (
                  <div
                    key={prereq}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted text-foreground"
                  >
                    <Zap className="size-4 text-accent" />
                    {prereq}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats Card */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Course Duration</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  {course.duration}
                </p>
              </div>

              <hr className="border-border" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Chapters</span>
                  <span className="font-semibold text-foreground">{course.chapters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <span className="font-semibold text-foreground">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Est. Completion</span>
                  <span className="font-semibold text-foreground">{course.estimatedCompletion}</span>
                </div>
              </div>

              <hr className="border-border" />

              {/* Resources */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Resources Included:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Play className="size-4 text-primary" />
                    {course.resources.videos} video lectures
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-secondary" />
                    {course.resources.pdfs} PDF guides
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-accent" />
                    {course.resources.assignments} assignments
                  </div>
                  {course.resources.aiQuiz && (
                    <div className="flex items-center gap-2 text-accent font-semibold">
                      <Zap className="size-4" />
                      AI Quiz (unlocked at completion)
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:brightness-110 transition-all"
              >
                Start Learning
              </button>
            </div>

            {/* Course Info Card */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students Enrolled</span>
                <div className="flex items-center gap-1">
                  <Users className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {course.enrolled.toLocaleString()}
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Course Rating</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < Math.floor(course.rating)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">{course.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
