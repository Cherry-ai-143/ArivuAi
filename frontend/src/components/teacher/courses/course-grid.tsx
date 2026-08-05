'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Users, BookOpen, TrendingUp, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Course } from '@/types/course'

interface CourseGridProps {
  courses: Course[]
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
  onEditWizard?: (course: Course) => void
}

export function CourseGrid({ courses, onEdit, onDelete, onEditWizard }: CourseGridProps) {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <BookOpen className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No courses found</h3>
        <p className="mt-2 text-xs text-muted-foreground">Try adjusting your filters or search query, or create a new course.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const isPublished = course.is_published
        const statusLabel = isPublished ? 'Published' : 'Draft'

        return (
          <div
            key={course.id}
            onMouseEnter={() => setHoveredId(course.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-accent/30"
          >
            {/* Thumbnail Header */}
            <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-primary/10 via-indigo-600/10 to-accent/10 flex items-center justify-center overflow-hidden relative border border-border/40">
              {course.thumbnail ? (
                <img
                  src={
                    course.thumbnail.startsWith('/uploads/')
                      ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'}${course.thumbnail}`
                      : course.thumbnail
                  }
                  alt={course.title}
                  className="w-full h-full object-contain bg-slate-950/80 p-1"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="text-4xl font-serif font-bold text-primary/30">
                    {course.title[0]?.toUpperCase() || 'C'}
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground mt-2">{course.language || 'English'}</p>
                </div>
              )}
              {hoveredId === course.id && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center gap-2 p-4 text-center">
                  {!isPublished && onEditWizard ? (
                    <button
                      type="button"
                      onClick={() => onEditWizard(course)}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md"
                    >
                      ⚡ Resume Creation
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition-all shadow-md"
                    >
                      Open Course
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{course.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0">
                      <MoreVertical className="size-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      {!isPublished && onEditWizard ? (
                        <DropdownMenuItem onClick={() => onEditWizard(course)} className="gap-2 cursor-pointer font-bold text-primary">
                          <BookOpen className="size-4" />
                          Resume Creation
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/courses/${course.id}`)} className="gap-2 cursor-pointer font-bold text-primary">
                          <BookOpen className="size-4" />
                          Open Course
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(course)} className="gap-2 cursor-pointer">
                          <Edit className="size-4" />
                          Quick Edit Details
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(course)}
                          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {course.level || 'Beginner'}
                </span>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                    isPublished
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="size-3.5" />
                    <span>{course.students_count ?? 0} students</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="size-3.5" />
                    <span>{course.duration_hours || 10}h duration</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <span className="text-foreground font-semibold">
                      {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
