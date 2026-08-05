'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Check,
  Image as ImageIcon,
  RefreshCw,
  UploadCloud,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { createCourse, updateCourse } from '@/lib/services/course.service'
import { createChapter, updateChapter, deleteChapter, getChaptersByCourse } from '@/lib/services/chapter.service'
import { createLesson, updateLesson, deleteLesson, getLessonsByChapter } from '@/lib/services/lesson.service'
import { uploadLessonResource, deleteLessonResource } from '@/lib/services/lesson-resource.service'
import { uploadFile } from '@/lib/services/uploaded-file.service'
import type { Course } from '@/types/course'

interface CreateCourseDialogProps {
  isOpen: boolean
  onClose: () => void
  initialCourse?: Course | null
}

export type AcademicLevel =
  | 'Higher School (Class 7-10)'
  | 'PUC (11-12)'
  | 'Diploma'
  | 'Undergraduate Degree'
  | 'Engineering'
  | 'Postgraduate'
  | 'Other'

export interface LessonResource {
  id: string
  dbId?: number
  title: string
  type:
    | 'PDF'
    | 'PPT'
    | 'DOCX'
    | 'TXT'
    | 'Image'
    | 'YouTube Video'
    | 'Recorded Video'
    | 'External Link'
    | 'Reference Book'
    | 'GitHub Repository'
    | 'Teacher Notes'
  url?: string
  file?: File
  sizeBytes?: number
  author?: string
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'failed'
  uploadProgress?: number
  uploadError?: string
}

export interface CourseLesson {
  id: string
  dbId?: number
  name: string
  durationMinutes: number
  type: 'Theory' | 'Practical' | 'Lab' | 'Assignment' | 'Revision'
  isExpanded?: boolean
  resources: LessonResource[]
}

export interface CourseChapter {
  id: string
  dbId?: number
  name: string
  description?: string
  isExpanded?: boolean
  lessons: CourseLesson[]
}

export interface CourseUnit {
  id: string
  title: string
  description?: string
  isExpanded?: boolean
  chapters: CourseChapter[]
}

export interface CourseFormData {
  // Step 1: Academic Info
  academicLevel: AcademicLevel
  institutionName: string
  board: string
  classLevel: string
  stream: string
  pucYear: string
  degree: string
  department: string
  program: string
  semester: string
  subject: string

  // Step 2: Course Details
  courseName: string
  courseCode: string
  shortDescription: string
  fullDescription: string
  language: string
  durationHours: string
  academicYear: string
  credits: string
  thumbnailUrl: string

  // Step 3: Course Structure & Lesson-Level Resources
  units: CourseUnit[]

  // Step 4: Publishing & Review
  visibility: 'Draft' | 'Private' | 'Institution Only' | 'Public'
}

const DEFAULT_FORM_DATA: CourseFormData = {
  academicLevel: 'Higher School (Class 7-10)',
  institutionName: '',
  board: 'CBSE',
  classLevel: 'Class 10',
  stream: 'Science',
  pucYear: '1st PUC',
  degree: 'Undergraduate',
  department: 'General',
  program: 'General',
  semester: 'Semester 1',
  subject: 'Mathematics',

  courseName: '',
  courseCode: '',
  shortDescription: '',
  fullDescription: '',
  language: 'English',
  durationHours: '40',
  academicYear: '2026-27',
  credits: '3',
  thumbnailUrl: '',

  units: [],
  visibility: 'Draft',
}

const WIZARD_STEPS = [
  { id: 1, title: 'Academic Info', subtitle: 'Tier & Subject', icon: BookOpen },
  { id: 2, title: 'Course Details', subtitle: 'Metadata & Media', icon: BookOpen },
  { id: 3, title: 'Structure & Resources', subtitle: 'Curriculum Hierarchy', icon: Layers },
  { id: 4, title: 'Review & Publish', subtitle: 'Dashboard & Launch', icon: Sparkles },
]

export function CreateCourseDialog({ isOpen, onClose, initialCourse }: CreateCourseDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const initialStepParam = searchParams.get('step')
  const [step, setStep] = useState<number>(initialStepParam ? Math.min(4, Number(initialStepParam)) : 1)
  const [formData, setFormData] = useState<CourseFormData>(DEFAULT_FORM_DATA)

  // Active Draft Course ID in Database
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState<boolean>(false)

  const [lastSaved, setLastSaved] = useState<string>('Not saved yet')
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [missingRequirements, setMissingRequirements] = useState<string[]>([])

  // Resource Upload Modal State
  const [resourceModalTarget, setResourceModalTarget] = useState<{
    uIdx: number
    cIdx: number
    lIdx: number
    resType: LessonResource['type']
  } | null>(null)
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [selectedResourceFile, setSelectedResourceFile] = useState<File | null>(null)
  const [isDraggingResource, setIsDraggingResource] = useState(false)
  const [resourceValidationError, setResourceValidationError] = useState<string | null>(null)
  const [isUploadingResourceModal, setIsUploadingResourceModal] = useState(false)

  // Hydrate initialCourse draft data if provided
  useEffect(() => {
    if (isOpen && initialCourse) {
      setActiveCourseId(initialCourse.id)
      setFormData((prev) => ({
        ...prev,
        courseName: initialCourse.title || '',
        shortDescription: initialCourse.description || '',
        fullDescription: initialCourse.description || '',
        thumbnailUrl: initialCourse.thumbnail || '',
        language: initialCourse.language || 'English',
        durationHours: String(initialCourse.duration_hours || 40),
        academicLevel:
          initialCourse.level === 'BEGINNER'
            ? 'Higher School (Class 7-10)'
            : initialCourse.level === 'INTERMEDIATE'
            ? 'PUC (11-12)'
            : 'Undergraduate Degree',
      }))

      const loadDraftStructure = async () => {
        try {
          setIsSyncing(true)
          const chapters = await getChaptersByCourse(initialCourse.id)
          if (chapters && chapters.length > 0) {
            const loadedChapters: CourseChapter[] = []

            for (const chap of chapters) {
              let lessons: CourseLesson[] = []
              try {
                const lesRes = await getLessonsByChapter(chap.id)
                if (lesRes && lesRes.items) {
                  lessons = lesRes.items.map((l) => ({
                    id: `les-${l.id}`,
                    dbId: l.id,
                    name: l.title,
                    durationMinutes: 30,
                    type: (l.description as any) || 'Theory',
                    isExpanded: true,
                    resources: [],
                  }))
                }
              } catch (e) {
                console.error('Failed loading lessons:', e)
              }

              loadedChapters.push({
                id: `chap-${chap.id}`,
                dbId: chap.id,
                name: chap.title,
                isExpanded: true,
                lessons,
              })
            }

            setFormData((prev) => ({
              ...prev,
              units: [
                {
                  id: `unit-${Date.now()}`,
                  title: `Unit 1: ${initialCourse.title} Curriculum`,
                  description: `Course chapters and lessons`,
                  isExpanded: true,
                  chapters: loadedChapters,
                },
              ],
            }))
          }
          setStep(3)
        } catch (err) {
          console.error('Failed to load initial course structure:', err)
        } finally {
          setIsSyncing(false)
        }
      }

      loadDraftStructure()
    } else if (isOpen && !initialCourse) {
      setActiveCourseId(null)
      setFormData(DEFAULT_FORM_DATA)
      setStep(1)
    }
  }, [isOpen, initialCourse])

  // Prevent outer page body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const markSaved = () => {
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setIsSavedNotice(true)
    setTimeout(() => setIsSavedNotice(false), 2000)
  }

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const mapAcademicLevelToCourseLevel = (academicLevel: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' => {
    if (academicLevel.includes('Higher School')) return 'BEGINNER'
    if (academicLevel.includes('PUC') || academicLevel.includes('Diploma')) return 'INTERMEDIATE'
    return 'ADVANCED'
  }

  const getImageUrl = (url?: string | null): string => {
    if (!url || !url.trim()) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads/')) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'
      return `${apiHost}${url}`
    }
    return url
  }

  // Ensure Course Draft is created on backend (POST once, PUT afterwards)
  const syncCourseDraft = async (): Promise<number | null> => {
    const courseLevel = mapAcademicLevelToCourseLevel(formData.academicLevel)

    // Ensure title >= 3 chars and description >= 10 chars to pass backend Pydantic validation
    let titleToUse = formData.courseName.trim()
    if (!titleToUse) titleToUse = `${formData.subject || 'Course'} Draft`
    if (titleToUse.length < 3) titleToUse = titleToUse.padEnd(3, ' Course')

    let descToUse = formData.fullDescription.trim() || formData.shortDescription.trim()
    if (!descToUse) descToUse = 'Comprehensive course summary and syllabus overview.'
    if (descToUse.length < 10) descToUse = descToUse.padEnd(10, ' syllabus details')

    const durationToUse = Math.max(1, parseInt(formData.durationHours, 10) || 40)

    try {
      setIsSyncing(true)
      if (!activeCourseId) {
        // POST /api/v1/courses/
        const created = await createCourse({
          title: titleToUse,
          description: descToUse,
          thumbnail: formData.thumbnailUrl || null,
          level: courseLevel,
          language: formData.language || 'English',
          duration_hours: durationToUse,
        })
        setActiveCourseId(created.id)
        markSaved()
        return created.id
      } else {
        // PUT /api/v1/courses/{id}
        await updateCourse(activeCourseId, {
          title: titleToUse,
          description: descToUse,
          thumbnail: formData.thumbnailUrl || null,
          level: courseLevel,
          language: formData.language || 'English',
          duration_hours: durationToUse,
        })
        markSaved()
        return activeCourseId
      }
    } catch (err: any) {
      console.error('Failed to sync course draft:', err)
      const detailMsg = err?.response?.data?.detail
      const detailStr = Array.isArray(detailMsg)
        ? detailMsg.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
        : (typeof detailMsg === 'string' ? detailMsg : err.message || 'Server validation error')
      showToast(`Error saving course draft: ${detailStr}`)
      return null
    } finally {
      setIsSyncing(false)
    }
  }

  // Step Validation Logic
  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.academicLevel) errors.academicLevel = 'Academic Level is required.'
      if (!formData.subject || !formData.subject.trim()) errors.subject = 'Academic Subject Target is required.'
    }

    if (currentStep === 2) {
      const title = formData.courseName.trim()
      const shortDesc = formData.shortDescription.trim()
      const fullDesc = formData.fullDescription.trim()

      if (!title) {
        errors.courseName = 'Course Title is required.'
      } else if (title.length < 3) {
        errors.courseName = 'Course Title must be at least 3 characters long.'
      }

      if (!shortDesc) {
        errors.shortDescription = 'Short Summary is required.'
      }

      if (!fullDesc) {
        errors.fullDescription = 'Syllabus Description is required.'
      } else if (fullDesc.length < 10) {
        errors.fullDescription = 'Syllabus Description must be at least 10 characters long.'
      }
    }

    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      showToast('Please fix all errors marked in red before proceeding.')
      return false
    }
    return true
  }

  // Handle Navigation Next
  const handleNextStep = async () => {
    if (!validateStep(step)) return

    // If completing Step 2, create or update draft course upfront
    if (step === 2) {
      const courseId = await syncCourseDraft()
      if (!courseId) return
    }

    setStep((prev) => Math.min(4, prev + 1))
  }

  const handleStepClick = async (targetStep: number) => {
    if (targetStep > step) {
      if (!validateStep(step)) return
      if (step === 2 || targetStep > 2) {
        if (!activeCourseId) {
          const courseId = await syncCourseDraft()
          if (!courseId) return
        }
      }
    }
    setStep(targetStep)
  }

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  // Dynamic Subject Options based on Academic Level
  const dynamicSubjects = useMemo(() => {
    const level = formData.academicLevel
    if (level === 'Higher School (Class 7-10)') {
      return ['Mathematics', 'Science', 'English', 'Social Science', 'Kannada', 'Hindi', 'Computer Basics']
    }
    if (level === 'PUC (11-12)') {
      if (formData.stream === 'Commerce') return ['Accounts', 'Economics', 'Statistics', 'Business Studies', 'Computer Applications']
      if (formData.stream === 'Arts') return ['History', 'Political Science', 'Psychology', 'Geography', 'Sociology']
      return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Electronics']
    }
    if (level === 'Engineering' || level === 'Undergraduate Degree' || level === 'Diploma') {
      return ['Mathematics & Calculus', 'Python Programming', 'Database Systems', 'Computer Networks', 'Data Structures', 'Machine Learning']
    }
    return ['General Knowledge', 'Aptitude & Reasoning', 'Soft Skills', 'Research Methodology']
  }, [formData.academicLevel, formData.stream])

  // AI Recommended Modules
  const aiSuggestedModules = useMemo(() => {
    const sub = (formData.subject || '').toLowerCase()
    if (sub.includes('math') || sub.includes('algebra') || sub.includes('calculus')) {
      return ['Number Systems & Expressions', 'Algebra & Polynomials', 'Geometry & Mensuration', 'Trigonometry & Vectors', 'Statistics & Probability']
    }
    if (sub.includes('physics') || sub.includes('mechanics')) {
      return ['Kinematics & Dynamics', 'Thermodynamics & Heat', 'Electricity & Magnetism', 'Optics & Wave Physics', 'Modern Quantum Physics']
    }
    if (sub.includes('python') || sub.includes('prog') || sub.includes('code')) {
      return ['Variables & Control Flow', 'Functions & Scope', 'Object-Oriented Programming', 'Collections & Algorithms', 'File I/O & Exception Handling']
    }
    return [
      `${formData.subject || 'Unit 1'} Foundations`,
      `${formData.subject || 'Unit 2'} Core Principles`,
      `${formData.subject || 'Unit 3'} Advanced Applications`,
      `${formData.subject || 'Unit 4'} Practical Exercises`,
    ]
  }, [formData.subject])

  // Lesson-Centric Course Summary
  const courseSummary = useMemo(() => {
    let totalUnits = formData.units.length
    let totalChapters = 0
    let totalLessons = 0
    let pdfCount = 0
    let videoCount = 0
    let totalBytes = 0
    let totalMinutes = 0
    let uploadingCount = 0
    let failedCount = 0

    formData.units.forEach((u) => {
      totalChapters += u.chapters.length
      u.chapters.forEach((c) => {
        totalLessons += c.lessons.length
        c.lessons.forEach((l) => {
          totalMinutes += l.durationMinutes || 0
          if (l.resources) {
            l.resources.forEach((r) => {
              if (r.uploadStatus === 'uploading') uploadingCount++
              if (r.uploadStatus === 'failed') failedCount++
              if (r.type === 'PDF' || r.type === 'PPT' || r.type === 'DOCX' || r.type === 'TXT') pdfCount++
              else if (r.type === 'YouTube Video' || r.type === 'Recorded Video') videoCount++
              totalBytes += r.sizeBytes || 0
            })
          }
        })
      })
    })

    return {
      totalUnits,
      totalChapters,
      totalLessons,
      pdfCount,
      videoCount,
      totalMinutes,
      uploadingCount,
      failedCount,
    }
  }, [formData.units])

  // Thumbnail Upload via POST /api/v1/uploaded-files/
  const handleThumbnailFileUpload = async (file: File) => {
    if (!file) return
    try {
      setIsUploadingThumbnail(true)
      const res = await uploadFile(file, 'Course Thumbnail')
      const thumbnailUrl = res.file_url
      setFormData((prev) => ({ ...prev, thumbnailUrl }))
      showToast('Thumbnail uploaded successfully via uploaded-files service!')

      if (activeCourseId) {
        await updateCourse(activeCourseId, { thumbnail: thumbnailUrl })
        markSaved()
      }
    } catch (err: any) {
      console.error('Failed to upload thumbnail:', err)
      showToast('Failed to upload thumbnail image to backend.')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  // Incremental API helpers for Chapters & Lessons
  const createOrSyncChapterOnBackend = async (chapterName: string, orderNum: number): Promise<number | null> => {
    let courseId = activeCourseId
    if (!courseId) {
      courseId = await syncCourseDraft()
    }
    if (!courseId) return null

    try {
      setIsSyncing(true)
      const chapterRes = await createChapter({
        course_id: courseId,
        title: chapterName,
        description: 'Chapter unit module',
        order_number: orderNum,
      })
      markSaved()
      return chapterRes.id
    } catch (err: any) {
      console.error('Failed to create chapter on backend:', err)
      showToast('Failed to save chapter on backend.')
      return null
    } finally {
      setIsSyncing(false)
    }
  }

  const createOrSyncLessonOnBackend = async (chapterDbId: number, lessonName: string, lessonType: string, orderNum: number): Promise<number | null> => {
    try {
      setIsSyncing(true)
      const lessonRes = await createLesson({
        chapter_id: chapterDbId,
        title: lessonName,
        description: lessonType,
        order_number: orderNum,
      })
      markSaved()
      return lessonRes.id
    } catch (err: any) {
      console.error('Failed to create lesson on backend:', err)
      showToast('Failed to save lesson on backend.')
      return null
    } finally {
      setIsSyncing(false)
    }
  }

  // Inject AI Suggested Module as a new Unit & Chapter
  const addAiSuggestedModule = async (moduleName: string) => {
    const nextOrder = formData.units.length + 1
    const chapterDbId = await createOrSyncChapterOnBackend(`Chapter 1: Fundamentals of ${moduleName}`, nextOrder)

    let lessonDbId: number | null = null
    if (chapterDbId) {
      lessonDbId = await createOrSyncLessonOnBackend(chapterDbId, `Overview of ${moduleName}`, 'Theory', 1)
    }

    const newUnit: CourseUnit = {
      id: `unit-${Date.now()}`,
      title: `${moduleName}`,
      description: `Core principles and practical applications for ${moduleName}`,
      isExpanded: true,
      chapters: [
        {
          id: `chap-${Date.now()}`,
          dbId: chapterDbId || undefined,
          name: `Chapter 1: Fundamentals of ${moduleName}`,
          isExpanded: true,
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              dbId: lessonDbId || undefined,
              name: `Overview of ${moduleName}`,
              durationMinutes: 45,
              type: 'Theory',
              isExpanded: true,
              resources: [],
            },
          ],
        },
      ],
    }
    setFormData((prev) => ({ ...prev, units: [...prev.units, newUnit] }))
    showToast(`Injected Unit: ${moduleName} into Curriculum!`)
  }

  // Add New Unit (UI concept wrapping Chapters)
  const handleAddNewUnit = async () => {
    const nextNum = formData.units.length + 1
    const chapterName = `Chapter 1: Introductory Principles`
    const chapterDbId = await createOrSyncChapterOnBackend(chapterName, nextNum)
    let lessonDbId: number | null = null
    if (chapterDbId) {
      lessonDbId = await createOrSyncLessonOnBackend(chapterDbId, `Lesson 1: Theory Overview`, 'Theory', 1)
    }

    const newUnit: CourseUnit = {
      id: `unit-${Date.now()}`,
      title: `Unit ${nextNum}: Core Fundamentals`,
      isExpanded: true,
      chapters: [
        {
          id: `chap-${Date.now()}`,
          dbId: chapterDbId || undefined,
          name: chapterName,
          isExpanded: true,
          lessons: [
            {
              id: `les-${Date.now()}`,
              dbId: lessonDbId || undefined,
              name: `Lesson 1: Theory Overview`,
              durationMinutes: 30,
              type: 'Theory',
              isExpanded: true,
              resources: [],
            },
          ],
        },
      ],
    }
    setFormData((prev) => ({ ...prev, units: [...prev.units, newUnit] }))
  }

  // Add Chapter to Unit
  const handleAddChapterToUnit = async (uIdx: number) => {
    const nextC = formData.units[uIdx].chapters.length + 1
    const chapterName = `Chapter ${nextC}: Core Topics`
    const chapterDbId = await createOrSyncChapterOnBackend(chapterName, nextC)

    const updatedUnits = [...formData.units]
    updatedUnits[uIdx].chapters.push({
      id: `chap-${Date.now()}`,
      dbId: chapterDbId || undefined,
      name: chapterName,
      isExpanded: true,
      lessons: [],
    })
    setFormData({ ...formData, units: updatedUnits })
  }

  // Update Chapter Title (PUT once created)
  const handleUpdateChapterName = async (uIdx: number, cIdx: number, newName: string) => {
    const updatedUnits = [...formData.units]
    const chap = updatedUnits[uIdx].chapters[cIdx]
    chap.name = newName
    setFormData({ ...formData, units: updatedUnits })

    if (chap.dbId) {
      try {
        await updateChapter(chap.dbId, { title: newName })
        markSaved()
      } catch (err) {
        console.error('Failed to update chapter name:', err)
      }
    }
  }

  // Delete Chapter
  const handleDeleteChapter = async (uIdx: number, cIdx: number) => {
    const chap = formData.units[uIdx].chapters[cIdx]
    if (chap.dbId) {
      try {
        await deleteChapter(chap.dbId)
        markSaved()
      } catch (err) {
        console.error('Failed to delete chapter:', err)
      }
    }
    const updatedUnits = [...formData.units]
    updatedUnits[uIdx].chapters = updatedUnits[uIdx].chapters.filter((_, idx) => idx !== cIdx)
    setFormData({ ...formData, units: updatedUnits })
  }

  // Add Lesson to Chapter
  const handleAddLessonToChapter = async (uIdx: number, cIdx: number) => {
    const chap = formData.units[uIdx].chapters[cIdx]

    // Ensure chapter is created on backend
    let chapterDbId = chap.dbId
    if (!chapterDbId) {
      chapterDbId = (await createOrSyncChapterOnBackend(chap.name, cIdx + 1)) || undefined
      if (chapterDbId) {
        chap.dbId = chapterDbId
      }
    }

    const nextL = chap.lessons.length + 1
    const lessonName = `Lesson ${nextL}: New Concept`
    let lessonDbId: number | undefined = undefined

    if (chapterDbId) {
      lessonDbId = (await createOrSyncLessonOnBackend(chapterDbId, lessonName, 'Theory', nextL)) || undefined
    }

    const updatedUnits = [...formData.units]
    updatedUnits[uIdx].chapters[cIdx].lessons.push({
      id: `les-${Date.now()}`,
      dbId: lessonDbId,
      name: lessonName,
      durationMinutes: 30,
      type: 'Theory',
      isExpanded: true,
      resources: [],
    })
    setFormData({ ...formData, units: updatedUnits })
  }

  // Update Lesson Details
  const handleUpdateLessonDetails = async (uIdx: number, cIdx: number, lIdx: number, newName: string, newType: CourseLesson['type']) => {
    const updatedUnits = [...formData.units]
    const les = updatedUnits[uIdx].chapters[cIdx].lessons[lIdx]
    les.name = newName
    les.type = newType
    setFormData({ ...formData, units: updatedUnits })

    if (les.dbId) {
      try {
        await updateLesson(les.dbId, { title: newName, description: newType })
        markSaved()
      } catch (err) {
        console.error('Failed to update lesson:', err)
      }
    }
  }

  // Delete Lesson
  const handleDeleteLesson = async (uIdx: number, cIdx: number, lIdx: number) => {
    const les = formData.units[uIdx].chapters[cIdx].lessons[lIdx]
    if (les.dbId) {
      try {
        await deleteLesson(les.dbId)
        markSaved()
      } catch (err) {
        console.error('Failed to delete lesson:', err)
      }
    }
    const updatedUnits = [...formData.units]
    updatedUnits[uIdx].chapters[cIdx].lessons = updatedUnits[uIdx].chapters[cIdx].lessons.filter((_, idx) => idx !== lIdx)
    setFormData({ ...formData, units: updatedUnits })
  }

  // Resource Upload / Retry Handler
  const handleAttachResource = async (uIdx: number, cIdx: number, lIdx: number, file: File | null, url: string, title: string, type: LessonResource['type']) => {
    const chap = formData.units[uIdx].chapters[cIdx]
    let chapterDbId = chap.dbId
    if (!chapterDbId) {
      chapterDbId = (await createOrSyncChapterOnBackend(chap.name, cIdx + 1)) || undefined
      if (chapterDbId) chap.dbId = chapterDbId
    }

    const les = chap.lessons[lIdx]
    let lessonDbId = les.dbId
    if (!lessonDbId && chapterDbId) {
      lessonDbId = (await createOrSyncLessonOnBackend(chapterDbId, les.name, les.type, lIdx + 1)) || undefined
      if (lessonDbId) les.dbId = lessonDbId
    }

    if (!lessonDbId) {
      showToast('Cannot attach resource: Lesson could not be saved to database.')
      return
    }

    const resourceId = `res-${Date.now()}`
    const titleToUse = title.trim() || (file ? file.name : `${type} Material`)
    const sizeToUse = file ? file.size : 102400

    const newRes: LessonResource = {
      id: resourceId,
      title: titleToUse,
      type,
      url: url || (file ? URL.createObjectURL(file) : undefined),
      file: file || undefined,
      sizeBytes: sizeToUse,
      uploadStatus: 'uploading',
      uploadProgress: 10,
    }

    // Append resource locally in uploading status
    const updatedUnits = [...formData.units]
    updatedUnits[uIdx].chapters[cIdx].lessons[lIdx].resources.push(newRes)
    setFormData({ ...formData, units: updatedUnits })

    // Execute backend resource upload via POST /api/v1/lessons/{lesson_id}/resources
    try {
      setIsUploadingResourceModal(true)
      const uploadedRes = await uploadLessonResource(
        lessonDbId,
        {
          title: titleToUse,
          resource_type: type,
          file: file || undefined,
          url: url.trim() || undefined,
        },
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setFormData((prev) => {
              const u = [...prev.units]
              const targetRes = u[uIdx]?.chapters[cIdx]?.lessons[lIdx]?.resources?.find((r) => r.id === resourceId)
              if (targetRes) {
                targetRes.uploadProgress = percent
              }
              return { ...prev, units: u }
            })
          }
        }
      )

      // Mark success
      setFormData((prev) => {
        const u = [...prev.units]
        const targetRes = u[uIdx]?.chapters[cIdx]?.lessons[lIdx]?.resources?.find((r) => r.id === resourceId)
        if (targetRes) {
          targetRes.dbId = uploadedRes.id
          targetRes.uploadStatus = 'success'
          targetRes.uploadProgress = 100
          if (uploadedRes.url) targetRes.url = uploadedRes.url
        }
        return { ...prev, units: u }
      })

      showToast(`Successfully uploaded resource: ${titleToUse}`)
      markSaved()
    } catch (err: any) {
      console.error('Resource upload failed:', err)
      // On failure, keep lesson intact, mark resource as failed, allow retry
      setFormData((prev) => {
        const u = [...prev.units]
        const targetRes = u[uIdx]?.chapters[cIdx]?.lessons[lIdx]?.resources?.find((r) => r.id === resourceId)
        if (targetRes) {
          targetRes.uploadStatus = 'failed'
          targetRes.uploadError = err?.response?.data?.detail || err.message || 'Upload failed'
        }
        return { ...prev, units: u }
      })
      showToast(`Failed to upload ${titleToUse}. Click retry to try again.`)
    } finally {
      setIsUploadingResourceModal(false)
    }
  }

  // Handle local resource modal trigger
  const handleSelectResourceFile = (file: File) => {
    setResourceValidationError(null)
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg', '.webp']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedExtensions.includes(ext)) {
      setResourceValidationError('Unsupported file type. Accepted: .pdf, .doc, .docx, .ppt, .pptx, .txt')
      return
    }

    const maxBytes = 25 * 1024 * 1024 // 25 MB
    if (file.size > maxBytes) {
      setResourceValidationError('Maximum file size is 25 MB.')
      return
    }

    setSelectedResourceFile(file)
    if (!resourceTitle.trim()) {
      setResourceTitle(file.name)
    }
  }

  const handleModalAddResource = async () => {
    if (!resourceModalTarget) return
    const { uIdx, cIdx, lIdx, resType } = resourceModalTarget
    const isDocument = ['PDF', 'PPT', 'DOCX', 'TXT'].includes(resType)

    if (isDocument && !selectedResourceFile && !resourceUrl.trim()) {
      setResourceValidationError('Please select a local document file or enter a valid URL.')
      return
    }

    if (!isDocument && !resourceUrl.trim()) {
      setResourceValidationError('Please enter a valid link/URL.')
      return
    }

    const fileToUse = selectedResourceFile
    const urlToUse = resourceUrl.trim()
    const titleToUse = resourceTitle.trim()

    // Reset Modal
    setResourceModalTarget(null)
    setResourceTitle('')
    setResourceUrl('')
    setSelectedResourceFile(null)
    setResourceValidationError(null)
    setIsDraggingResource(false)

    await handleAttachResource(uIdx, cIdx, lIdx, fileToUse, urlToUse, titleToUse, resType)
  }

  // Delete Lesson Resource
  const handleDeleteResource = async (uIdx: number, cIdx: number, lIdx: number, rIdx: number) => {
    const res = formData.units[uIdx].chapters[cIdx].lessons[lIdx].resources[rIdx]
    const les = formData.units[uIdx].chapters[cIdx].lessons[lIdx]

    if (res.dbId && les.dbId) {
      try {
        await deleteLessonResource(les.dbId, res.dbId)
        markSaved()
      } catch (err) {
        console.error('Failed to delete resource on backend:', err)
      }
    }

    const updatedUnits = [...formData.units]
    updatedUnits[uIdx].chapters[cIdx].lessons[lIdx].resources = les.resources.filter((_, idx) => idx !== rIdx)
    setFormData({ ...formData, units: updatedUnits })
  }

  // Pre-flight Publish Readiness Validation
  const validatePublishReadiness = (): string[] => {
    const missing: string[] = []

    if (!formData.academicLevel || !formData.subject) missing.push('Academic Level & Subject Target (Step 1)')
    if (!formData.courseName || !formData.courseName.trim()) missing.push('Course Title (Step 2)')
    if (!formData.shortDescription || !formData.shortDescription.trim()) missing.push('Short Summary (Step 2)')
    if (!formData.fullDescription || !formData.fullDescription.trim()) missing.push('Syllabus Description (Step 2)')
    if (!formData.thumbnailUrl) missing.push('Course Thumbnail Image (Step 2)')
    if (formData.units.length === 0) missing.push('Curriculum Units (Step 3)')

    if (courseSummary.totalLessons === 0) missing.push('At least 1 Lesson in Curriculum (Step 3)')

    // Every lesson must have at least one resource
    let lessonWithoutResource = false
    formData.units.forEach((u) => {
      u.chapters.forEach((c) => {
        c.lessons.forEach((l) => {
          if (!l.resources || l.resources.length === 0) {
            lessonWithoutResource = true
          }
        })
      })
    })
    if (lessonWithoutResource) missing.push('Every Lesson must have at least one Study Material attached (Step 3)')

    if (courseSummary.uploadingCount > 0) missing.push(`Resource Uploads in Progress (${courseSummary.uploadingCount} uploading)`)
    if (courseSummary.failedCount > 0) missing.push(`Failed Resource Uploads (${courseSummary.failedCount} failed - click Retry)`)

    return missing
  }

  // Execute Course Publish (PUT /courses/{id} with is_published: true)
  const handlePublish = async () => {
    const missing = validatePublishReadiness()
    if (missing.length > 0) {
      setMissingRequirements(missing)
      showToast('Course cannot be published due to incomplete items.')
      return
    }

    setMissingRequirements([])

    let courseId = activeCourseId
    if (!courseId) {
      courseId = await syncCourseDraft()
    }
    if (!courseId) return

    try {
      setIsSyncing(true)
      // Update course is_published: true
      await updateCourse(courseId, { is_published: true })

      // Invalidate all relevant React Query caches
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] })
      await queryClient.invalidateQueries({ queryKey: ['course', courseId] })

      showToast('🎉 Course Published Successfully!')
      setTimeout(() => {
        router.push('/teacher-dashboard/courses')
        onClose()
      }, 800)
    } catch (err: any) {
      console.error('Failed to publish course:', err)
      showToast(`Publishing failed: ${err?.response?.data?.detail || err.message || 'Server error'}`)
    } finally {
      setIsSyncing(false)
    }
  }

  // Save Draft & Exit Action
  const handleSaveDraft = async () => {
    if (courseSummary.uploadingCount > 0) {
      showToast('Please wait for active file uploads to complete before saving draft.')
      return
    }

    if (step >= 2 && !activeCourseId) {
      await syncCourseDraft()
    }

    await queryClient.invalidateQueries({ queryKey: ['courses'] })
    await queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] })

    showToast('Course Draft Saved Successfully!')
    setTimeout(() => {
      router.push('/teacher-dashboard/courses')
      onClose()
    }, 600)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[92vh] max-h-[950px] p-0 gap-0 overflow-hidden border-border/60 bg-background shadow-2xl flex flex-col rounded-3xl">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                Arivu AI Course Creation & Curriculum Authoring
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {formData.academicLevel}
                </span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Step {step} of 4 — {WIZARD_STEPS.find((s) => s.id === step)?.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isSyncing ? (
                <span className="text-primary font-semibold flex items-center gap-1">
                  <Loader2 className="size-3.5 animate-spin" /> Auto-Saving...
                </span>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Draft status: {lastSaved}</span>
                  <AnimatePresence>
                    {isSavedNotice && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald-500 font-semibold flex items-center gap-1 ml-1">
                        <Check className="size-3" /> Auto-Saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>

        {/* STEPPER PROGRESS TRACKER */}
        <div className="border-b border-border/80 bg-card/30 px-6 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {WIZARD_STEPS.map((s, idx) => {
              const isActive = step === s.id
              const isCompleted = step > s.id

              return (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleStepClick(s.id)}
                    className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <span className={`flex size-6 items-center justify-center rounded-full text-xs ${isActive ? 'bg-primary-foreground text-primary' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {isCompleted ? <Check className="size-3.5" /> : s.id}
                    </span>
                    <span className="hidden md:inline">{s.title}</span>
                  </button>
                  {idx < WIZARD_STEPS.length - 1 && (
                    <ChevronRight className="size-4 text-muted-foreground/40 hidden sm:inline" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* MAIN STEP CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* STEP 1: ACADEMIC INFO */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Academic Level & Subject Target</h3>
                <p className="text-xs text-muted-foreground">
                  Select the tier, institution program, and subject to automatically configure curriculum standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'Higher School (Class 7-10)', desc: 'CBSE, ICSE, State Boards' },
                  { title: 'PUC (11-12)', desc: 'Science, Commerce, Arts Streams' },
                  { title: 'Diploma', desc: 'Polytechnic Technical Diplomas' },
                  { title: 'Undergraduate Degree', desc: 'BSc, BCA, BCom, BA Degrees' },
                  { title: 'Engineering', desc: 'BE, BTech Technical Courses' },
                  { title: 'Postgraduate', desc: 'MTech, MSc, MCA, MBA Programs' },
                ].map((tier) => {
                  const isSelected = formData.academicLevel === tier.title
                  return (
                    <div
                      key={tier.title}
                      onClick={() => setFormData({ ...formData, academicLevel: tier.title as AcademicLevel })}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all space-y-2 ${
                        isSelected ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{tier.title}</h4>
                        {isSelected && <CheckCircle2 className="size-5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{tier.desc}</p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Academic Subject Target *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value, courseName: formData.courseName || e.target.value })}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground font-bold"
                    >
                      {dynamicSubjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Sparkles className="size-4" />
                    Recommended Curriculum Modules for {formData.subject}
                  </div>
                  <span className="text-[11px] text-muted-foreground">Click to inject into curriculum</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestedModules.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => addAiSuggestedModule(mod)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Plus className="size-3.5" /> {mod}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: COURSE DETAILS */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Course Metadata & Media Setup</h3>
                <p className="text-xs text-muted-foreground">Provide descriptive information, course codes, and thumbnail media.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Course Title (Min. 3 characters) *</label>
                    <input
                      type="text"
                      value={formData.courseName}
                      onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                      placeholder={`e.g. ${formData.subject || 'Mathematics'} Course Title`}
                      className={`mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground ${
                        validationErrors.courseName ? 'border-destructive focus:ring-destructive' : 'border-input'
                      }`}
                    />
                    {validationErrors.courseName && (
                      <p className="text-xs text-destructive font-medium mt-1">{validationErrors.courseName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Short Summary *</label>
                    <textarea
                      rows={2}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Brief academic summary..."
                      className={`mt-1 w-full rounded-xl border bg-background px-3.5 py-2 text-sm text-foreground ${
                        validationErrors.shortDescription ? 'border-destructive focus:ring-destructive' : 'border-input'
                      }`}
                    />
                    {validationErrors.shortDescription && (
                      <p className="text-xs text-destructive font-medium mt-1">{validationErrors.shortDescription}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Syllabus Description & Scope (Min. 10 characters) *</label>
                    <textarea
                      rows={4}
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      placeholder="Detailed academic syllabus description..."
                      className={`mt-1 w-full rounded-xl border bg-background px-3.5 py-2 text-sm text-foreground ${
                        validationErrors.fullDescription ? 'border-destructive focus:ring-destructive' : 'border-input'
                      }`}
                    />
                    {validationErrors.fullDescription && (
                      <p className="text-xs text-destructive font-medium mt-1">{validationErrors.fullDescription}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-semibold text-foreground">Course Thumbnail Image *</label>
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="aspect-video w-full rounded-xl bg-muted overflow-hidden relative border border-border flex items-center justify-center">
                      {isUploadingThumbnail ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-primary text-xs font-semibold">
                          <Loader2 className="size-6 animate-spin" />
                          <span>Uploading thumbnail to backend...</span>
                        </div>
                      ) : formData.thumbnailUrl ? (
                        <img src={getImageUrl(formData.thumbnailUrl)} alt="Thumbnail" className="w-full h-full object-contain bg-slate-950/80 p-1" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                          <ImageIcon className="size-8 mb-2 opacity-50" />
                          <p className="text-xs font-semibold">No Thumbnail Uploaded</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingThumbnail}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleThumbnailFileUpload(file)
                        }}
                        className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CURRICULUM HIERARCHY BUILDER */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Curriculum Hierarchy & Study Materials</h3>
                  <p className="text-xs text-muted-foreground">
                    Organize Units → Chapters → Lessons. Attach PDFs, Videos, GitHub repos, and Reference Books directly to lessons.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewUnit}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110"
                >
                  <Plus className="size-4" /> Add New Unit
                </button>
              </div>

              {formData.units.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                  <Layers className="mx-auto size-12 text-primary opacity-60" />
                  <h4 className="text-lg font-bold text-foreground">No Curriculum Units Added Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Click &quot;+ Add New Unit&quot; or select Recommended Modules from Step 1 to populate curriculum.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.units.map((unit, uIdx) => (
                    <div key={unit.id} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
                      {/* UNIT HEADER */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-bold text-primary flex-shrink-0">
                            Unit {uIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={unit.title}
                            onChange={(e) => {
                              const newUnits = [...formData.units]
                              newUnits[uIdx].title = e.target.value
                              setFormData({ ...formData, units: newUnits })
                            }}
                            className="font-bold text-base text-foreground bg-transparent focus:outline-none w-full border-b border-transparent focus:border-primary"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddChapterToUnit(uIdx)}
                            className="inline-flex items-center gap-1 rounded-xl bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/20"
                          >
                            <Plus className="size-3.5" /> Add Chapter
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newUnits = formData.units.filter((_, idx) => idx !== uIdx)
                              setFormData({ ...formData, units: newUnits })
                            }}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-xl"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* CHAPTERS MAP */}
                      <div className="space-y-4 pl-2 md:pl-4">
                        {unit.chapters.map((chap, cIdx) => (
                          <div key={chap.id} className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs font-bold text-muted-foreground">Chapter {cIdx + 1}:</span>
                                <input
                                  type="text"
                                  value={chap.name}
                                  onChange={(e) => handleUpdateChapterName(uIdx, cIdx, e.target.value)}
                                  className="font-semibold text-xs text-foreground bg-transparent focus:outline-none w-full"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddLessonToChapter(uIdx, cIdx)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-foreground border border-border hover:bg-accent"
                                >
                                  <Plus className="size-3" /> Add Lesson
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChapter(uIdx, cIdx)}
                                  className="p-1 text-destructive hover:bg-destructive/10 rounded-lg"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* LESSONS MAP */}
                            <div className="space-y-3 pl-2 md:pl-4">
                              {chap.lessons.map((les, lIdx) => (
                                <div key={les.id} className="rounded-xl border border-border bg-card p-3 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                        L{lIdx + 1}
                                      </span>
                                      <input
                                        type="text"
                                        value={les.name}
                                        onChange={(e) => handleUpdateLessonDetails(uIdx, cIdx, lIdx, e.target.value, les.type)}
                                        className="font-bold text-xs text-foreground bg-transparent focus:outline-none w-full"
                                      />
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <select
                                        value={les.type}
                                        onChange={(e) => handleUpdateLessonDetails(uIdx, cIdx, lIdx, les.name, e.target.value as any)}
                                        className="rounded-lg border border-input bg-background px-2 py-1 text-[11px] font-semibold text-foreground"
                                      >
                                        <option value="Theory">Theory</option>
                                        <option value="Practical">Practical</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Assignment">Assignment</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(uIdx, cIdx, lIdx)}
                                        className="p-1 text-destructive hover:bg-destructive/10 rounded-md"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* RESOURCE ATTACHMENT BAR */}
                                  <div className="border-t border-border/60 pt-2 space-y-2">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-muted-foreground">Lesson Study Materials ({les.resources?.length || 0})</span>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setResourceModalTarget({ uIdx, cIdx, lIdx, resType: 'PDF' })
                                            setSelectedResourceFile(null)
                                            setResourceValidationError(null)
                                          }}
                                          className="rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-bold hover:bg-indigo-500/20 transition-all flex items-center gap-1"
                                        >
                                          <Plus className="size-3" /> Upload PDF / Document
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setResourceModalTarget({ uIdx, cIdx, lIdx, resType: 'YouTube Video' })
                                            setSelectedResourceFile(null)
                                            setResourceValidationError(null)
                                          }}
                                          className="rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2.5 py-1 text-[10px] font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1"
                                        >
                                          <Plus className="size-3" /> Video
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setResourceModalTarget({ uIdx, cIdx, lIdx, resType: 'GitHub Repository' })
                                            setSelectedResourceFile(null)
                                            setResourceValidationError(null)
                                          }}
                                          className="rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2.5 py-1 text-[10px] font-bold hover:bg-purple-500/20 transition-all flex items-center gap-1"
                                        >
                                          <Plus className="size-3" /> Repo
                                        </button>
                                      </div>
                                    </div>

                                    {/* ATTACHED MATERIALS LISTING */}
                                    {les.resources && les.resources.length > 0 && (
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {les.resources.map((res, rIdx) => {
                                          const isUploading = res.uploadStatus === 'uploading'
                                          const isFailed = res.uploadStatus === 'failed'

                                          return (
                                            <div
                                              key={res.id}
                                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold flex items-center gap-2 ${
                                                isFailed
                                                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                                  : isUploading
                                                  ? 'border-primary/40 bg-primary/10 text-primary'
                                                  : 'border-border bg-muted/40 text-foreground'
                                              }`}
                                            >
                                              <FileText className="size-3.5 text-primary" />
                                              <span>📄 {res.title}</span>
                                              <span className="text-[10px] opacity-70">({formatFileSize(res.sizeBytes || 0)})</span>

                                              {isUploading && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse">
                                                  <Loader2 className="size-3 animate-spin" /> {res.uploadProgress || 0}%
                                                </span>
                                              )}

                                              {isFailed && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                                    <AlertCircle className="size-3" /> Upload Failed
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleAttachResource(uIdx, cIdx, lIdx, res.file || null, res.url || '', res.title, res.type)}
                                                    className="inline-flex items-center gap-0.5 rounded bg-destructive text-white px-1.5 py-0.2 text-[9px] font-bold hover:brightness-110"
                                                  >
                                                    <RotateCcw className="size-2.5" /> Retry
                                                  </button>
                                                </div>
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => handleDeleteResource(uIdx, cIdx, lIdx, rIdx)}
                                                className="text-destructive opacity-70 hover:opacity-100 ml-1"
                                              >
                                                <X className="size-3" />
                                              </button>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Final Review & Course Publishing</h3>
                <p className="text-xs text-muted-foreground">Verify readiness, inspect live curriculum summary, and launch your course.</p>
              </div>

              {/* Comprehensive Validation Error Banner */}
              {missingRequirements.length > 0 && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 space-y-2 text-xs text-destructive font-medium">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="size-4" /> Course Cannot Be Published
                  </div>
                  <p className="font-semibold">The following required course elements are missing or incomplete:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {missingRequirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Course Metadata Card */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border/60 pb-4">
                  <div className="size-20 rounded-2xl bg-muted overflow-hidden border border-border flex-shrink-0">
                    {formData.thumbnailUrl ? (
                      <img src={getImageUrl(formData.thumbnailUrl)} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-8 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {formData.academicLevel}
                    </span>
                    <h4 className="text-lg font-bold text-foreground">{formData.courseName || 'Untitled Course'}</h4>
                    <p className="text-xs text-muted-foreground">{formData.shortDescription || 'No description provided.'}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Subject: {formData.subject} • Language: {formData.language} • Duration: {formData.durationHours} hrs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                    <p className="text-2xl font-black text-primary">{courseSummary.totalUnits}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Curriculum Units</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                    <p className="text-2xl font-black text-primary">{courseSummary.totalLessons}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Total Lessons</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                    <p className="text-2xl font-black text-primary">{courseSummary.pdfCount + courseSummary.videoCount}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Study Materials Attached</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* FOOTER ACTION BAR */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-card/80 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1 || isSyncing}
            className="inline-flex items-center gap-2 rounded-xl border border-input px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Previous Step
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSyncing}
              className="rounded-xl border border-input px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent disabled:opacity-40 flex items-center gap-1.5"
            >
              <Save className="size-3.5" /> Save as Draft & Exit
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-40"
              >
                {isSyncing ? <Loader2 className="size-4 animate-spin" /> : null} Next Step <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-40"
              >
                {isSyncing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Publish & Launch Course
              </button>
            )}
          </div>
        </div>

        {/* --- LOCAL STUDY MATERIAL FILE UPLOAD MODAL --- */}
        {resourceModalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <FileText className="size-4 text-primary" />
                  Attach Study Material
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResourceModalTarget(null)
                    setSelectedResourceFile(null)
                    setResourceValidationError(null)
                  }}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Material Title *</label>
                  <input
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g. Chapter 1 Formula Sheet & Reference Guide"
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Document / Resource Type</label>
                  <select
                    value={resourceModalTarget.resType}
                    onChange={(e) => setResourceModalTarget({ ...resourceModalTarget, resType: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="DOCX">Word Document (.docx / .doc)</option>
                    <option value="PPT">PowerPoint Presentation (.ppt / .pptx)</option>
                    <option value="TXT">Text File (.txt)</option>
                    <option value="YouTube Video">YouTube Video Link</option>
                    <option value="GitHub Repository">GitHub Repository Link</option>
                    <option value="External Link">External Reference Link</option>
                  </select>
                </div>

                {/* Drag & Drop Local File Upload Zone for Documents */}
                {['PDF', 'DOCX', 'PPT', 'TXT'].includes(resourceModalTarget.resType) ? (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">Local Document File Upload *</label>

                    {selectedResourceFile ? (
                      /* Selected File Card */
                      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="size-5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              📄 {selectedResourceFile.name}
                            </p>
                            <p className="text-[11px] font-semibold text-muted-foreground">
                              {formatFileSize(selectedResourceFile.size)} • Ready for Upload
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedResourceFile(null)}
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      /* Drag & Drop Zone */
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDraggingResource(true)
                        }}
                        onDragLeave={() => setIsDraggingResource(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsDraggingResource(false)
                          const file = e.dataTransfer.files?.[0]
                          if (file) handleSelectResourceFile(file)
                        }}
                        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                          isDraggingResource
                            ? 'border-primary bg-primary/10 scale-102'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleSelectResourceFile(file)
                          }}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                        <UploadCloud className="size-8 text-primary opacity-70 mb-2" />
                        <p className="font-bold text-xs text-foreground">Drop files here or click to Browse Files</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Supports PDF, DOCX, PPT, PPTX, TXT (Max 25 MB)
                        </p>
                      </div>
                    )}

                    {resourceValidationError && (
                      <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3.5" /> {resourceValidationError}
                      </p>
                    )}
                  </div>
                ) : (
                  /* URL Input for Videos / Repos / Links */
                  <div>
                    <label className="text-xs font-semibold text-foreground">URL / Web Link *</label>
                    <input
                      type="text"
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setResourceModalTarget(null)
                    setSelectedResourceFile(null)
                    setResourceValidationError(null)
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModalAddResource}
                  disabled={isUploadingResourceModal}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploadingResourceModal ? <Loader2 className="size-3.5 animate-spin" /> : null} Upload Material
                </button>
              </div>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
