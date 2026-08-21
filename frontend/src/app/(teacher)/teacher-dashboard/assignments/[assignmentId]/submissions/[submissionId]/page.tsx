'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  FileText,
  Loader2,
  Send,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { assignmentApi } from '@/lib/api/assignments';
import { AIGradingAnalysisResponse, Submission } from '@/types/assignment';

export default function TeacherGradingSubmissionPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const submissionId = params.submissionId as string;
  const router = useRouter();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Grading form state
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});

  // AI Assistance state
  const [aiAnalysis, setAiAnalysis] = useState<AIGradingAnalysisResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Resubmission Modal
  const [resubmissionModalOpen, setResubmissionModalOpen] = useState(false);
  const [resubmissionReason, setResubmissionReason] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submissionId) {
      setIsLoading(true);
      assignmentApi
        .getSubmissionDetail(submissionId)
        .then((data) => {
          setSubmission(data);
          setScore(data.score ?? '');
          setFeedback(data.feedback ?? '');
          setRubricScores(data.rubric_scores || {});
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [submissionId]);

  if (isLoading || !submission) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 animate-pulse rounded-2xl" />
          <div className="h-96 bg-gray-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  const maxPoints = submission.assignment_max_points || 100;

  const handleRubricScoreChange = (criterionName: string, val: number) => {
    const updated = { ...rubricScores, [criterionName]: val };
    setRubricScores(updated);

    // Auto calculate total score
    const newTotal = Object.values(updated).reduce((acc, current) => acc + (current || 0), 0);
    setScore(Math.min(maxPoints, newTotal));
  };

  const handleAnalyzeAI = async () => {
    setIsAiLoading(true);
    setError(null);
    try {
      const res = await assignmentApi.analyzeSubmissionAI(submission.id);
      setAiAnalysis(res);
    } catch (e: any) {
      setError('AI Analysis failed. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAIGrade = () => {
    if (aiAnalysis) {
      setScore(aiAnalysis.suggested_score);
      setFeedback(aiAnalysis.suggested_feedback);
      if (aiAnalysis.rubric_breakdown) {
        setRubricScores(aiAnalysis.rubric_breakdown);
      }
    }
  };

  const handlePublishGrade = async () => {
    if (score === '' || Number(score) < 0) {
      setError('Please enter a valid score');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await assignmentApi.gradeSubmission(submission.id, {
        score: Number(score),
        feedback,
        rubric_scores: rubricScores,
      });
      router.push(`/teacher-dashboard/assignments/${assignmentId}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to publish grade.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestResubmission = async () => {
    if (!resubmissionReason.trim()) {
      setError('Please enter a reason for resubmission');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await assignmentApi.requestResubmission(submission.id, resubmissionReason);
      setResubmissionModalOpen(false);
      router.push(`/teacher-dashboard/assignments/${assignmentId}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to request resubmission.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/teacher-dashboard/assignments/${assignmentId}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review & Grade Submission</h1>
            <p className="text-xs text-gray-500">
              Assignment: <span className="font-semibold text-gray-700">{submission.assignment_title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setResubmissionModalOpen(true)}
            className="text-amber-700 border-amber-300 hover:bg-amber-50 gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Request Resubmission
          </Button>

          <Button
            onClick={handlePublishGrade}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" /> Publish Grade
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Details & Submitted Work (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info Banner */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
                {submission.student_name ? submission.student_name.charAt(0) : 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{submission.student_name}</h3>
                <p className="text-xs text-gray-500">{submission.student_email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    Submitted: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'N/A'}
                  </span>
                  {submission.is_late && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase border border-red-200">
                      Late Submission
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  submission.status === 'GRADED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {submission.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Submission Work Display */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Submitted Work
            </h3>

            {/* Text Response */}
            {submission.text_response ? (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Text Response
                </h4>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 whitespace-pre-line font-sans leading-relaxed">
                  {submission.text_response}
                </div>
              </div>
            ) : null}

            {/* External URL */}
            {submission.external_url ? (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  External URL / Repository
                </h4>
                <a
                  href={submission.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline bg-blue-50 px-4 py-2 rounded-xl border border-blue-200"
                >
                  <ExternalLink className="w-4 h-4" /> {submission.external_url}
                </a>
              </div>
            ) : null}

            {/* Attached Files */}
            {submission.file_ids && submission.file_ids.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Attached Files ({submission.file_ids.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {submission.file_ids.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {file.filename || file.title || `File #${idx + 1}`}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Uploaded file'}
                          </p>
                        </div>
                      </div>

                      {file.url ? (
                        <a
                          href={file.url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!submission.text_response && !submission.external_url && (!submission.file_ids || submission.file_ids.length === 0) && (
              <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl text-sm text-gray-500">
                No submission content attached.
              </div>
            )}
          </div>

          {/* AI Analysis Card */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-gray-900">AI Grading Analysis</h3>
                </div>
                <div className="text-sm font-bold text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full">
                  Suggested Score: {aiAnalysis.suggested_score} / {aiAnalysis.max_points}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    {aiAnalysis.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                    {aiAnalysis.areas_for_improvement.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                  Suggested Feedback
                </h4>
                <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-blue-100 leading-relaxed font-sans">
                  {aiAnalysis.suggested_feedback}
                </p>
              </div>

              <Button
                onClick={handleApplyAIGrade}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Use Suggested Grade & Feedback
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Teacher Grading Form (1 col) */}
        <div className="space-y-6">
          {/* Analyze with AI Action Card */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3 text-center">
            <Sparkles className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">AI Assistant Evaluation</h4>
            <p className="text-xs text-gray-500">
              Analyze student work against assignment criteria with Gemini AI.
            </p>
            <Button
              type="button"
              onClick={handleAnalyzeAI}
              disabled={isAiLoading}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-semibold gap-2"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze with AI
            </Button>
          </div>

          {/* Grading Input Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Grade & Feedback
            </h3>

            {/* Score Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Final Score (out of {maxPoints}) *
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={maxPoints}
                  value={score}
                  onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 85"
                  className="h-10 text-base font-bold w-32"
                />
                <span className="text-sm font-semibold text-gray-600">/ {maxPoints} pts</span>
              </div>
            </div>

            {/* Rubric Criteria breakdown if defined */}
            {submission.rubric_criteria && submission.rubric_criteria.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rubric Scoring
                </h4>
                {submission.rubric_criteria.map((r) => (
                  <div key={r.criterion_name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{r.criterion_name}</span>
                      <span>Max {r.max_points} pts</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={r.max_points}
                      value={rubricScores[r.criterion_name] ?? ''}
                      onChange={(e) =>
                        handleRubricScoreChange(r.criterion_name, Number(e.target.value))
                      }
                      className="h-8 text-xs"
                      placeholder={`0 - ${r.max_points}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Teacher Feedback Textarea */}
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Teacher Feedback
              </label>
              <Textarea
                value={feedback}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                placeholder="Write constructive feedback for the student..."
                rows={5}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resubmission Modal */}
      {resubmissionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Request Resubmission</h3>
            <p className="text-sm text-gray-600">
              Provide feedback explaining why the student must resubmit their assignment work.
            </p>
            <Textarea
              value={resubmissionReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResubmissionReason(e.target.value)}
              placeholder="e.g. Please fix exception handling and re-upload ZIP."
              rows={4}
              className="text-sm"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setResubmissionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequestResubmission}
                disabled={isSaving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
