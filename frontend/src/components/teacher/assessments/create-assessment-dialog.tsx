"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  Save,
  Search,
  Send,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchQuestions } from "@/lib/services/question.service";
import { getCourses } from "@/lib/services/course.service";
import { getChaptersByCourse } from "@/lib/services/chapter.service";
import { getLessonsByChapter } from "@/lib/services/lesson.service";
import { createAssessment } from "@/lib/services/assessment.service";
import type {
  AssessmentCreateRequest,
  AssessmentScope,
  AssessmentStatus,
  AssessmentType,
} from "@/types/assessment";
import type { Question } from "@/types/question";
import type { Course } from "@/types/course";
import type { Chapter } from "@/types/chapter";
import type { Lesson } from "@/types/lesson";
import { QuestionPreviewModal } from "@/components/teacher/questions/question-preview-modal";
import { AiQuizGeneratorModal } from "@/components/teacher/quizzes/ai-quiz-generator-modal";

interface CreateAssessmentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onCreated?: () => void;
  initialSelectedQuestionIds?: number[];
  initialCourseId?: number | null;
  initialChapterId?: number | null;
  initialLessonId?: number | null;
}

const STEPS = ["Details", "Select Questions", "Settings", "Review & Publish"];

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: "QUIZ", label: "Quiz" },
  { value: "PRACTICE", label: "Practice Test" },
  { value: "CHAPTER_TEST", label: "Chapter Test" },
  { value: "MIDTERM", label: "Midterm" },
  { value: "FINAL", label: "Final Exam" },
];

const ASSESSMENT_SCOPES: { value: AssessmentScope; label: string }[] = [
  { value: "LESSON", label: "Lesson Scope" },
  { value: "CHAPTER", label: "Chapter Scope" },
  { value: "COURSE", label: "Course Scope" },
];

export function CreateAssessmentDialog({
  open = false,
  onOpenChange,
  isOpen,
  onClose,
  onCreated,
  initialSelectedQuestionIds,
  initialCourseId,
  initialChapterId,
  initialLessonId,
}: CreateAssessmentDialogProps) {
  const isActuallyOpen = isOpen ?? open;
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 - Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("QUIZ");
  const [scope, setScope] = useState<AssessmentScope>("LESSON");
  const [courseId, setCourseId] = useState<number | "">("");
  const [chapterId, setChapterId] = useState<number | "">("");
  const [lessonId, setLessonId] = useState<number | "">("");

  // Step 2 - Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [qSearch, setQSearch] = useState("");
  const [qDifficulty, setQDifficulty] = useState("");
  const [qType, setQType] = useState("");
  const [qBloom, setQBloom] = useState("");
  const [qSource, setQSource] = useState("");
  const [qLessonId, setQLessonId] = useState<number | "">("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Step 3 - Settings
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [passingScore, setPassingScore] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [answerReview, setAnswerReview] = useState<"IMMEDIATELY" | "AFTER_CLOSE" | "NEVER">("IMMEDIATELY");

  // Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Load courses & sync initial props on mount/open
  useEffect(() => {
    if (isActuallyOpen) {
      getCourses()
        .then((data) => setCourses(data.items ?? []))
        .catch(() => setCourses([]));

      if (initialSelectedQuestionIds && initialSelectedQuestionIds.length > 0) {
        setSelectedQuestionIds(initialSelectedQuestionIds);
      }
      if (initialCourseId) setCourseId(initialCourseId);
      if (initialChapterId) setChapterId(initialChapterId);
      if (initialLessonId) setLessonId(initialLessonId);
    }
  }, [isActuallyOpen, initialSelectedQuestionIds, initialCourseId, initialChapterId, initialLessonId]);

  // Load chapters when course changes
  useEffect(() => {
    if (courseId) {
      getChaptersByCourse(Number(courseId))
        .then((data: Chapter[]) => setChapters(data))
        .catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
  }, [courseId]);

  // Load lessons when chapter changes
  useEffect(() => {
    if (chapterId) {
      getLessonsByChapter(Number(chapterId))
        .then((data) => setLessons(data.items ?? []))
        .catch(() => setLessons([]));
    } else {
      setLessons([]);
    }
  }, [chapterId]);

  // Load questions for picker
  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await searchQuestions({
        q: qSearch || undefined,
        course_id: courseId ? Number(courseId) : undefined,
        chapter_id: chapterId ? Number(chapterId) : undefined,
        lesson_id: qLessonId ? Number(qLessonId) : lessonId ? Number(lessonId) : undefined,
        difficulty: qDifficulty || undefined,
        type: qType || undefined,
        bloom_level: qBloom || undefined,
        source: qSource || undefined,
        status: "Approved",
        page: 1,
        page_size: 100,
      });
      setQuestions(res.items || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      loadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, qSearch, qDifficulty, qType, qBloom, qSource, qLessonId, courseId, chapterId, lessonId]);

  const toggleQuestion = (id: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const moveQuestionUp = (index: number) => {
    if (index <= 0) return;
    setSelectedQuestionIds((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveQuestionDown = (index: number) => {
    setSelectedQuestionIds((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Selected questions lookup for calculation
  const selectedQuestionsList = useMemo(() => {
    const map = new Map<number, Question>();
    questions.forEach((q) => map.set(q.id, q));
    return selectedQuestionIds
      .map((id) => map.get(id))
      .filter((q): q is Question => q !== undefined);
  }, [selectedQuestionIds, questions]);

  const totalMarks = useMemo(() => {
    return selectedQuestionsList.reduce((sum, q) => sum + (q.marks || 1), 0);
  }, [selectedQuestionsList]);

  // Distributions
  const difficultyDist = useMemo(() => {
    const dist = { Easy: 0, Medium: 0, Hard: 0 };
    selectedQuestionsList.forEach((q) => {
      const diff = (q.difficulty || "Medium") as keyof typeof dist;
      if (dist[diff] !== undefined) dist[diff]++;
      else dist["Medium"]++;
    });
    return dist;
  }, [selectedQuestionsList]);

  const bloomDist = useMemo(() => {
    const dist: Record<string, number> = {};
    selectedQuestionsList.forEach((q) => {
      const level = q.bloom_level || "Understanding";
      dist[level] = (dist[level] || 0) + 1;
    });
    return dist;
  }, [selectedQuestionsList]);

  const typeDist = useMemo(() => {
    const dist: Record<string, number> = {};
    selectedQuestionsList.forEach((q) => {
      const type = q.type || "Multiple Choice";
      dist[type] = (dist[type] || 0) + 1;
    });
    return dist;
  }, [selectedQuestionsList]);

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setAssessmentType("QUIZ");
    setScope("LESSON");
    setCourseId("");
    setChapterId("");
    setLessonId("");
    setSelectedQuestionIds([]);
    setQSearch("");
    setDurationMinutes(20);
    setPassingScore(60);
    setMaxAttempts(3);
    setShuffleQuestions(true);
    setShuffleOptions(true);
    setAnswerReview("IMMEDIATELY");
  };

  const buildPayload = (status: AssessmentStatus): AssessmentCreateRequest => ({
    title,
    description: description || null,
    assessment_type: assessmentType,
    scope,
    status,
    course_id: Number(courseId),
    chapter_id: chapterId ? Number(chapterId) : null,
    lesson_id: lessonId ? Number(lessonId) : null,
    duration_minutes: durationMinutes,
    passing_score: passingScore,
    max_attempts: maxAttempts,
    shuffle_questions: shuffleQuestions,
    shuffle_options: shuffleOptions,
    show_correct_answers: answerReview !== "NEVER",
    question_ids: selectedQuestionIds,
  });

  const handleSubmit = async (status: AssessmentStatus) => {
    if (!title.trim() || !courseId) return;
    if (status === "PUBLISHED" && selectedQuestionIds.length === 0) {
      alert("Cannot publish an assessment with zero questions.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(status);
      await createAssessment(payload);
      onCreated?.();
      resetForm();
      handleClose();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to save assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      if (!title.trim() || !courseId) return false;
      if (scope === "LESSON" && (!chapterId || !lessonId)) return false;
      if (scope === "CHAPTER" && !chapterId) return false;
      return true;
    }
    if (step === 2) return selectedQuestionIds.length > 0;
    if (step === 3) return durationMinutes > 0 && passingScore >= 0 && passingScore <= 100 && maxAttempts >= 1;
    return true;
  };

  const selectedCourseObj = courses.find((c) => c.id === Number(courseId));
  const selectedChapterObj = chapters.find((ch) => ch.id === Number(chapterId));
  const selectedLessonObj = lessons.find((l) => l.id === Number(lessonId));

  return (
    <>
      <Dialog open={isActuallyOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif font-bold text-foreground">
              Create & Configure Assessment
            </DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((label, idx) => {
              const s = idx + 1;
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      s <= step ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  <span className="text-xs font-semibold hidden sm:inline text-foreground">{label}</span>
                  {s < STEPS.length && (
                    <div className={`h-1 flex-1 rounded ${s < step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* STEP 1 — DETAILS */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                  Assessment Title *
                </label>
                <Input
                  placeholder="e.g., Quadratic Equations — Chapter Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                    Assessment Type *
                  </label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30"
                  >
                    {ASSESSMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                    Scope *
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as AssessmentScope)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30"
                  >
                    {ASSESSMENT_SCOPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                  Target Course *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value ? Number(e.target.value) : "");
                    setChapterId("");
                    setLessonId("");
                  }}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select Course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Chapter {scope !== "COURSE" && "*"}</span>
                  </label>
                  <select
                    value={chapterId}
                    onChange={(e) => {
                      setChapterId(e.target.value ? Number(e.target.value) : "");
                      setLessonId("");
                    }}
                    disabled={!courseId}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    <option value="">All / Select Chapter...</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Lesson {scope === "LESSON" && "*"}</span>
                  </label>
                  <select
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value ? Number(e.target.value) : "")}
                    disabled={!chapterId}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    <option value="">All / Select Lesson...</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Provide instructions or background for students taking this assessment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-24 w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — SELECT QUESTIONS */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Available Questions: <strong className="text-foreground">{questions.length}</strong></p>
                  <p className="text-sm font-bold text-foreground">
                    Selected: <span className="text-primary">{selectedQuestionIds.length}</span> questions • Total Marks: <span className="text-amber-500 font-black">{totalMarks}</span>
                  </p>
                </div>

                <Button
                  onClick={() => setIsAiModalOpen(true)}
                  className="gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-sm"
                >
                  <Sparkles className="size-3.5" /> Generate Questions with AI
                </Button>
              </div>

              {/* Question Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    placeholder="Search Question Bank..."
                    className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs"
                  />
                </div>

                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
                >
                  <option value="">All Question Types</option>
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                  <option value="Fill in the Blanks">Fill in the Blanks</option>
                  <option value="Multiple Select">Multiple Select</option>
                </select>

                <select
                  value={qBloom}
                  onChange={(e) => setQBloom(e.target.value)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
                >
                  <option value="">All Bloom Levels</option>
                  <option value="Knowledge">Knowledge</option>
                  <option value="Understanding">Understanding</option>
                  <option value="Application">Application</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Evaluation">Evaluation</option>
                  <option value="Creation">Creation</option>
                </select>

                <select
                  value={qSource}
                  onChange={(e) => setQSource(e.target.value)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
                >
                  <option value="">All Sources</option>
                  <option value="Manual">Manual</option>
                  <option value="AI Generated">AI Generated</option>
                </select>
              </div>

              {/* Two Column Layout: Picker Left, Selected Sticky Panel Right */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[380px]">
                {/* Left Column: Question Bank list */}
                <div className="md:col-span-2 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {loadingQuestions ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <p className="text-xs font-semibold">Fetching eligible Question Bank questions...</p>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                      <FileText className="size-8 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-xs font-semibold text-foreground">No approved questions found</p>
                      <p className="text-[11px] text-muted-foreground">Try adjusting filters or generate questions using AI.</p>
                    </div>
                  ) : (
                    questions.map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                            isSelected ? "border-primary bg-primary/5 shadow-xs" : "border-border bg-card hover:bg-muted/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleQuestion(q.id)}
                            className="mt-1 size-4 rounded border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground line-clamp-2">{q.question_text}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                {q.type || "Multiple Choice"}
                              </span>
                              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                {q.marks || 1} mark
                              </span>
                              {q.difficulty && (
                                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                  {q.difficulty}
                                </span>
                              )}
                              {q.bloom_level && (
                                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                                  {q.bloom_level}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Preview Question"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Sticky Panel: Selected Questions List */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between max-h-[420px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Selected Questions</h4>
                      <span className="text-xs font-bold text-primary">{selectedQuestionIds.length}</span>
                    </div>

                    <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {selectedQuestionIds.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-10">Select questions from the left list.</p>
                      ) : (
                        selectedQuestionIds.map((qId, idx) => {
                          const qObj = questions.find((q) => q.id === qId);
                          return (
                            <div key={qId} className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border bg-muted/20 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="size-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-semibold text-foreground truncate max-w-[110px]">
                                  {qObj?.question_text || `Question #${qId}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-muted-foreground mr-1">{qObj?.marks || 1}pt</span>
                                <button
                                  onClick={() => moveQuestionUp(idx)}
                                  disabled={idx === 0}
                                  className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                                >
                                  <ArrowUp className="size-3" />
                                </button>
                                <button
                                  onClick={() => moveQuestionDown(idx)}
                                  disabled={idx === selectedQuestionIds.length - 1}
                                  className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                                >
                                  <ArrowDown className="size-3" />
                                </button>
                                <button
                                  onClick={() => toggleQuestion(qId)}
                                  className="p-1 rounded hover:bg-rose-500/10 text-rose-600"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-bold">
                    <span>Total Marks:</span>
                    <span className="text-primary text-sm">{totalMarks} Marks</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — SETTINGS & QUALITY DISTRIBUTIONS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                    Duration (Minutes) *
                  </label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                    Passing Score (%) *
                  </label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                    Max Attempts *
                  </label>
                  <Input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToggleRow label="Shuffle Questions Order" value={shuffleQuestions} onChange={setShuffleQuestions} />
                <ToggleRow label="Shuffle Options Order" value={shuffleOptions} onChange={setShuffleOptions} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground uppercase tracking-wider">
                  Answer Review Setting
                </label>
                <select
                  value={answerReview}
                  onChange={(e) => setAnswerReview(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/30"
                >
                  <option value="IMMEDIATELY">Immediately after submission</option>
                  <option value="AFTER_CLOSE">After assessment closes</option>
                  <option value="NEVER">Never expose correct answers</option>
                </select>
              </div>

              {/* Assessment Quality Summary Cards */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <BarChart3 className="size-4 text-primary" /> Assessment Quality Summary
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Difficulty Distribution */}
                  <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Difficulty Distribution</p>
                    <div className="text-xs font-semibold space-y-1 pt-1">
                      <div className="flex justify-between"><span>Easy:</span> <strong className="text-emerald-600">{difficultyDist.Easy}</strong></div>
                      <div className="flex justify-between"><span>Medium:</span> <strong className="text-amber-600">{difficultyDist.Medium}</strong></div>
                      <div className="flex justify-between"><span>Hard:</span> <strong className="text-rose-600">{difficultyDist.Hard}</strong></div>
                    </div>
                  </div>

                  {/* Question Type Distribution */}
                  <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Question Types</p>
                    <div className="text-xs font-semibold space-y-1 pt-1">
                      {Object.entries(typeDist).map(([t, count]) => (
                        <div key={t} className="flex justify-between">
                          <span className="truncate max-w-[100px]">{t}:</span>
                          <strong className="text-primary">{count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bloom's Level Distribution */}
                  <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Bloom's Taxonomy</p>
                    <div className="text-xs font-semibold space-y-1 pt-1">
                      {Object.entries(bloomDist).map(([b, count]) => (
                        <div key={b} className="flex justify-between">
                          <span className="truncate max-w-[100px]">{b}:</span>
                          <strong className="text-violet-600">{count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — REVIEW & PUBLISH */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 to-indigo-500/10 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    {assessmentType} • {scope} Scope
                  </span>
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-primary hover:underline">
                    Edit Details
                  </button>
                </div>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{description || "No description specified."}</p>
                <p className="text-xs font-semibold text-muted-foreground pt-1">
                  Course: <strong className="text-foreground">{selectedCourseObj?.title}</strong>
                  {selectedChapterObj && <> • Chapter: <strong className="text-foreground">{selectedChapterObj.title}</strong></>}
                  {selectedLessonObj && <> • Lesson: <strong className="text-foreground">{selectedLessonObj.title}</strong></>}
                </p>
              </div>

              {/* Config Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ReviewItem label="Total Questions" value={`${selectedQuestionIds.length} Questions`} />
                <ReviewItem label="Total Marks" value={`${totalMarks} Marks`} />
                <ReviewItem label="Duration" value={`${durationMinutes} Minutes`} />
                <ReviewItem label="Passing Score" value={`${passingScore}% Pass`} />
              </div>

              {/* Jump Edit Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    Edit Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    Edit Questions
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1 rounded-xl"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  disabled={!canProceed()}
                  className="gap-1 rounded-xl"
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit("DRAFT")}
                    disabled={submitting}
                    className="gap-1 rounded-xl"
                  >
                    <Save className="size-4" /> Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit("PUBLISHED")}
                    disabled={submitting}
                    className="gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Publish Assessment
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
      />

      {isAiModalOpen && (
        <AiQuizGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          lessonId={Number(lessonId) || (lessons[0]?.id ? Number(lessons[0].id) : 1)}
          onSuccess={() => {
            loadQuestions();
          }}
        />
      )}
    </>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            value ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            !value ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}