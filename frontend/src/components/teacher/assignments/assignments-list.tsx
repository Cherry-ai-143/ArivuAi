import { useState } from 'react';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';
import { Edit2, Trash2, Eye, Copy, Send, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssignmentsListProps {
  assignments?: Assignment[];
  isLoading?: boolean;
  onPublish?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onDelete?: (id: number) => void;
  search?: string;
  status?: string;
}

export function AssignmentsList({
  assignments = [],
  isLoading = false,
  onPublish = () => {},
  onDuplicate = () => {},
  onDelete = () => {},
}: AssignmentsListProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>;
      case 'PENDING_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;
      case 'DRAFT':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Draft</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const format = type.replace('_', ' ');
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 uppercase tracking-wider">
        {format}
      </span>
    );
  };

  const getDaysUntilDue = (dueDate?: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No assignments found</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
          Create your first assignment or generate one with AI to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-xs uppercase font-semibold text-gray-600 tracking-wider">
                <th className="px-6 py-3.5">Assignment</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Course</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5 text-center">Submissions</th>
                <th className="px-4 py-3.5 text-center">Avg Grade</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {assignments.map((a) => {
                const daysLeft = getDaysUntilDue(a.due_date);
                const isOverdue = daysLeft !== null && daysLeft < 0;

                return (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/teacher-dashboard/assignments/${a.id}`}
                        className="font-semibold text-gray-900 hover:text-orange-600 transition-colors block"
                      >
                        {a.title}
                      </Link>
                      {a.lesson_title && (
                        <span className="text-xs text-gray-500">{a.lesson_title}</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4">{getTypeBadge(a.assignment_type)}</td>

                    {/* Course */}
                    <td className="px-4 py-4 font-medium text-gray-700">
                      {a.course_title || 'Unassigned'}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-4">
                      {a.due_date ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(a.due_date).toLocaleDateString()}</span>
                          <span
                            className={`font-semibold ${
                              isOverdue ? 'text-red-600' : 'text-orange-600'
                            }`}
                          >
                            ({isOverdue ? 'Overdue' : `${daysLeft}d left`})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No deadline</span>
                      )}
                    </td>

                    {/* Submissions */}
                    <td className="px-4 py-4 text-center font-medium text-gray-700">
                      {a.total_submissions ?? 0}
                    </td>

                    {/* Avg Grade */}
                    <td className="px-4 py-4 text-center font-semibold text-gray-900">
                      {a.average_score != null ? `${a.average_score}%` : '-'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">{getStatusBadge(a.status)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/teacher-dashboard/assignments/${a.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {a.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPublish(a.id)}
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                            title="Publish Assignment"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}

                        <Link href={`/teacher-dashboard/assignments/create?id=${a.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-orange-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDuplicate(a.id)}
                          className="h-8 w-8 text-gray-600 hover:text-indigo-600"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(a.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Assignment?</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this assignment? This action cannot be undone and will remove all student submissions.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(deleteTargetId);
                  setDeleteTargetId(null);
                }}
              >
                Delete Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
