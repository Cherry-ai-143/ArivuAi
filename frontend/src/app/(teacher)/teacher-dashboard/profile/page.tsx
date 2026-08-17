'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  Building,
  Sparkles,
  Target,
  Edit2,
  Camera,
  Save,
  X,
  Award,
  Clock,
  Loader2,
  Check,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ChipSelector } from '@/components/ui/chip-selector'
import { calculateProfileCompletion, type TeacherInstitutionType } from '@/types/user-profile'
import { getSubjectOptionsForInstitution, TEACHER_GOAL_OPTIONS } from '@/lib/constants/adaptive-options'

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

export default function TeacherProfilePage() {
  const searchParams = useSearchParams()
  const { currentUser, profileDetails, updateProfile: updateLocalProfile } = useAuth()
  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()

  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true)
    }
  }, [searchParams])

  // Form state
  const [fullName, setFullName] = useState(currentUser?.full_name || '')
  const [institutionType, setInstitutionType] = useState<TeacherInstitutionType>(
    (currentUser?.institution_type as TeacherInstitutionType) ||
    (profileDetails?.institutionType as TeacherInstitutionType) ||
    'Engineering College'
  )
  const [institutionName, setInstitutionName] = useState(currentUser?.institution_name || profileDetails?.institutionName || '')
  const [designation, setDesignation] = useState(currentUser?.designation || profileDetails?.designation || 'Assistant Professor')
  const [department, setDepartment] = useState(currentUser?.department || profileDetails?.department || 'Computer Science')
  const [qualification, setQualification] = useState(currentUser?.qualification || profileDetails?.qualification || 'Ph.D')
  const [experience, setExperience] = useState(currentUser?.years_of_experience || profileDetails?.experience || '3–5 Years')
  const [bio, setBio] = useState(currentUser?.bio || profileDetails?.bio || '')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentUser?.interests || profileDetails?.subjects || profileDetails?.learningInterests || []
  )
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    currentUser?.goals || profileDetails?.teachingGoals || profileDetails?.goals || []
  )

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '')
      if (currentUser.institution_type) setInstitutionType(currentUser.institution_type as TeacherInstitutionType)
      setInstitutionName(currentUser.institution_name || profileDetails?.institutionName || '')
      setDesignation(currentUser.designation || profileDetails?.designation || 'Assistant Professor')
      setDepartment(currentUser.department || profileDetails?.department || 'Computer Science')
      setQualification(currentUser.qualification || profileDetails?.qualification || 'Ph.D')
      setExperience(currentUser.years_of_experience || profileDetails?.experience || '3–5 Years')
      setBio(currentUser.bio || profileDetails?.bio || '')
      setSelectedSubjects(currentUser.interests || profileDetails?.subjects || [])
      setSelectedGoals(currentUser.goals || profileDetails?.teachingGoals || [])
    }
  }, [currentUser, profileDetails])

  // Adaptive subjects based on institution type
  const subjectOptions = useMemo(
    () => getSubjectOptionsForInstitution(institutionType),
    [institutionType]
  )

  const completion = useMemo(
    () => calculateProfileCompletion(currentUser, profileDetails),
    [currentUser, profileDetails]
  )

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!fullName.trim()) errors.fullName = 'Full Name is required.'
    if (!institutionName.trim()) errors.institutionName = 'Institution Name is required.'
    if (!institutionType) errors.institutionType = 'Institution Type is required.'
    if (!designation.trim()) errors.designation = 'Designation is required.'
    if (!department.trim()) errors.department = 'Department is required.'
    if (!qualification.trim()) errors.qualification = 'Qualification is required.'
    if (!experience) errors.experience = 'Experience is required.'
    if (selectedSubjects.length === 0) errors.subjects = 'Please select at least one subject.'
    if (selectedGoals.length === 0) errors.goals = 'Please select at least one teaching goal.'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!validateForm()) {
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName,
        institution_name: institutionName,
        institution_type: institutionType,
        designation,
        department,
        qualification,
        years_of_experience: experience,
        bio,
        interests: selectedSubjects,
        goals: selectedGoals,
      })

      updateLocalProfile({
        institutionType,
        institutionName,
        designation,
        department,
        qualification,
        experience,
        bio,
        subjects: selectedSubjects,
        learningInterests: selectedSubjects,
        teachingGoals: selectedGoals,
        goals: selectedGoals,
      })

      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update educator profile')
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const res = await uploadAvatarMutation.mutateAsync(file)
        if (res.avatar_url) {
          updateLocalProfile({ avatarUrl: res.avatar_url })
        }
      } catch (err: any) {
        setErrorMsg('Failed to upload avatar image')
      }
    }
  }

  const roleTitle = designation || 'Teacher'

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/95 via-primary to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <UserAvatar name={currentUser?.full_name} src={currentUser?.avatar_url || profileDetails?.avatarUrl} size="xl" className="ring-4 ring-white/20 shadow-lg" />
            <label
              htmlFor="teacher-profile-photo-input"
              className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
              title="Upload New Picture"
            >
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
              <input
                id="teacher-profile-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadAvatarMutation.isPending}
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold truncate">
                {currentUser?.full_name || 'Teacher'}
              </h1>
              <span className="rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-bold text-accent">
                {roleTitle}
              </span>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-1">{currentUser?.email}</p>
            <p className="text-xs text-primary-foreground/70 mt-2 max-w-xl">
              {currentUser?.bio || profileDetails?.bio || 'Dedicated educator building smarter learning experiences with Arivu AI.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 border border-white/20 transition-all"
            >
              {isEditing ? <X className="size-4" /> : <Edit2 className="size-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 flex items-center gap-2">
          <Check className="size-4" />
          Educator profile updated successfully!
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Profile Completion Bar */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Profile Completion</h2>
          </div>
          <span className="text-base font-bold text-accent">{completion.percentage}%</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-indigo-600 to-accent transition-all duration-500 rounded-full"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>
        {completion.missingItems.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Missing: </span>
            {completion.missingItems.map((i) => i.label).join(', ')}
          </p>
        )}
      </div>

      {/* Edit Form or View Cards */}
      {isEditing ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Edit Educator Information</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {validationErrors.fullName && (
                <p className="text-xs text-destructive mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Where do you teach? *
              </label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value as TeacherInstitutionType)}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              >
                {INSTITUTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Institution / School / University *
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. RV College of Engineering"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {validationErrors.institutionName && (
                <p className="text-xs text-destructive mt-1">{validationErrors.institutionName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Designation *
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Assistant Professor"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {validationErrors.designation && (
                <p className="text-xs text-destructive mt-1">{validationErrors.designation}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Department / Stream *
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {validationErrors.department && (
                <p className="text-xs text-destructive mt-1">{validationErrors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Highest Qualification *
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Ph.D / M.Tech"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {validationErrors.qualification && (
                <p className="text-xs text-destructive mt-1">{validationErrors.qualification}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Years of Experience *
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              >
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summary of your teaching philosophy and academic background..."
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Subjects Taught - Chip Selector */}
          <ChipSelector
            label="Subjects Taught *"
            description={`Available subjects automatically adapt for ${institutionType}.`}
            options={subjectOptions}
            selectedValues={selectedSubjects}
            onChange={setSelectedSubjects}
            error={validationErrors.subjects}
            customPlaceholder="Add custom subject..."
          />

          {/* Teaching Goals - Chip Selector */}
          <ChipSelector
            label="Teaching Goals *"
            description="Select your primary objectives for teaching with Arivu AI."
            options={TEACHER_GOAL_OPTIONS}
            selectedValues={selectedGoals}
            onChange={setSelectedGoals}
            error={validationErrors.goals}
            customPlaceholder="Add custom goal..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={updateProfileMutation.isPending}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:brightness-110 transition-all disabled:opacity-70"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Professional Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <GraduationCap className="size-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Professional Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="size-4 text-muted-foreground" /> Institution Type
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.institution_type || profileDetails?.institutionType || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building className="size-4 text-muted-foreground" /> Institution
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.institution_name || profileDetails?.institutionName || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Award className="size-4 text-muted-foreground" /> Designation
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.designation || profileDetails?.designation || 'Assistant Professor'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <BookOpen className="size-4 text-muted-foreground" /> Department / Stream
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.department || profileDetails?.department || 'Computer Science'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="size-4 text-muted-foreground" /> Qualification
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.qualification || profileDetails?.qualification || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" /> Experience
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.years_of_experience || profileDetails?.experience || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Subjects & Goals Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-3">
                <Sparkles className="size-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Subjects Taught</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser?.interests?.length
                  ? currentUser.interests
                  : profileDetails?.subjects?.length
                  ? profileDetails.subjects
                  : profileDetails?.learningInterests
                )?.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {subject}
                  </span>
                )) || <p className="text-xs text-muted-foreground">No subjects selected yet.</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-3">
                <Target className="size-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Teaching Goals</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser?.goals?.length
                  ? currentUser.goals
                  : profileDetails?.teachingGoals?.length
                  ? profileDetails.teachingGoals
                  : profileDetails?.goals
                )?.map((goal) => (
                  <span
                    key={goal}
                    className="rounded-xl border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-bold text-accent"
                  >
                    {goal}
                  </span>
                )) || <p className="text-xs text-muted-foreground">No teaching goals selected yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
