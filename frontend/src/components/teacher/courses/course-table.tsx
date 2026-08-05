'use client'

import { useRouter } from 'next/navigation'
import { MoreVertical, Users, BookOpen, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Course } from '@/types/course'

interface CourseTableProps {
  courses: Course[]
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
  onEditWizard?: (course: Course) => void
}

export function CourseTable({ courses, onEdit, onDelete, onEditWizard }: CourseTableProps) {
  const router = useRouter()

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">No courses found</h3>
        <p className="mt-2 text-xs text-muted-foreground">Try adjusting your filters or search query, or create a new course.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-6 py-3.5 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Course</th>
            <th className="px-6 py-3.5 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Level</th>
            <th className="px-6 py-3.5 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3.5 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Status</th>
            <th className="px-6 py-3.5 text-left font-semibold text-foreground text-xs uppercase tracking-wider">Created</th>
            <th className="px-6 py-3.5 text-center font-semibold text-foreground text-xs uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const isPublished = course.is_published
            const statusLabel = isPublished ? 'Published' : 'Draft'

            return (
              <tr key={course.id} className="border-b border-border/60 transition-colors hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {course.level || 'Beginner'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <BookOpen className="size-3.5" />
                    <span>{course.duration_hours || 10}h</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                      isPublished
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'Recent'}
                </td>
                <td className="px-6 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
