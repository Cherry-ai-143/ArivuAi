'use client';

import { useState } from 'react';
import { StudentsHeader } from '@/components/teacher/students/students-header';
import { StudentsFilters } from '@/components/teacher/students/students-filters';
import { StudentsList } from '@/components/teacher/students/students-list';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [course, setCourse] = useState('all');

  return (
    <div className="p-6 space-y-6">
      <StudentsHeader />
      <StudentsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        course={course}
        onCourseChange={setCourse}
      />
      <StudentsList search={search} status={status} course={course} />
    </div>
  );
}


