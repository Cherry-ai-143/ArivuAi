'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  Building,
  Sparkles,
  Target,
  Calendar,
  Edit2,
  Camera,
  Save,
  X,
  Award,
  Loader2,
  Check,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ChipSelector } from '@/components/ui/chip-selector'
import { calculateProfileCompletion, type EducationLevel } from '@/types/user-profile'
import { getSubjectOptionsForInstitution, STUDENT_GOAL_OPTIONS } from '@/lib/constants/adaptive-options'

const EDUCATION_LEVELS: EducationLevel[] = [
  'Higher School (Class 7–10)',
  'PUC / 11th–12th',
  'Diploma',
  'Undergraduate (Degree)',
  'Engineering',
  'Postgraduate',
  'Other',
]

export default function ProfilePage() {
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
  const [education, setEducation] = useState<EducationLevel>(
    (currentUser?.education_level as EducationLevel) || (profileDetails?.education as EducationLevel) || 'Engineering'
  )
  const [institutionName, setInstitutionName] = useState(currentUser?.institution_name || profileDetails?.institutionName || '')
  const [course, setCourse] = useState(currentUser?.course || profileDetails?.course || '')
  const [branch, setBranch] = useState(currentUser?.branch || profileDetails?.branch || '')
  const [semester, setSemester] = useState(currentUser?.semester || profileDetails?.semester || '')
  const [bio, setBio] = useState(currentUser?.bio || profileDetails?.bio || '')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentUser?.interests || profileDetails?.learningInterests || []
  )
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    currentUser?.goals || profileDetails?.goals || []
  )

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '')
      if (currentUser.education_level) setEducation(currentUser.education_level as EducationLevel)
      setInstitutionName(currentUser.institution_name || profileDetails?.institutionName || '')
      setCourse(currentUser.course || profileDetails?.course || '')
      setBranch(currentUser.branch || profileDetails?.branch || '')
      setSemester(currentUser.semester || profileDetails?.semester || '')
      setBio(currentUser.bio || profileDetails?.bio || '')
      setSelectedInterests(currentUser.interests || profileDetails?.learningInterests || [])
      setSelectedGoals(currentUser.goals || profileDetails?.goals || [])
    }
  }, [currentUser, profileDetails])

  const interestOptions = useMemo(
    () => getSubjectOptionsForInstitution(undefined, education),
    [education]
  )

  const completion = useMemo(
    () => calculateProfileCompletion(currentUser, profileDetails),
    [currentUser, profileDetails]
  )

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!fullName.trim()) errors.fullName = 'Full Name is required.'
    if (!institutionName.trim()) errors.institutionName = 'Institution Name is required.'
    if (!education) errors.education = 'Education Level is required.'
    if (!course.trim()) errors.course = 'Course / Stream is required.'
    if (selectedInterests.length === 0) errors.interests = 'Please select at least one interest.'
    if (selectedGoals.length === 0) errors.goals = 'Please select at least one goal.'
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
        education_level: education,
        institution_name: institutionName,
        course,
        branch,
        semester,
        bio,
        interests: selectedInterests,
        goals: selectedGoals,
      })

      updateLocalProfile({
        education,
        institutionName,
        course,
        branch,
        semester,
        bio,
        learningInterests: selectedInterests,
        goals: selectedGoals,
      })

      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update student profile')
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

  const roleTitle = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : 'Student'

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Banner & Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/95 via-primary to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera Button */}
          <div className="relative group">
            <UserAvatar name={currentUser?.full_name} src={currentUser?.avatar_url || profileDetails?.avatarUrl} size="xl" className="ring-4 ring-white/20 shadow-lg" />
            <label
              htmlFor="profile-photo-input"
              className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
              title="Upload New Picture"
            >
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
              <input
                id="profile-photo-input"
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
                {currentUser?.full_name || 'Student Name'}
              </h1>
              <span className="rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-bold text-accent">
                {roleTitle}
              </span>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-1">{currentUser?.email}</p>
            <p className="text-xs text-primary-foreground/70 mt-2 max-w-xl">
              {currentUser?.bio || profileDetails?.bio || 'Passionate student learning smarter with Arivu AI.'}
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
          Profile updated successfully!
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
          <h2 className="text-xl font-bold text-foreground mb-4">Edit Profile Information</h2>

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
                Education Level *
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value as EducationLevel)}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
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
                Course / Stream / Degree *
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Computer Science Engineering"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {validationErrors.course && (
                <p className="text-xs text-destructive mt-1">{validationErrors.course}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Branch / Specialization
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Semester / Class / Year
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. 6th Semester"
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
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
              placeholder="Tell us a little about your learning goals..."
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Learning Interests - Chip Selector */}
          <ChipSelector
            label="Learning Interests *"
            description={`Recommended topics for ${education}.`}
            options={interestOptions}
            selectedValues={selectedInterests}
            onChange={setSelectedInterests}
            error={validationErrors.interests}
            customPlaceholder="Add custom interest..."
          />

          {/* Learning Goals - Chip Selector */}
          <ChipSelector
            label="Learning Goals *"
            description="Select your primary academic and career objectives."
            options={STUDENT_GOAL_OPTIONS}
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
          {/* Academic Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <GraduationCap className="size-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Academic Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="size-4 text-muted-foreground" /> Education Level
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.education_level || profileDetails?.education || 'Not specified'}
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
                  <BookOpen className="size-4 text-muted-foreground" /> Course / Details
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.course || profileDetails?.course || 'Not specified'}
                </span>
              </div>
              {currentUser?.branch || profileDetails?.branch ? (
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" /> Branch
                  </span>
                  <span className="font-semibold text-foreground">
                    {currentUser?.branch || profileDetails?.branch}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" /> Year / Semester
                </span>
                <span className="font-semibold text-foreground">
                  {currentUser?.semester || profileDetails?.semester || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Interests & Goals Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-3">
                <Sparkles className="size-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Learning Interests</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser?.interests?.length
                  ? currentUser.interests
                  : profileDetails?.learningInterests
                )?.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {interest}
                  </span>
                )) || <p className="text-xs text-muted-foreground">No interests selected yet.</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-3">
                <Target className="size-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Primary Goals</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser?.goals?.length
                  ? currentUser.goals
                  : profileDetails?.goals
                )?.map((goal) => (
                  <span
                    key={goal}
                    className="rounded-xl border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-bold text-accent"
                  >
                    {goal}
                  </span>
                )) || <p className="text-xs text-muted-foreground">No goals selected yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
