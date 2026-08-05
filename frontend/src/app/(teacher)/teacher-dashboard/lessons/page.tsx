'use client';

import { useState } from 'react';
import { LessonHeader } from '@/components/teacher/lessons/lesson-header';
import { LessonFilters } from '@/components/teacher/lessons/lesson-filters';
import { LessonGrid } from '@/components/teacher/lessons/lesson-grid';
import { CreateLessonDialog } from '@/components/teacher/lessons/create-lesson-dialog';

export default function LessonsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <LessonHeader onCreateClick={() => setDialogOpen(true)} />
      <LessonFilters
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        view={view}
        onViewChange={setView}
      />
      <LessonGrid view={view} search={search} filter={filter} />
      <CreateLessonDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}


