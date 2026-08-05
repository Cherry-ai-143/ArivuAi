'use client';

import { useState } from 'react';
import { AssignmentsHeader } from '@/components/teacher/assignments/assignments-header';
import { AssignmentsFilters } from '@/components/teacher/assignments/assignments-filters';
import { AssignmentsList } from '@/components/teacher/assignments/assignments-list';
import { CreateAssignmentDialog } from '@/components/teacher/assignments/create-assignment-dialog';

export default function QuizzesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Quizzes</h1>
        <p className="text-muted-foreground">Manage and track all your quizzes and assessments</p>
      </div>
      <AssignmentsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      <AssignmentsList search={search} status={status} />
      <CreateAssignmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}


