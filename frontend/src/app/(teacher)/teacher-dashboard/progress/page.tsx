'use client';

import { ProgressHeader } from '@/components/teacher/progress/progress-header';
import { ProgressFilters } from '@/components/teacher/progress/progress-filters';
import { ProgressGrid } from '@/components/teacher/progress/progress-grid';

export default function ProgressPage() {
  return (
    <div className="p-6 space-y-6">
      <ProgressHeader />
      <ProgressFilters />
      <ProgressGrid />
    </div>
  );
}


