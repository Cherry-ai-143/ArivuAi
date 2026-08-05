'use client'

import { Users, BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'
import { useTeacherDashboard } from '@/hooks/useDashboard'

const ICONS = ['🐍', '🔗', '🧠', '📊', '⚡', '💻']

export function RecentCourses() {
  const { data, isLoading } = useTeacherDashboard()
  const coursesList = data?.courses || []

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-sm p-8">
        <div className="h-6 w-36 bg-muted rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Courses</h3>
        <Link
          href="/course-builder"
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-sm hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          Create Course
        </Link>
      </div>

      {coursesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
          <BookOpen className="mx-auto size-8 text-muted-foreground" />
          <h4 className="font-semibold text-foreground">No courses created yet</h4>
          <p className="text-xs text-muted-foreground">Start by building your first subject course with AI assistance.</p>
          <Link
            href="/course-builder"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {coursesList.map((course, idx) => {
            const icon = ICONS[idx % ICONS.length]
            return (
              <div
                key={course.id}
                className="rounded-xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-6 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl p-3 rounded-lg bg-primary/10 text-primary">
                    {icon}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    course.is_published
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Content */}
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-4">{course.level || 'Higher Education'}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-4 py-3 border-y border-border/50">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {course.students_count || 0} Students
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
