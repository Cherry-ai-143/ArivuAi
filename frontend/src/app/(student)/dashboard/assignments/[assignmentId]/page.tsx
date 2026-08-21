'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Send,
  Save,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { assignmentApi } from '@/lib/api/assignments';
import apiClient from '@/lib/api/axios';
import { UPLOADS } from '@/lib/api/endpoints';
import { Assignment, Submission, SubmissionFile } from '@/types/assignment';

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const router = useRouter();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [textResponse, setTextResponse] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<SubmissionFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Confirmation Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentId) {
      setIsLoading(true);
      assignmentApi
        .getDetail(assignmentId)
        .then((data: any) => {
          setAssignment(data);
          if (data.my_submission) {
            setSubmission(data.my_submission);
            setTextResponse(data.my_submission.text_response || '');
            setExternalUrl(data.my_submission.external_url || '');
            setUploadedFiles(data.my_submission.file_ids || []);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [assignmentId]);

  if (isLoading || !assignment) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-1/4" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const subConfig = assignment.submission_config || {};
  const allowedMethods = subConfig.allowed_methods || ['text', 'file'];
  const isLocked =
    submission &&
    ['SUBMITTED', 'UNDER_REVIEW', 'GRADED'].includes(submission.status);
  const isResubmit = submission?.status === 'RESUBMISSION_REQUIRED';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileToUpload = files[0];
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('title', fileToUpload.name);

      const res = await apiClient.post(UPLOADS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newFile: SubmissionFile = {
        id: res.data.id,
        filename: fileToUpload.name,
        url: res.data.file_url,
        file_size: fileToUpload.size,
      };

      setUploadedFiles([...uploadedFiles, newFile]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await assignmentApi.submitAssignment(assignment.id, {
        text_response: textResponse,
        external_url: externalUrl,
        file_ids: uploadedFiles,
        is_draft: true,
      });
      setSubmission(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await assignmentApi.submitAssignment(assignment.id, {
        text_response: textResponse,
        external_url: externalUrl,
        file_ids: uploadedFiles,
        is_draft: false,
      });
      setSubmission(res);
      setSubmitModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/assignments">
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

        {submission?.status === 'GRADED' && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold">
            <Award className="w-5 h-5 text-emerald-600" />
            Score: {submission.score} / {assignment.max_points}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Resubmission Alert Banner */}
      {isResubmit && (
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <RotateCcw className="w-5 h-5" /> Resubmission Required by Teacher
          </div>
          <p className="text-xs text-red-700 font-medium">
            Reason: {submission?.resubmission_reason || 'Please revise your submission.'}
          </p>
        </div>
      )}

      {/* GRADED RESULTS SECTION (if graded) */}
      {submission?.status === 'GRADED' && (
        <div className="bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/20 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Grade & Feedback Published
            </h3>
            <span className="text-xs text-gray-500">
              Graded on: {submission.graded_at ? new Date(submission.graded_at).toLocaleString() : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
              <p className="text-xs text-gray-500 uppercase font-semibold">Your Score</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                {submission.score} <span className="text-base text-gray-500 font-normal">/ {assignment.max_points}</span>
              </h3>
            </div>

            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
              <p className="text-xs text-gray-500 uppercase font-semibold">Teacher Feedback</p>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed font-sans">
                {submission.feedback || 'No written feedback provided.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Overview & Instructions */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Due Date: {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'No deadline'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 text-sm">{assignment.max_points} Max Points</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold uppercase">
              {assignment.difficulty}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{assignment.description}</p>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Instructions</h3>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-line leading-relaxed">
            {assignment.instructions}
          </div>
        </div>
      </div>

      {/* Submission Requirements Info */}
      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200/70 text-xs text-blue-900 space-y-1">
        <h4 className="font-bold text-sm text-blue-950">Submission Requirements</h4>
        <p>
          Allowed Formats:{' '}
          <span className="font-semibold">{allowedMethods.join(', ').toUpperCase()}</span>
        </p>
        {subConfig.allowed_file_types && (
          <p>
            Accepted Files:{' '}
            <span className="font-semibold">
              {subConfig.allowed_file_types.map((t) => `.${t}`).join(', ')}
            </span>
          </p>
        )}
      </div>

      {/* STUDENT SUBMISSION WORKSPACE */}
      {(!isLocked || isResubmit) ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Your Submission Workspace
          </h3>

          {/* Text Response Area */}
          {allowedMethods.includes('text') && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Written Response
              </label>
              <Textarea
                value={textResponse}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextResponse(e.target.value)}
                placeholder="Type your complete solution or response here..."
                rows={6}
                className="text-sm"
              />

            </div>
          )}

          {/* External URL Area */}
          {allowedMethods.includes('url') && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                External Link / Repository URL
              </label>
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="h-10 text-sm"
              />
            </div>
          )}

          {/* File Upload Area */}
          {allowedMethods.includes('file') && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Attach Files
              </label>

              <div className="border-2 border-dashed border-gray-200 p-6 rounded-xl text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">
                  {isUploading ? 'Uploading file...' : 'Click or Drag & Drop files here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max file size: {subConfig.max_file_size_mb || 25} MB
                </p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <span className="text-xs font-semibold text-gray-900">{file.filename}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(idx)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workspace Action CTAs */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="gap-2 border-gray-300"
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>

            <Button
              onClick={() => setSubmitModalOpen(true)}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" /> Submit Assignment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <CheckCircle2 className="w-5 h-5 text-blue-600" /> Submitted Workspace (Read-only)
          </div>
          {submission?.text_response && (
            <p className="text-xs text-gray-700 p-4 rounded-xl bg-gray-50 border border-gray-200 whitespace-pre-line font-sans">
              {submission.text_response}
            </p>
          )}
          {submission?.external_url && (
            <a
              href={submission.external_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
            >
              <ExternalLink className="w-4 h-4" /> {submission.external_url}
            </a>
          )}
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Submit Assignment?</h3>
            <p className="text-sm text-gray-600">
              You will not be able to edit your submission after submitting unless your teacher requests a resubmission.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Submission'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
