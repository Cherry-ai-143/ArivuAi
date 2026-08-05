'use client'

import { TeacherTopStats } from '@/components/teacher/teacher-top-stats'
import { StudentPerformanceOverview } from '@/components/teacher/student-performance-overview'
import { CourseOverview } from '@/components/teacher/course-overview'
import { UpcomingActivities } from '@/components/teacher/upcoming-activities'
import { RecentCourses } from '@/components/teacher/recent-courses'
import { AIAssistantWidget } from '@/components/teacher/ai-assistant-widget'
import { RecentAssessments } from '@/components/teacher/recent-assessments'
import { TopPerformingStudents } from '@/components/teacher/top-performing-students'
import { TeacherOnboardingWizard } from '@/components/teacher/teacher-onboarding-wizard'
import { ProfileCompletionWidget } from '@/components/student/profile-completion-widget'

export default function TeacherDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* First Login Teacher Onboarding Modal */}
      <TeacherOnboardingWizard />

      {/* Profile Completion Indicator */}
      <ProfileCompletionWidget />

      {/* Row 1: Top Statistics - Full Width */}
      <div>
        <TeacherTopStats />
      </div>

      {/* Row 2: Analytics Charts - Equal Height */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Student Performance Overview */}
        <StudentPerformanceOverview />

        {/* Course Overview */}
        <CourseOverview />
      </div>

      {/* Row 3: Recent Assessments & AI Assistant - Equal Height */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Assessments */}
        <RecentAssessments />

        {/* AI Assistant */}
        <AIAssistantWidget />
      </div>

      {/* Row 4: Top Students & Upcoming Activities - Equal Height */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Top Performing Students */}
        <TopPerformingStudents />

        {/* Upcoming Activities */}
        <UpcomingActivities />
      </div>

      {/* Row 5: Recent Courses - Full Width */}
      <div>
        <RecentCourses />
      </div>
    </div>
  )
}
