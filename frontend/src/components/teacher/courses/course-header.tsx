import { Plus } from 'lucide-react'

interface CourseHeaderProps {
  onCreateClick: () => void
  coursesCount: number
}

export function CourseHeader({ onCreateClick, coursesCount }: CourseHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your courses and track student progress
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition-all shadow-sm"
      >
        <Plus className="size-5" />
        Create Course
      </button>
    </div>
  )
}


