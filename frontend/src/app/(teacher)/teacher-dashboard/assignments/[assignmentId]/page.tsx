'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Users, CheckCircle2, AlertCircle, FileCheck, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { assignmentApi } from '@/lib/api/assignments';
import { Assignment, Submission } from '@/types/assignment';

export default function TeacherAssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (assignmentId) {
      setIsLoading(true);
      Promise.all([
        assignmentApi.getDetail(assignmentId),
        assignmentApi.listSubmissions(assignmentId),
      ])
        .then(([detailData, subsData]) => {
          setAssignment(detailData);
          setSubmissions(subsData);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [assignmentId]);

  if (isLoading || !assignment) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-1/4" />
        <div className="h-40 bg-gray-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const nameMatch = (s.student_name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (s.student_email || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        matchesStatus = ['SUBMITTED', 'UNDER_REVIEW', 'LATE'].includes(s.status);
      } else if (statusFilter === 'graded') {
        matchesStatus = s.status === 'GRADED';
      } else if (statusFilter === 'late') {
        matchesStatus = s.is_late;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const submittedCount = submissions.filter((s) => s.status !== 'DRAFT').length;
  const gradedCount = submissions.filter((s) => s.status === 'GRADED').length;
  const pendingCount = submissions.filter((s) => ['SUBMITTED', 'UNDER_REVIEW', 'LATE'].includes(s.status)).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/teacher-dashboard/assignments">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 uppercase">
                {assignment.assignment_type}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Course: <span className="font-semibold text-gray-700">{assignment.course_title}</span>
            </p>
          </div>
        </div>

        <Link href={`/teacher-dashboard/assignments/create?id=${assignment.id}`}>
          <Button variant="outline" className="gap-2 border-gray-300">
            <Edit3 className="w-4 h-4" /> Edit Assignment
          </Button>
        </Link>
      </div>

      {/* Assignment Overview Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</p>
            <p className="text-base font-bold text-gray-900 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" />
              {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'No deadline'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Points</p>
            <p className="text-base font-bold text-gray-900 mt-1">{assignment.max_points} Points</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</p>
            <p className="text-base font-bold text-gray-900 mt-1">{assignment.difficulty}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
            <p className="text-base font-bold text-emerald-600 mt-1">{assignment.status}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Instructions
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-xs">
            {assignment.instructions}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Submissions Received</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{submittedCount}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-amber-600 uppercase tracking-wider font-medium">Pending Review</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium">Graded</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{gradedCount}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-indigo-600 uppercase tracking-wider font-medium">Average Score</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">
            {assignment.average_score != null ? `${assignment.average_score}%` : '-'}
          </h3>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Student Submissions</h3>

          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name..."
              className="h-9 text-sm w-56"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-xs font-semibold"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending Review</option>
              <option value="graded">Graded</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
            No submissions found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs uppercase font-semibold text-gray-600 tracking-wider">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    {/* Student */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{sub.student_name}</div>
                      <div className="text-xs text-gray-500">{sub.student_email}</div>
                    </td>

                    {/* Submission Date */}
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : 'Draft saved'}
                      {sub.is_late && (
                        <span className="ml-2 text-red-600 font-bold text-[10px] uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          Late
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub.status === 'GRADED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'RESUBMISSION_REQUIRED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                      {sub.score != null ? `${sub.score} / ${assignment.max_points}` : '-'}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/teacher-dashboard/assignments/${assignment.id}/submissions/${sub.id}`}
                      >
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                          Review & Grade
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
