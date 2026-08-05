'use client'

import { TopStats } from '@/components/student/top-stats'
import { LearningProgress } from '@/components/student/learning-progress'
import { Calendar } from '@/components/student/calendar'
import { ContinueLearning } from '@/components/student/continue-learning'
import { PerformanceOverview } from '@/components/student/performance-overview'
import { SubjectPerformance } from '@/components/student/subject-performance'
import { StudyStreak } from '@/components/student/study-streak'
import { UpcomingAssessments } from '@/components/student/upcoming-assessments'
import { AIRecommendation } from '@/components/student/ai-recommendation'
import { OnboardingWizard } from '@/components/student/onboarding-wizard'
import { ProfileCompletionWidget } from '@/components/student/profile-completion-widget'

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Onboarding Wizard Modal */}
      <OnboardingWizard />

      {/* Profile Completion Bar */}
      <ProfileCompletionWidget />

      {/* Row 1: KPI Stats - Full Width */}
      <div>
        <TopStats />
      </div>

      {/* Row 2: Continue Learning - Full Width */}
      <div>
        <ContinueLearning />
      </div>
      
      {/* Row 3: Analytics - 2 Equal Columns */}
      <div className="grid gap-8 md:grid-cols-2">
        <LearningProgress />
        <PerformanceOverview />
      </div>

      {/* Row 4: Subject Mastery & Calendar - 2 Equal Columns */}
      <div className="grid gap-8 md:grid-cols-2">
        <SubjectPerformance />
        <Calendar />
      </div>

      {/* Row 5: Learning Streak - Full Width */}
      <div>
        <StudyStreak />
      </div>

      {/* Row 6: Assessments & AI Recommendation - 2 Equal Columns */}
      <div className="grid gap-8 md:grid-cols-2">
        <UpcomingAssessments />
        <AIRecommendation />
      </div>
    </div>
  )
}
