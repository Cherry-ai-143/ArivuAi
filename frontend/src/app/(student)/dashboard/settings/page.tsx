'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Moon,
  Globe,
  Shield,
  LogOut,
  Camera,
  Save,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useUploadAvatar, useChangePassword, useDeleteAccount } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ChipSelector } from '@/components/ui/chip-selector'
import type { EducationLevel } from '@/types/user-profile'
import { getSubjectOptionsForInstitution, STUDENT_GOAL_OPTIONS } from '@/lib/constants/adaptive-options'

type SettingsTab = 'profile' | 'security' | 'notifications' | 'preferences' | 'privacy'

const EDUCATION_LEVELS: EducationLevel[] = [
  'Higher School (Class 7–10)',
  'PUC / 11th–12th',
  'Diploma',
  'Undergraduate (Degree)',
  'Engineering',
  'Postgraduate',
  'Other',
]

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as SettingsTab | null
  const { currentUser, profileDetails, updateProfile: updateLocalProfile, logout } = useAuth()
  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()
  const changePasswordMutation = useChangePassword()
  const deleteAccountMutation = useDeleteAccount()

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'profile')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  // Profile tab fields
  const [fullName, setFullName] = useState(currentUser?.full_name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

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

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync()
      logout()
      router.push('/login')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to delete account')
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security</p>
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
                  Profile updated successfully!
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
                    htmlFor="settings-photo-input"
                    className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:border-primary/50 cursor-pointer transition-all flex items-center gap-2 shadow-sm"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4 text-primary" />
                    )}
                    Change Photo
                    <input
                      id="settings-photo-input"
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
                <h2 className="font-semibold text-foreground mb-2">Personal Information</h2>

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
                      Education Level
                    </label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value as EducationLevel)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
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
                      Institution / School / College
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Arivu Institute of Technology"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Course / Stream
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
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
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
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
                    placeholder="Short summary about your academic journey..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                  />
                </div>

                {/* Learning Interests - Chip Selector */}
                <ChipSelector
                  label="Learning Interests"
                  description={`Recommended topics for ${education}.`}
                  options={interestOptions}
                  selectedValues={selectedInterests}
                  onChange={setSelectedInterests}
                  customPlaceholder="Add custom interest..."
                />

                {/* Learning Goals - Chip Selector */}
                <ChipSelector
                  label="Learning Goals"
                  description="Select your academic objectives."
                  options={STUDENT_GOAL_OPTIONS}
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
                    { label: 'Course Updates', description: 'New lessons and course announcements' },
                    { label: 'Assignments', description: 'New assignments and due date reminders' },
                    { label: 'Messages', description: 'New messages from teachers and peers' },
                    { label: 'Achievements', description: 'Badge and achievement notifications' },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={idx < 3}
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

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="size-5 text-primary" />
                  Language
                </h2>
                <select className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
                <h2 className="font-semibold text-destructive mb-2">Danger Zone</h2>
                <p className="text-xs text-muted-foreground mb-4">Permanently remove your account and all learning records.</p>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmText('')
                    setShowDeleteModal(true)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
                >
                  <LogOut className="size-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Delete Account?</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              This action is permanent and cannot be undone. All your personal profile information, course enrollments, learning progress, and bookmarks will be completely deleted.
            </p>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Type <span className="text-destructive font-bold">{fullName || currentUser?.full_name || 'Delete My Account'}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${fullName || currentUser?.full_name || 'Delete My Account'}"`}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 text-sm font-semibold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteAccountMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  confirmText.trim().toLowerCase() !== (fullName || currentUser?.full_name || 'Delete My Account').trim().toLowerCase() ||
                  deleteAccountMutation.isPending
                }
                className="px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {deleteAccountMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
