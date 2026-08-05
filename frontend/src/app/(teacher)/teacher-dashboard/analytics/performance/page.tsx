'use client';

import { AnalyticsHeader } from '@/components/teacher/analytics/analytics-header';
import { AnalyticsStats } from '@/components/teacher/analytics/analytics-stats';
import { CoursePerformanceChart } from '@/components/teacher/analytics/course-performance-chart';
import { StudentEngagementChart } from '@/components/teacher/analytics/student-engagement-chart';
import { TimeSeriesChart } from '@/components/teacher/analytics/time-series-chart';

export default function PerformancePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Performance Analytics</h1>
        <p className="text-muted-foreground">Detailed performance metrics and student engagement analysis</p>
      </div>
      <AnalyticsStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoursePerformanceChart />
        <StudentEngagementChart />
      </div>

      <TimeSeriesChart />
    </div>
  );
}


