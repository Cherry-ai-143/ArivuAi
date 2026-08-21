'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Camera,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  Trash2,
  AlertCircle,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUploadAvatar } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { WelcomeLogoCelebration } from '@/components/ui/welcome-logo-celebration'
import type { TeacherInstitutionType } from '@/types/user-profile'

const INSTITUTION_TYPES: TeacherInstitutionType[] = [
  'School (Class 7–10)',
  'PUC / 11th–12th',
  'Degree College',
  'Engineering College',
  'Coaching Institute',
  'University',
  'Other',
]

const EXPERIENCE_OPTIONS = [
  '0–1 Year',
  '1–3 Years',
  '3–5 Years',
  '5–10 Years',
  '10–15 Years',
  '15+ Years',
]

const STEPS = [
  { id: 1, label: 'Profile Picture' },
  { id: 2, label: 'Professional Info' },
  { id: 3, label: 'Subjects Taught' },
  { id: 4, label: 'Teaching Goals' },
  { id: 5, label: 'Finish' },
]

export function TeacherOnboardingWizard() {
  const { currentUser, profileDetails, completeOnboarding } = useAuth()
  const uploadAvatarMutation = useUploadAvatar()
  const [step, setStep] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)

  // Step 1: Photo
  const [avatarUrl, setAvatarUrl] = useState(profileDetails?.avatarUrl || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Step 2: Adaptive Professional Info
  const [institutionType, setInstitutionType] = useState<TeacherInstitutionType>(
    (profileDetails?.institutionType as TeacherInstitutionType) || 'Engineering College'
  )
  const [institutionName, setInstitutionName] = useState(profileDetails?.institutionName || '')
  const [designation, setDesignation] = useState(profileDetails?.designation || 'Assistant Professor')
  const [department, setDepartment] = useState(profileDetails?.department || 'CSE')
  const [qualification, setQualification] = useState(profileDetails?.qualification || 'M.Tech')
  const [experience, setExperience] = useState(profileDetails?.experience || '3–5 Years')
  const [classesTeaching, setClassesTeaching] = useState(profileDetails?.classesTeaching || 'Class 10')
  const [board, setBoard] = useState(profileDetails?.board || 'CBSE')
  const [stream, setStream] = useState(profileDetails?.stream || 'Science')
  const [pucYear, setPucYear] = useState(profileDetails?.semester || '2nd PUC')
  const [teachingCategory, setTeachingCategory] = useState(profileDetails?.teachingCategory || 'JEE')

  // Step 3 & 4: Subjects & Goals
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    profileDetails?.subjects || profileDetails?.learningInterests || []
  )
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    profileDetails?.teachingGoals || profileDetails?.goals || []
  )

  // Step validation attempt flags
  const [step3Attempted, setStep3Attempted] = useState(false)
  const [step4Attempted, setStep4Attempted] = useState(false)

  // Dynamic Subjects based on Institution Type & Stream
  const subjectOptions = useMemo(() => {
    if (institutionType === 'School (Class 7–10)') {
      return [
        'Mathematics',
        'Science',
        'English',
        'Kannada',
        'Hindi',
        'Social Science',
        'Computer Basics',
        'General Knowledge',
        'Environmental Science',
        'Moral Science',
      ]
    }
    if ((institutionType as string) === 'Higher Secondary / PUC' || (institutionType as string) === 'PUC / 11th–12th') {
      if (stream === 'Commerce') {
        return [
          'Accountancy',
          'Economics',
          'Business Studies',
          'Statistics',
          'Computer Applications',
          'CA Foundation',
        ]
      }
      if (stream === 'Arts') {
        return [
          'History',
          'Political Science',
          'Geography',
          'Economics',
          'Psychology',
          'Sociology',
          'UPSC Foundation',
        ]
      }
      return [
        'Physics',
        'Chemistry',
        'Mathematics',
        'Biology',
        'Computer Science',
        'Statistics',
        'Electronics',
        'KCET',
        'NEET',
        'JEE Main',
        'JEE Advanced',
      ]
    }
    if (institutionType === 'Degree College') {
      return [
        'Programming',
        'Python',
        'Java',
        'C',
        'C++',
        'DBMS',
        'Web Development',
        'Data Analytics',
        'Artificial Intelligence',
        'Software Engineering',
      ]
    }
    if (institutionType === 'Engineering College') {
      return [
        'Data Structures',
        'Algorithms',
        'Database Systems',
        'Operating Systems',
        'Computer Networks',
        'Machine Learning',
        'Deep Learning',
        'Cloud Computing',
        'DevOps',
        'React',
        'Node.js',
        'Cyber Security',
        'System Design',
        'Software Engineering',
      ]
    }
    if (institutionType === 'Coaching Institute') {
      return [
        'KCET',
        'NEET',
        'JEE',
        'UPSC',
        'KPSC',
        'SSC',
        'Banking',
        'CAT',
        'GATE',
        'GRE',
        'IELTS',
      ]
    }
    return [
      'Advanced Research',
      'Artificial Intelligence',
      'Data Science',
      'System Architecture',
      'Cloud Computing',
      'Business Strategy',
      'Software Engineering',
      'Deep Learning',
    ]
  }, [institutionType, stream])

  // Dynamic Teaching Goals based on Institution Type
  const teachingGoalOptions = useMemo(() => {
    if (institutionType === 'School (Class 7–10)') {
      return [
        'Improve Student Performance',
        'Generate Worksheets',
        'Weekly Tests',
        'Chapter Assessments',
        'Daily Practice',
        'Progress Tracking',
      ]
    }
    if ((institutionType as string) === 'Higher Secondary / PUC' || (institutionType as string) === 'PUC / 11th–12th') {
      return [
        'Board Exam Preparation',
        'KCET Preparation',
        'NEET Preparation',
        'JEE Preparation',
        'Weekly Revision Tests',
        'Student Performance Tracking',
      ]
    }
    if (institutionType === 'Degree College') {
      return [
        'Semester Assessments',
        'AI Quiz Generation',
        'Assignment Creation',
        'Student Analytics',
        'Improve Pass Percentage',
        'Interactive Learning',
      ]
    }
    if (institutionType === 'Engineering College') {
      return [
        'Placement Preparation',
        'AI Quiz Generation',
        'Assignment Automation',
        'Coding Assessments',
        'Student Analytics',
        'Internship Preparation',
      ]
    }
    if (institutionType === 'Coaching Institute') {
      return [
        'Competitive Exam Preparation',
        'Mock Tests',
        'AI Question Generation',
        'Performance Analysis',
        'Rank Prediction',
        'Revision Planning',
      ]
    }
    return [
      'Research & Innovation',
      'AI Quiz Generation',
      'Course Building',
      'Advanced Assessments',
      'Student Mentorship',
      'Save Teaching Time',
    ]
  }, [institutionType])

  // Do not render if onboarding is already finished (checked AFTER all hooks)
  if (profileDetails?.hasCompletedOnboarding) {
    return null
  }

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleSubject = (item: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const toggleGoal = (item: string) => {
    setSelectedGoals((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
    )
  }

  const handleFinish = async () => {
    let finalAvatarUrl = avatarUrl

    if (avatarFile) {
      const result = await uploadAvatarMutation.mutateAsync(avatarFile)
      finalAvatarUrl = result.avatar_url
    }

    completeOnboarding({
      avatarUrl: finalAvatarUrl,
      institutionType,
      institutionName,
      designation,
      department,
      qualification,
      experience,
      classesTeaching,
      board,
      stream,
      teachingCategory,
      subjects: selectedSubjects,
      learningInterests: selectedSubjects,
      teachingGoals: selectedGoals,
      goals: selectedGoals,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 w-full h-[100dvh] min-h-[100dvh] overflow-y-auto overflow-x-hidden">
      {/* Full-Viewport Backdrop Layer to guarantee 100% viewport coverage */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md pointer-events-none -z-10 w-full h-full min-h-[100dvh]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-auto overflow-hidden"
      >
        {/* Horizontal Progress Bar & Step Labels */}
        <div className="space-y-3 border-b border-border/60 pb-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="size-4 text-accent" />
              Teacher Onboarding Setup
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Step {step} of 5 ({Math.round((step / 5) * 100)}%)
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-indigo-600 to-accent transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          {/* Horizontal Step Labels */}
          <div className="hidden sm:grid grid-cols-5 gap-1 text-center text-[11px] font-medium text-muted-foreground pt-1">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`truncate ${
                  s.id === step
                    ? 'text-primary font-bold'
                    : s.id < step
                    ? 'text-emerald-600 font-semibold'
                    : 'text-muted-foreground/60'
                }`}
              >
                {s.id < step ? '✓ ' : ''}
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: UPLOAD PHOTO */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  Upload Profile Picture
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a photo so your students and institution can recognize you.
                </p>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                  if (e.dataTransfer.files?.[0]) {
                    handleImageUpload(e.dataTransfer.files[0])
                  }
                }}
                className={`mx-auto flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
                }`}
              >
                <div className="relative mb-4">
                  <UserAvatar name={currentUser?.full_name} src={avatarUrl} size="xl" className="ring-4 ring-background shadow-lg" />
                  <label
                    htmlFor="teacher-photo-picker"
                    className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
                    title="Choose photo"
                  >
                    <Camera className="size-5" />
                    <input
                      id="teacher-photo-picker"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label
                    htmlFor="teacher-photo-picker-btn"
                    className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer transition-all border border-border/80"
                  >
                    <Upload className="size-3.5 text-primary" />
                    Upload Photo
                    <input
                      id="teacher-photo-picker-btn"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0])
                        }
                      }}
                    />
                  </label>

                  {avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('')
                        setAvatarFile(null)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
                    >
                      <Trash2 className="size-3.5" />
                      Remove Photo
                    </button>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground mt-3">Drag & drop or click to select PNG, JPG or WEBP</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ADAPTIVE PROFESSIONAL INFO */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  Professional Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about where you teach to adapt your educator tools and subject feeds.
                </p>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* 1st Field: Where do you teach? */}
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Where do you teach?
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value as TeacherInstitutionType)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  >
                    {INSTITUTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SCHOOL (CLASS 7-10) */}
                {institutionType === 'School (Class 7–10)' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        School Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. St. Joseph High School"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Teacher', 'Senior Teacher', 'Head Teacher', 'Principal', 'Vice Principal'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Classes Teaching
                        </label>
                        <select
                          value={classesTeaching}
                          onChange={(e) => setClassesTeaching(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Class 7', 'Class 8', 'Class 9', 'Class 10'].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Board
                        </label>
                        <select
                          value={board}
                          onChange={(e) => setBoard(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['State Board', 'CBSE', 'ICSE', 'IB', 'Other'].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* HIGHER SECONDARY / PUC */}
                {(institutionType as string) === 'Higher Secondary / PUC' || (institutionType as string) === 'PUC / 11th–12th' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. National Pre-University College"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Lecturer', 'Senior Lecturer', 'HOD'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Stream
                        </label>
                        <select
                          value={stream}
                          onChange={(e) => setStream(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Science', 'Commerce', 'Arts'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Teaching Year
                        </label>
                        <select
                          value={pucYear}
                          onChange={(e) => setPucYear(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          <option value="1st PUC">1st PUC / 11th Class</option>
                          <option value="2nd PUC">2nd PUC / 12th Class</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* DEGREE COLLEGE */}
                {institutionType === 'Degree College' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. St. Joseph's Degree College"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor', 'HOD'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['BCA', 'BSc', 'BCom', 'BA', 'BBA', 'BSW', 'B.Ed', 'Other'].map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Highest Qualification
                        </label>
                        <select
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['MSc', 'MCA', 'MBA', 'MCom', 'MA', 'PhD', 'Other'].map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ENGINEERING COLLEGE */}
                {institutionType === 'Engineering College' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. RV College of Engineering"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Assistant Professor', 'Associate Professor', 'Professor', 'HOD'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['CSE', 'AI & ML', 'Data Science', 'ISE', 'ECE', 'EEE', 'Civil', 'Mechanical', 'Robotics', 'Other'].map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Highest Qualification
                        </label>
                        <select
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['M.Tech', 'ME', 'PhD', 'Other'].map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* COACHING INSTITUTE */}
                {institutionType === 'Coaching Institute' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Institute Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Allen / FIITJEE / Brilliant Academy"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Faculty', 'Senior Faculty', 'Academic Head'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Teaching Category
                        </label>
                        <select
                          value={teachingCategory}
                          onChange={(e) => setTeachingCategory(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['NEET', 'JEE', 'KCET', 'UPSC', 'KPSC', 'Banking', 'SSC', 'GATE', 'CAT', 'Other'].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Experience
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                      >
                        {EXPERIENCE_OPTIONS.map((exp) => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* UNIVERSITY */}
                {institutionType === 'University' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        University Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore University / IISc"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['Assistant Professor', 'Associate Professor', 'Professor', 'Dean', 'HOD'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science / AI"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Highest Qualification
                        </label>
                        <select
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {['PhD', 'M.Tech', 'MSc', 'PostDoc', 'Other'].map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTHER */}
                {institutionType === 'Other' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Institution / Academy Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Online Learning Academy"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Designation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Instructor / Mentor"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ADAPTIVE SUBJECTS TAUGHT */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  Subjects Taught
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select subjects tailored for <span className="font-semibold text-foreground">{institutionType}</span>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto p-1">
                {subjectOptions.map((item) => {
                  const isSelected = selectedSubjects.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSubject(item)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border border-primary shadow-md'
                          : 'border border-border bg-card text-foreground hover:border-primary/40'
                      }`}
                    >
                      {isSelected ? <Check className="size-4" /> : null}
                      {item}
                    </button>
                  )
                })}
              </div>

              {step3Attempted && selectedSubjects.length < 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2"
                >
                  <AlertCircle className="size-4 flex-shrink-0" />
                  <span>Please select at least 2 subjects to continue.</span>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep3Attempted(true)
                    if (selectedSubjects.length >= 2) {
                      setStep(4)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ADAPTIVE TEACHING GOALS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  Teaching Goals
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your primary objectives for <span className="font-semibold text-foreground">{institutionType}</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {teachingGoalOptions.map((goal) => {
                  const isSelected = selectedGoals.includes(goal)
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`flex items-center justify-between rounded-2xl p-4 text-left font-medium transition-all ${
                        isSelected
                          ? 'border-2 border-accent bg-accent/10 text-foreground shadow-sm'
                          : 'border border-border bg-card text-foreground hover:border-primary/40'
                      }`}
                    >
                      <span className="text-sm font-semibold">{goal}</span>
                      <div
                        className={`flex size-6 items-center justify-center rounded-full border ${
                          isSelected ? 'border-accent bg-accent text-accent-foreground' : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected ? <Check className="size-3.5" /> : null}
                      </div>
                    </button>
                  )
                })}
              </div>

              {step4Attempted && selectedGoals.length < 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2"
                >
                  <AlertCircle className="size-4 flex-shrink-0" />
                  <span>Please select at least 2 teaching goals to continue.</span>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep4Attempted(true)
                    if (selectedGoals.length >= 2) {
                      setStep(5)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINISH SETUP */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6 text-center py-4"
            >
              <WelcomeLogoCelebration />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="font-serif text-3xl font-bold text-foreground">Welcome to Arivu AI! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Your educator workspace for <span className="font-semibold text-foreground">{institutionType}</span> is ready. Let's build smarter learning experiences together!
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full sm:flex-1 rounded-2xl bg-accent px-8 py-3.5 text-base font-bold text-accent-foreground shadow-xl hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
