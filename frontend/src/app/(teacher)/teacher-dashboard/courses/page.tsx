'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, BookOpen, AlertCircle, RefreshCw } from 'lucide-react'

import { CourseHeader } from '@/components/teacher/courses/course-header'
import { CourseFilters } from '@/components/teacher/courses/course-filters'
import { CourseGrid } from '@/components/teacher/courses/course-grid'
import { CourseTable } from '@/components/teacher/courses/course-table'
import { EditCourseModal } from '@/components/teacher/courses/edit-course-modal'
import { DeleteCourseModal } from '@/components/teacher/courses/delete-course-modal'
import { CreateCourseDialog } from '@/components/teacher/courses/create-course-dialog'
import { useCourses, useUpdateCourse, useDeleteCourse } from '@/hooks/useCourses'
import type { Course, UpdateCourseRequest } from '@/types/course'

const PAGE_SIZE = 9

export default function MyCoursesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Extract initial parameters from URL
  const initialSearch = searchParams.get('search') || ''
  const initialLevel = searchParams.get('level') || ''
  const initialStatus = searchParams.get('status') || ''
  const initialPage = parseInt(searchParams.get('page') || '1', 10)

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(initialLevel)
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1)

  // Modals state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [wizardCourse, setWizardCourse] = useState<Course | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1) // Reset to page 1 on new search
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Sync state to URL search parameters without infinite rerender loop
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (selectedDifficulty) params.set('level', selectedDifficulty)
    if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus)
    if (page > 1) params.set('page', String(page))

    const newQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (newQuery !== currentQuery) {
      const query = newQuery ? `?${newQuery}` : ''
      router.replace(`${pathname}${query}`, { scroll: false })
    }
  }, [debouncedSearch, selectedDifficulty, selectedStatus, page, pathname, router, searchParams])

  // React Query Fetching
  const queryParams = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      search: debouncedSearch,
      level: selectedDifficulty,
      status: selectedStatus as 'all' | 'published' | 'draft',
      my_courses: true,
    }),
    [page, debouncedSearch, selectedDifficulty, selectedStatus]
  )

  const { data, isLoading, isError, error, refetch } = useCourses(queryParams)
  const updateCourseMutation = useUpdateCourse()
  const deleteCourseMutation = useDeleteCourse()

  const courses = data?.items || []
  const totalCourses = data?.total || 0
  const totalPages = Math.ceil(totalCourses / PAGE_SIZE) || 1

  // Toast Helper
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handlers for mutations
  const handleUpdateCourse = async (courseId: number, updates: UpdateCourseRequest) => {
    try {
      await updateCourseMutation.mutateAsync({ id: courseId, data: updates })
      showToast('success', 'Course updated successfully')
      setEditingCourse(null)
    } catch (err: any) {
      console.error('Failed to update course:', err)
      const msg = err?.response?.data?.detail
      const detailStr = Array.isArray(msg) ? msg.map((m: any) => m.msg).join(', ') : (typeof msg === 'string' ? msg : 'Failed to update course')
      showToast('error', detailStr)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await deleteCourseMutation.mutateAsync(courseId)
      showToast('success', 'Course deleted successfully')
      setDeletingCourse(null)
    } catch (err: any) {
      console.error('Failed to delete course:', err)
      const msg = err?.response?.data?.detail
      const detailStr = typeof msg === 'string' ? msg : 'Failed to delete course'
      showToast('error', detailStr)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl p-4 shadow-xl border text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Course Header */}
      <CourseHeader
        coursesCount={totalCourses}
        onCreateClick={() => {
          setWizardCourse(null)
          setIsWizardOpen(true)
        }}
      />

      {/* Filters and View Controls */}
      <CourseFilters
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSelectedStatus(status)
          setPage(1)
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat)
          setPage(1)
        }}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(diff) => {
          setSelectedDifficulty(diff)
          setPage(1)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading courses...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Failed to load courses</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An error occurred while fetching your courses.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110"
          >
            <RefreshCw className="size-4" /> Try Again
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <BookOpen className="mx-auto size-12 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">No courses found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {debouncedSearch || selectedDifficulty || selectedStatus !== ''
                ? 'Try adjusting your search query or filter settings.'
                : 'You have not created any courses yet. Get started by creating your first course.'}
            </p>
          </div>
          <button
            onClick={() => {
              setWizardCourse(null)
              setIsWizardOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110"
          >
            <Plus className="size-4" /> Create Course
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <CourseGrid
              courses={courses}
              onEdit={setEditingCourse}
              onDelete={setDeletingCourse}
              onEditWizard={(c) => {
                setWizardCourse(c)
                setIsWizardOpen(true)
              }}
            />
          ) : (
            <CourseTable
              courses={courses}
              onEdit={setEditingCourse}
              onDelete={setDeletingCourse}
              onEditWizard={(c) => {
                setWizardCourse(c)
                setIsWizardOpen(true)
              }}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-6">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(page * PAGE_SIZE, totalCourses)}
                </span>{' '}
                of <span className="font-semibold text-foreground">{totalCourses}</span> courses
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" /> Previous
                </button>

                <div className="flex items-center gap-1 text-xs font-semibold px-2">
                  <span>{page}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{totalPages}</span>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-40"
                >
                  Next <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals & Creation Wizard */}
      <CreateCourseDialog
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setWizardCourse(null)
        }}
        initialCourse={wizardCourse}
      />

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          isOpen={Boolean(editingCourse)}
          onClose={() => setEditingCourse(null)}
          onSave={handleUpdateCourse}
          isSaving={updateCourseMutation.isPending}
        />
      )}

      {deletingCourse && (
        <DeleteCourseModal
          course={deletingCourse}
          isOpen={Boolean(deletingCourse)}
          onClose={() => setDeletingCourse(null)}
          onConfirm={handleDeleteCourse}
          isDeleting={deleteCourseMutation.isPending}
        />
      )}
    </div>
  )
}
