"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Play,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  getAssessmentById,
  updateAssessmentStatus,
  duplicateAssessment,
} from "@/lib/services/assessment.service";
import type { Assessment } from "@/types/assessment";
import { apiClient } from "@/lib/api/axios";
import { ASSESSMENT_ATTEMPTS } from "@/lib/api/endpoints";
import { CreateAssessmentDialog } from "@/components/teacher/assessments/create-assessment-dialog";
import { QuestionPreviewModal } from "@/components/teacher/questions/question-preview-modal";

interface StudentAttemptRecord {
  id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  status: string;
  score: number;
  total_marks: number;
  percentage?: number;
  passed?: boolean;
  started_at: string;
  submitted_at?: string;
}

export default function TeacherAssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params?.id as string;
  const assessmentId = parseInt(idStr, 10);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<StudentAttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "results">("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);

  const loadData = async () => {
    if (isNaN(assessmentId)) return;
    try {
      setLoading(true);
      const data = await getAssessmentById(assessmentId);
      setAssessment(data);

      // Load student attempt records
      try {
        setLoadingAttempts(true);
        const res = await apiClient.get<StudentAttemptRecord[]>(
          `${ASSESSMENT_ATTEMPTS}/assessment/${assessmentId}`
        );
        setAttempts(res.data || []);
      } catch {
        setAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    } catch (err) {
      console.error("Failed to load assessment details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const handlePublish = async () => {
    if (!assessment) return;
    try {
      await updateAssessmentStatus(assessment.id, "PUBLISHED");
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to publish assessment.");
    }
  };

  const handleDuplicate = async () => {
    if (!assessment) return;
    try {
      const copy = await duplicateAssessment(assessment.id);
      router.push(`/teacher-dashboard/assessments/${copy.id}`);
    } catch (err: any) {
      alert("Failed to duplicate assessment.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground min-h-[70vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs font-semibold">Loading assessment details...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center space-y-4 rounded-3xl border border-border bg-card shadow-md">
        <AlertCircle className="size-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Assessment Not Found</h3>
        <p className="text-xs text-muted-foreground">The requested assessment could not be located or was deleted.</p>
        <button
          onClick={() => router.push("/teacher-dashboard/assessments")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-md"
        >
          <ArrowLeft className="size-4" /> Back to Assessments
        </button>
      </div>
    );
  }

  const questionsList = assessment.assessment_questions || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/teacher-dashboard/assessments")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="size-3.5" /> Back to Assessments List
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                assessment.status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : assessment.status === "ARCHIVED"
                  ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              }`}
            >
              {assessment.status}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
              {assessment.assessment_type}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {assessment.scope} Scope
            </span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-foreground">{assessment.title}</h1>
          {assessment.description && (
            <p className="text-xs text-muted-foreground max-w-2xl">{assessment.description}</p>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {assessment.status === "DRAFT" && (
            <button
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <PlayCircle className="size-4" /> Publish
            </button>
          )}

          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            <Edit2 className="size-4" /> Edit
          </button>

          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            <Copy className="size-4" /> Duplicate
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard icon={<FileText className="size-4 text-primary" />} label="Questions" value={assessment.question_count || questionsList.length} />
        <MetricCard icon={<Trophy className="size-4 text-amber-500" />} label="Total Marks" value={`${assessment.total_marks} pts`} />
        <MetricCard icon={<Clock className="size-4 text-indigo-500" />} label="Duration" value={`${assessment.duration_minutes} min`} />
        <MetricCard icon={<Target className="size-4 text-emerald-500" />} label="Passing Score" value={`${assessment.passing_score}%`} />
        <MetricCard icon={<Users className="size-4 text-purple-500" />} label="Max Attempts" value={assessment.max_attempts} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {[
          { key: "overview", label: "Overview & Settings", icon: <BarChart3 className="size-4" /> },
          { key: "questions", label: `Questions (${questionsList.length})`, icon: <FileText className="size-4" /> },
          { key: "results", label: `Student Results (${attempts.length})`, icon: <Trophy className="size-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" /> Assessment Settings Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 rounded-2xl bg-muted/20 border border-border">
                  <p className="text-[11px] text-muted-foreground font-bold">Shuffle Questions</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{assessment.shuffle_questions ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="p-3 rounded-2xl bg-muted/20 border border-border">
                  <p className="text-[11px] text-muted-foreground font-bold">Shuffle Options</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{assessment.shuffle_options ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="p-3 rounded-2xl bg-muted/20 border border-border col-span-2">
                  <p className="text-[11px] text-muted-foreground font-bold">Show Correct Answers / Review</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {assessment.show_correct_answers ? "Exposed after submission" : "Never exposed to students"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Content Context</h3>
              <div className="text-xs space-y-2 font-semibold text-muted-foreground">
                <p>Course ID: <strong className="text-foreground">{assessment.course_id}</strong></p>
                {assessment.chapter_id && <p>Chapter ID: <strong className="text-foreground">{assessment.chapter_id}</strong></p>}
                {assessment.lesson_id && <p>Lesson ID: <strong className="text-foreground">{assessment.lesson_id}</strong></p>}
                <p>Created At: <strong className="text-foreground">{assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : "N/A"}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS LIST */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {questionsList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
              No questions are linked to this assessment.
            </div>
          ) : (
            questionsList.map((aq, idx) => {
              const q = (aq as any).question || aq;
              return (
                <div key={aq.id || idx} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">{q.question_type || "Question"}</span>
                    </div>

                    <span className="text-xs font-bold text-amber-500">{aq.marks || q.marks || 1} Marks</span>
                  </div>

                  <p className="text-sm font-bold text-foreground leading-relaxed">{q.question_text || `Question #${q.id || aq.question_id}`}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                    {[
                      { key: "A", text: q.option_a },
                      { key: "B", text: q.option_b },
                      { key: "C", text: q.option_c },
                      { key: "D", text: q.option_d },
                    ]
                      .filter((opt) => Boolean(opt.text))
                      .map((opt) => (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            opt.key === q.correct_option ? "border-emerald-500/50 bg-emerald-500/10 text-foreground" : "border-border bg-muted/20"
                          }`}
                        >
                          <span className={`size-5 rounded-md text-[10px] font-bold flex items-center justify-center ${opt.key === q.correct_option ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                            {opt.key}
                          </span>
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-xs space-y-1">
                      <p className="font-bold text-accent flex items-center gap-1"><HelpCircle className="size-3.5" /> Explanation</p>
                      <p className="text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: STUDENT RESULTS */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {loadingAttempts ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs font-semibold">Loading student assessment attempts...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground space-y-2">
              <Trophy className="size-10 text-muted-foreground mx-auto opacity-40" />
              <p className="font-bold text-foreground">No Student Attempts Recorded</p>
              <p>No student has submitted an attempt for this assessment yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                  <tr>
                    <th className="p-3">Attempt ID</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Result Status</th>
                    <th className="p-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {attempts.map((att) => {
                    const isPassed = att.score >= (assessment.passing_score / 100) * assessment.total_marks;
                    const pct = att.percentage ?? Math.round((att.score / (att.total_marks || assessment.total_marks || 1)) * 100);

                    return (
                      <tr key={att.id} className="hover:bg-muted/30 transition-colors font-semibold">
                        <td className="p-3 font-mono">#{att.id}</td>
                        <td className="p-3">Student #{att.student_id}</td>
                        <td className="p-3 font-bold text-foreground">{att.score} / {att.total_marks || assessment.total_marks}</td>
                        <td className="p-3 font-bold text-primary">{pct}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isPassed ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                            }`}
                          >
                            {isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : "In Progress"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {isEditOpen && (
        <CreateAssessmentDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initialCourseId={assessment.course_id}
          initialChapterId={assessment.chapter_id}
          initialLessonId={assessment.lesson_id}
          initialSelectedQuestionIds={questionsList.map((aq) => aq.question_id || aq.id)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
