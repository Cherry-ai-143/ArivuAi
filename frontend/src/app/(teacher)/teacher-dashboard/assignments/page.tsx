'use client';

import { useEffect, useState } from 'react';
import { AssignmentsHeader } from '@/components/teacher/assignments/assignments-header';
import { AssignmentsStats } from '@/components/teacher/assignments/assignments-stats';
import { AssignmentsFilters } from '@/components/teacher/assignments/assignments-filters';
import { AssignmentsList } from '@/components/teacher/assignments/assignments-list';
import { AIAssignmentGeneratorDialog } from '@/components/teacher/assignments/ai-assignment-generator-dialog';
import { assignmentApi } from '@/lib/api/assignments';
import apiClient from '@/lib/api/axios';
import { COURSES } from '@/lib/api/endpoints';
import { Assignment, AssignmentStats } from '@/types/assignment';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | undefined>();
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [courseId, setCourseId] = useState('all');
  const [assignmentType, setAssignmentType] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentApi.list({
        status: status !== 'all' ? status : undefined,
        course_id: courseId !== 'all' ? Number(courseId) : undefined,
        assignment_type: assignmentType !== 'all' ? assignmentType : undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        search: search.trim() ? search : undefined,
      });
      setAssignments(data);

      const statsData = await assignmentApi.getStats();
      setStats(statsData);
    } catch (e) {
      console.error('Failed to fetch assignments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [status, courseId, assignmentType, difficulty, search]);

  useEffect(() => {
    apiClient.get(COURSES).then((res) => {
      setCourses(res.data);
    }).catch(() => {});
  }, []);

  const handlePublish = async (id: number) => {
    try {
      await assignmentApi.publish(id);
      fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await assignmentApi.duplicate(id);
      fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assignmentApi.delete(id);
      fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <AssignmentsHeader onAIGenerateClick={() => setAiDialogOpen(true)} />

      <AssignmentsStats stats={stats} isLoading={isLoading} />

      <AssignmentsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        courseId={courseId}
        onCourseChange={setCourseId}
        assignmentType={assignmentType}
        onAssignmentTypeChange={setAssignmentType}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        courses={courses}
      />

      <AssignmentsList
        assignments={assignments}
        isLoading={isLoading}
        onPublish={handlePublish}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      <AIAssignmentGeneratorDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        courses={courses}
      />
    </div>
  );
}
