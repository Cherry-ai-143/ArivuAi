'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { assignmentApi } from '@/lib/api/assignments';
import apiClient from '@/lib/api/axios';
import { COURSES } from '@/lib/api/endpoints';
import { Assignment } from '@/types/assignment';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusTab, setStatusTab] = useState('all'); // all, to_do, submitted, graded, overdue
  const [courseFilter, setCourseFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchStudentAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentApi.list({
        status: statusTab !== 'all' ? statusTab : undefined,
        course_id: courseFilter !== 'all' ? Number(courseFilter) : undefined,
        search: search.trim() ? search : undefined,
      });
      setAssignments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAssignments();
  }, [statusTab, courseFilter, search]);

  useEffect(() => {
    apiClient
      .get(COURSES)
      .then((res) => setCourses(res.data))
      .catch(() => {});
  }, []);

  // Compute stats
  const toDoCount = assignments.filter((a) =>
    ['NOT_STARTED', 'DRAFT'].includes(a.status)
  ).length;
  const submittedCount = assignments.filter((a) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'LATE'].includes(a.status)
  ).length;
  const gradedCount = assignments.filter((a) => a.status === 'GRADED').length;
  const dueSoonCount = assignments.filter((a) => {
    if (!a.due_date) return false;
    const diff = Math.ceil((new Date(a.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3 && ['NOT_STARTED', 'DRAFT'].includes(a.status);
  }).length;

  const getDaysLeft = (dueDate?: string | null) => {
    if (!dueDate) return null;
    return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Graded
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'LATE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Submitted
          </span>
        );
      case 'RESUBMISSION_REQUIRED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            Resubmission Required
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Draft Saved
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            To Do
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete and submit coursework, view teacher feedback, and track your scores
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">To Do</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{toDoCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Soon</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-1">{dueSoonCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{submittedCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Graded</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{gradedCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All' },
              { key: 'to_do', label: 'To Do' },
              { key: 'submitted', label: 'Submitted' },
              { key: 'graded', label: 'Graded' },
              { key: 'overdue', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coursework..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Course Dropdown */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignment Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">You&apos;re all caught up!</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            No assignments match your selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((a) => {
            const daysLeft = getDaysLeft(a.due_date);
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

            return (
              <div
                key={a.id}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500 truncate flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      {a.course_title}
                    </span>
                    {getStatusBadge(a.status)}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {a.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {a.due_date ? (
                        <span
                          className={`font-semibold ${
                            isOverdue
                              ? 'text-red-600'
                              : isDueSoon
                              ? 'text-orange-600'
                              : 'text-gray-700'
                          }`}
                        >
                          Due {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>No deadline</span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{a.max_points} pts</span>
                  </div>

                  <Link href={`/dashboard/assignments/${a.id}`} className="block">
                    <Button className="w-full bg-gray-900 hover:bg-blue-600 text-white text-xs font-semibold gap-2 transition-colors">
                      View Assignment <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
