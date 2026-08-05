'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Moon,
  Shield,
  LogOut,
  Camera,
  Save,
  Check,
  Loader2,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useUploadAvatar, useChangePassword } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ChipSelector } from '@/components/ui/chip-selector'
import type { TeacherInstitutionType } from '@/types/user-profile'
import { getSubjectOptionsForInstitution, TEACHER_GOAL_OPTIONS } from '@/lib/constants/adaptive-options'

type SettingsTab = 'profile' | 'security' | 'notifications' | 'preferences' | 'privacy'

const INSTITUTION_TYPES: TeacherInstitutionType[] = [
  'School (Class 7–10)',
  'Higher Secondary / PUC',
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

export default function TeacherSettingsPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as SettingsTab | null
  const { currentUser, profileDetails, updateProfile: updateLocalProfile } = useAuth()
  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()
  const changePasswordMutation = useChangePassword()

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'profile')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Profile tab fields
  const [fullName, setFullName] = useState(currentUser?.full_name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [institutionType, setInstitutionType] = useState<TeacherInstitutionType>(
    (currentUser?.institution_type as TeacherInstitutionType) ||
    (profileDetails?.institutionType as TeacherInstitutionType) ||
    'Engineering College'
  )
  const [institutionName, setInstitutionName] = useState(currentUser?.institution_name || profileDetails?.institutionName || '')
  const [designation, setDesignation] = useState(currentUser?.designation || profileDetails?.designation || '')
  const [department, setDepartment] = useState(currentUser?.department || profileDetails?.department || '')
  const [qualification, setQualification] = useState(currentUser?.qualification || profileDetails?.qualification || '')
  const [experience, setExperience] = useState(currentUser?.years_of_experience || profileDetails?.experience || '3–5 Years')
  const [bio, setBio] = useState(currentUser?.bio || profileDetails?.bio || '')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentUser?.interests || profileDetails?.subjects || profileDetails?.learningInterests || []
  )
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    currentUser?.goals || profileDetails?.teachingGoals || profileDetails?.goals || []
  )

  // Security tab fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('')
  const [pwdErrorMsg, setPwdErrorMsg] = useState('')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '')
      setEmail(currentUser.email || '')
      if (currentUser.institution_type) setInstitutionType(currentUser.institution_type as TeacherInstitutionType)
      setInstitutionName(currentUser.institution_name || profileDetails?.institutionName || '')
      setDesignation(currentUser.designation || profileDetails?.designation || '')
      setDepartment(currentUser.department || profileDetails?.department || '')
      setQualification(currentUser.qualification || profileDetails?.qualification || '')
      setExperience(currentUser.years_of_experience || profileDetails?.experience || '3–5 Years')
      setBio(currentUser.bio || profileDetails?.bio || '')
      setSelectedSubjects(currentUser.interests || profileDetails?.subjects || [])
      setSelectedGoals(currentUser.goals || profileDetails?.teachingGoals || [])
    }
  }, [currentUser, profileDetails])

  const subjectOptions = useMemo(
    () => getSubjectOptionsForInstitution(institutionType),
    [institutionType]
  )

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

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
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update settings')
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdSuccessMsg('')
    setPwdErrorMsg('')

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('New password and confirmation do not match.')
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

      setPwdSuccessMsg('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwdSuccessMsg(''), 4000)
    } catch (err: any) {
      setPwdErrorMsg(err.response?.data?.detail || 'Failed to change password. Please check your current password.')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Settings</h1>
        <p className="text-muted-foreground">Manage your educator profile, account security, and preferences</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-2 space-y-1 shadow-sm">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
              { id: 'privacy', label: 'Privacy', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as SettingsTab)}
                className={`w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all flex items-center gap-3 ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="size-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Notifications */}
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

              {/* Profile Picture */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4">Profile Picture</h2>
                <div className="flex items-center gap-4">
                  <UserAvatar name={fullName} src={currentUser?.avatar_url || profileDetails?.avatarUrl} size="lg" />
                  <label
                    htmlFor="teacher-settings-photo-input"
                    className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:border-primary/50 cursor-pointer transition-all flex items-center gap-2 shadow-sm"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4 text-primary" />
                    )}
                    Change Photo
                    <input
                      id="teacher-settings-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadAvatarMutation.isPending}
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <form onSubmit={handleProfileSave} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <h2 className="font-semibold text-foreground mb-2">Educator Information</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/60 text-foreground cursor-not-allowed opacity-80 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Where do you teach?
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value as TeacherInstitutionType)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
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
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. RV College of Engineering"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Department / Stream
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Highest Qualification
                    </label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. Ph.D / M.Tech"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Years of Experience
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
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
                    Bio / Teaching Philosophy
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short summary about your academic journey and teaching methods..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  />
                </div>

                {/* Subjects Taught - Chip Selector */}
                <ChipSelector
                  label="Subjects Taught"
                  description={`Subjects adapt dynamically for ${institutionType}.`}
                  options={subjectOptions}
                  selectedValues={selectedSubjects}
                  onChange={setSelectedSubjects}
                  customPlaceholder="Add custom subject..."
                />

                {/* Teaching Goals - Chip Selector */}
                <ChipSelector
                  label="Teaching Goals"
                  description="Select your teaching objectives."
                  options={TEACHER_GOAL_OPTIONS}
                  selectedValues={selectedGoals}
                  onChange={setSelectedGoals}
                  customPlaceholder="Add custom goal..."
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all disabled:opacity-70"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <form onSubmit={handleChangePassword} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-foreground mb-4">Change Password</h2>

                {pwdSuccessMsg && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 flex items-center gap-2">
                    <Check className="size-4" />
                    {pwdSuccessMsg}
                  </div>
                )}
                {pwdErrorMsg && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                    {pwdErrorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {changePasswordMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  Update Password
                </button>
              </form>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-2">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your Arivu AI account.
                </p>
                <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:brightness-110 transition-all">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-6">Email Notifications</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Course Enrollment Updates', description: 'When new students enroll in your subjects' },
                    { label: 'Quiz Submissions', description: 'When students submit assessments' },
                    { label: 'System Announcements', description: 'Platform updates and feature notices' },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={idx < 2}
                        className="size-4 rounded border-border accent-primary cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Moon className="size-5 text-primary" />
                  Theme
                </h2>
                <div className="space-y-3">
                  {['Light', 'Dark', 'System'].map((theme) => (
                    <label key={theme} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        defaultChecked={theme === 'Light'}
                        className="size-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
                <h2 className="font-semibold text-destructive mb-2">Danger Zone</h2>
                <p className="text-xs text-muted-foreground mb-4">Permanently remove your teacher account and all course records.</p>
                <button className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2">
                  <LogOut className="size-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
