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
  GraduationCap,
  BookOpen,
  Target,
  UserCheck,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUploadAvatar } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/user-avatar'
import type { EducationLevel } from '@/types/user-profile'

const EDUCATION_LEVELS: EducationLevel[] = [
  'Higher School (Class 7–10)',
  'PUC / 11th–12th',
  'Diploma',
  'Undergraduate (Degree)',
  'Engineering',
  'Postgraduate',
  'Other',
]

const STEPS = [
  { id: 1, label: 'Profile Picture' },
  { id: 2, label: 'Academic Details' },
  { id: 3, label: 'Learning Interests' },
  { id: 4, label: 'Learning Goals' },
  { id: 5, label: 'Finish' },
]

export function OnboardingWizard() {
  const { currentUser, profileDetails, completeOnboarding } = useAuth()
  const [step, setStep] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)

  const uploadAvatarMutation = useUploadAvatar()

  // Step 1: Photo
  const [avatarUrl, setAvatarUrl] = useState(profileDetails?.avatarUrl || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Step 2: Academic
  const [education, setEducation] = useState<EducationLevel>(
    (profileDetails?.education as EducationLevel) || 'Engineering'
  )
  const [institutionName, setInstitutionName] = useState(profileDetails?.institutionName || '')

  // Higher School
  const [classLevel, setClassLevel] = useState(profileDetails?.classLevel || '10th')
  const [board, setBoard] = useState(profileDetails?.board || 'CBSE')

  // PUC
  const [pucYear, setPucYear] = useState(profileDetails?.semester || '2nd PUC')
  const [stream, setStream] = useState(profileDetails?.stream || 'Science')
  const [scienceFocus, setScienceFocus] = useState(profileDetails?.scienceFocus || 'PCMB')

  // Diploma / Degree / Engg / PG
  const [degree, setDegree] = useState(profileDetails?.degree || 'BSc')
  const [program, setProgram] = useState(profileDetails?.program || 'MCA')
  const [branch, setBranch] = useState(profileDetails?.branch || 'CSE')
  const [semester, setSemester] = useState(profileDetails?.semester || '6th Semester')
  const [customCourse, setCustomCourse] = useState(profileDetails?.course || '')

  // Step 3 & 4: Interests & Goals
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profileDetails?.learningInterests || []
  )
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    profileDetails?.goals || []
  )
  // Dynamic Interests based on Education & Stream
  const interestOptions = useMemo(() => {
    if (education === 'Higher School (Class 7–10)') {
      return [
        'Mathematics',
        'Science',
        'English',
        'Social Science',
        'Kannada',
        'Hindi',
        'General Knowledge',
        'Olympiad',
        'Coding Basics',
        'Mental Ability',
      ]
    }
    if (education === 'PUC / 11th–12th') {
      if (stream === 'Commerce') {
        return ['Accountancy', 'Economics', 'Business Studies', 'Statistics', 'CA Foundation', 'Banking']
      }
      if (stream === 'Arts') {
        return ['History', 'Political Science', 'Geography', 'Economics', 'Psychology', 'UPSC Foundation']
      }
      return [
        'Physics',
        'Chemistry',
        'Mathematics',
        'Biology',
        'Computer Science',
        'KCET',
        'NEET',
        'JEE Main',
        'JEE Advanced',
        'Board Exams',
      ]
    }
    if (education === 'Engineering') {
      return [
        'Programming',
        'AI',
        'Machine Learning',
        'React',
        'Python',
        'Java',
        'Cloud',
        'Cyber Security',
        'Data Science',
        'DevOps',
        'Mobile Development',
        'System Design',
      ]
    }
    if (education === 'Undergraduate (Degree)') {
      return [
        'Programming',
        'Business',
        'Accounting',
        'Economics',
        'Data Analytics',
        'Digital Marketing',
        'Communication Skills',
        'Research',
        'Presentation Skills',
      ]
    }
    return [
      'Technical Skills',
      'Programming',
      'AI & ML',
      'Data Science',
      'Project Management',
      'Business Strategy',
      'Communication Skills',
      'Research',
    ]
  }, [education, stream])

  // Dynamic Goals based on Education
  const goalOptions = useMemo(() => {
    if (education === 'Higher School (Class 7–10)') {
      return [
        'Improve Grades',
        'Prepare for Exams',
        'Build Strong Basics',
        'Olympiad Preparation',
        'Coding Skills',
        'Daily Practice',
      ]
    }
    if (education === 'PUC / 11th–12th') {
      if (stream === 'Commerce') {
        return ['Board Exams', 'CA Foundation', 'Improve Accounts', 'Competitive Exams']
      }
      if (stream === 'Arts') {
        return ['Board Exams', 'UPSC Foundation', 'Improve Social Sciences', 'Competitive Exams']
      }
      return ['KCET', 'NEET', 'JEE', 'Board Exams', 'Improve PCM', 'Daily Revision']
    }
    if (education === 'Engineering') {
      return [
        'Placement Preparation',
        'Internships',
        'DSA',
        'Interview Preparation',
        'Competitive Programming',
        'Upskill',
        'AI Career',
      ]
    }
    if (education === 'Undergraduate (Degree)') {
      return ['Higher Studies', 'Placement', 'Competitive Exams', 'Research', 'Skill Development']
    }
    return [
      'Career Advancement',
      'Research & Publishing',
      'Executive Leadership',
      'PhD Prep',
      'Specialization',
    ]
  }, [education, stream])

  // Do not render if onboarding is already finished (checked after all hooks)
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

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const toggleGoal = (item: string) => {
    setSelectedGoals((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
    )
  }

  const getComputedCourse = (): string => {
    if (education === 'Higher School (Class 7–10)') return `Class ${classLevel} (${board})`
    if (education === 'PUC / 11th–12th') return `${pucYear} - ${stream} (${scienceFocus})`
    if (education === 'Undergraduate (Degree)') return degree
    if (education === 'Postgraduate') return program
    return customCourse || education
  }

  const getComputedSemester = (): string => {
    if (education === 'Higher School (Class 7–10)') return classLevel
    if (education === 'PUC / 11th–12th') return pucYear
    return semester
  }

  const handleFinish = async () => {
    let finalAvatarUrl = avatarUrl

    if (avatarFile) {
      const result = await uploadAvatarMutation.mutateAsync(avatarFile)
      finalAvatarUrl = result.avatar_url
    }

    completeOnboarding({
      avatarUrl: finalAvatarUrl,
      education,
      institutionName,
      classLevel,
      board,
      stream,
      scienceFocus,
      degree,
      program,
      branch,
      semester: getComputedSemester(),
      course: getComputedCourse(),
      learningInterests: selectedInterests,
      goals: selectedGoals,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-auto"
      >
        {/* Horizontal Progress Bar & Step Labels */}
        <div className="space-y-3 border-b border-border/60 pb-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="size-4 text-accent" />
              Onboarding Setup
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
                  Add a photo so your teachers and peers can recognize you.
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
                    htmlFor="onboarding-photo-picker"
                    className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
                    title="Choose photo"
                  >
                    <Camera className="size-5" />
                    <input
                      id="onboarding-photo-picker"
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
                    htmlFor="onboarding-photo-picker-btn"
                    className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer transition-all border border-border/80"
                  >
                    <Upload className="size-3.5 text-primary" />
                    Upload Photo
                    <input
                      id="onboarding-photo-picker-btn"
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

          {/* STEP 2: ADAPTIVE ACADEMIC INFO */}
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
                  Academic Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about your current education level to adapt your quizzes and recommendations.
                </p>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Education Level Selector */}
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Education Level
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value as EducationLevel)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  >
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* HIGHER SCHOOL (CLASS 7-10) */}
                {education === 'Higher School (Class 7–10)' && (
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
                          Current Class
                        </label>
                        <select
                          value={classLevel}
                          onChange={(e) => setClassLevel(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="7th">7th Standard</option>
                          <option value="8th">8th Standard</option>
                          <option value="9th">9th Standard</option>
                          <option value="10th">10th Standard (SSLC / Class 10)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Board (Optional)
                        </label>
                        <select
                          value={board}
                          onChange={(e) => setBoard(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="CBSE">CBSE</option>
                          <option value="State Board">State Board</option>
                          <option value="ICSE">ICSE</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* PUC / 11th - 12th */}
                {education === 'PUC / 11th–12th' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        College Name
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
                          Current Year
                        </label>
                        <select
                          value={pucYear}
                          onChange={(e) => setPucYear(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="1st PUC">1st PUC / 11th Class</option>
                          <option value="2nd PUC">2nd PUC / 12th Class</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Stream
                        </label>
                        <select
                          value={stream}
                          onChange={(e) => setStream(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                        </select>
                      </div>
                    </div>
                    {stream === 'Science' && (
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Science Combination (Optional Focus)
                        </label>
                        <select
                          value={scienceFocus}
                          onChange={(e) => setScienceFocus(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="PCMB">PCMB (Physics, Chemistry, Maths, Biology)</option>
                          <option value="PCMC">PCMC (Physics, Chemistry, Maths, Computer Science)</option>
                          <option value="PCME">PCME (Physics, Chemistry, Maths, Electronics)</option>
                          <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* DIPLOMA */}
                {education === 'Diploma' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Polytechnic / College Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Government Polytechnic College"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Branch
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CS / EC / Mechanical"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Current Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* UNDERGRADUATE (DEGREE) */}
                {education === 'Undergraduate (Degree)' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        College Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. St. Joseph's College"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Degree
                        </label>
                        <select
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="BCA">BCA</option>
                          <option value="BSc">BSc</option>
                          <option value="BCom">BCom</option>
                          <option value="BA">BA</option>
                          <option value="BBA">BBA</option>
                          <option value="B.Ed">B.Ed</option>
                          <option value="Other">Other Degree</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Current Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ENGINEERING */}
                {education === 'Engineering' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Engineering College Name
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
                          Branch
                        </label>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="CSE">CSE (Computer Science)</option>
                          <option value="AI & ML">AI & ML</option>
                          <option value="Data Science">Data Science</option>
                          <option value="ISE">ISE (Information Science)</option>
                          <option value="ECE">ECE (Electronics & Comm)</option>
                          <option value="EEE">EEE (Electrical & Electronics)</option>
                          <option value="Civil">Civil Engineering</option>
                          <option value="Mechanical">Mechanical Engineering</option>
                          <option value="Other">Other Branch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Current Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* POSTGRADUATE */}
                {education === 'Postgraduate' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        University / College Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IISc / Bangalore University"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Program
                        </label>
                        <select
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="MCA">MCA</option>
                          <option value="M.Tech">M.Tech</option>
                          <option value="MSc">MSc</option>
                          <option value="MBA">MBA</option>
                          <option value="MCom">MCom</option>
                          <option value="MA">MA</option>
                          <option value="Other">Other PG Program</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                          Current Semester
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTHER */}
                {education === 'Other' && (
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Online Academy / Learning Center"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Field of Study / Course
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Web Development"
                        value={customCourse}
                        onChange={(e) => setCustomCourse(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
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

          {/* STEP 3: ADAPTIVE LEARNING INTERESTS */}
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
                  Learning Interests
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select subjects suited for <span className="font-semibold text-foreground">{education}</span>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto p-1">
                {interestOptions.map((item) => {
                  const isSelected = selectedInterests.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
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
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:brightness-110 transition-all"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ADAPTIVE GOALS */}
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
                  Why are you here?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your personal goals for <span className="font-semibold text-foreground">{education}</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {goalOptions.map((goal) => {
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
                  onClick={() => setStep(5)}
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
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Sparkles className="size-10 animate-bounce" />
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground">Welcome to Arivu AI! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Your personalized learning profile for <span className="font-semibold text-foreground">{education}</span> is set up. Let's start learning smarter!
                </p>
              </div>

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
                  className="w-full sm:flex-1 rounded-2xl bg-accent px-8 py-3.5 text-base font-bold text-accent-foreground shadow-xl hover:brightness-110 transition-all"
                >
                  Finish Setup
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
