"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Save,
  Search,
  Send,
  Sparkles,
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
  { value: "PRACTICE", label: "Practice" },
  { value: "CHAPTER_TEST", label: "Chapter Test" },
  { value: "MIDTERM", label: "Midterm" },
  { value: "FINAL", label: "Final" },
];

const ASSESSMENT_SCOPES: { value: AssessmentScope; label: string }[] = [
  { value: "LESSON", label: "Lesson" },
  { value: "CHAPTER", label: "Chapter" },
  { value: "COURSE", label: "Course" },
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
  const [assessmentType, setAssessmentType] =
    useState<AssessmentType>("QUIZ");
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
  const [qLessonId, setQLessonId] = useState<number | "">("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Step 3 - Settings
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [passingScore, setPassingScore] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);

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
        lesson_id: qLessonId ? Number(qLessonId) : undefined,
        difficulty: qDifficulty || undefined,
        type: qType || undefined,
        page: 1,
        page_size: 50,
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
  }, [step, qSearch, qDifficulty, qType, qLessonId]);

  const toggleQuestion = (id: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id]
    );
  };

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
    setShowCorrectAnswers(true);
  };

  const buildPayload = (
    status: AssessmentStatus
  ): AssessmentCreateRequest => ({
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
    show_correct_answers: showCorrectAnswers,
    question_ids: selectedQuestionIds,
  });

  const handleSubmit = async (status: AssessmentStatus) => {
    if (!title.trim() || !courseId) {
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload(status);
      await createAssessment(payload);
      onCreated?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error("Failed to create assessment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return title.trim() && courseId;
    if (step === 2) return selectedQuestionIds.length > 0;
    return true;
  };

  return (
    <>
      <Dialog open={isActuallyOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((label, idx) => {
              const s = idx + 1;
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {s}
                  </div>
                  {s < STEPS.length && (
                    <div
                      className={`h-1 flex-1 rounded ${s < step ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1 - Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Assessment Title
                </label>
                <Input
                  placeholder="e.g., Python Fundamentals Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Type
                  </label>
                  <select
                    value={assessmentType}
                    onChange={(e) =>
                      setAssessmentType(e.target.value as AssessmentType)
                    }
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    {ASSESSMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) =>
                      setScope(e.target.value as AssessmentScope)
                    }
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) =>
                    setCourseId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">Select a course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Chapter (optional)
                  </label>
                  <select
                    value={chapterId}
                    onChange={(e) =>
                      setChapterId(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    disabled={!courseId}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">Select a chapter...</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Lesson (optional)
                  </label>
                  <select
                    value={lessonId}
                    onChange={(e) =>
                      setLessonId(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    disabled={!chapterId}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">Select a lesson...</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Add assessment description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 2 - Select Questions */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm"
                  />
                </div>
                <select
                  value={qLessonId}
                  onChange={(e) =>
                    setQLessonId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">All Lessons</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                  <option value="Fill in the Blanks">Fill in the Blanks</option>
                </select>
              </div>

              {/* Selected counter */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Selected{" "}
                  <span className="text-primary">
                    {selectedQuestionIds.length}
                  </span>{" "}
                  questions
                </p>
                {loadingQuestions && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Question list */}
              <div className="max-h-[350px] space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                {questions.length === 0 && !loadingQuestions ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No questions found. Try adjusting filters.
                  </p>
                ) : (
                  questions.map((q) => {
                    const selected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/30"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleQuestion(q.id)}
                          className="mt-1 size-4 rounded border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {q.question_text}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {q.difficulty && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {q.difficulty}
                              </span>
                            )}
                            {q.bloom_level && (
                              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                {q.bloom_level}
                              </span>
                            )}
                            {q.is_ai_generated && (
                              <span className="flex items-center gap-0.5 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                                <Sparkles className="size-2.5" /> AI
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setPreviewQuestion(q)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="size-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Step 3 - Settings */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) =>
                      setPassingScore(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Max Attempts
                </label>
                <Input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <ToggleRow
                  label="Shuffle Questions"
                  value={shuffleQuestions}
                  onChange={setShuffleQuestions}
                />
                <ToggleRow
                  label="Shuffle Options"
                  value={shuffleOptions}
                  onChange={setShuffleOptions}
                />
                <ToggleRow
                  label="Show Correct Answers"
                  value={showCorrectAnswers}
                  onChange={setShowCorrectAnswers}
                />
              </div>
            </div>
          )}

          {/* Step 4 - Review & Publish */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <h3 className="text-base font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description || "No description"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ReviewItem label="Type" value={assessmentType} />
                <ReviewItem label="Scope" value={scope} />
                <ReviewItem
                  label="Questions"
                  value={String(selectedQuestionIds.length)}
                />
                <ReviewItem
                  label="Duration"
                  value={`${durationMinutes} min`}
                />
                <ReviewItem
                  label="Passing Score"
                  value={`${passingScore}%`}
                />
                <ReviewItem
                  label="Max Attempts"
                  value={String(maxAttempts)}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  disabled={!canProceed()}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit("DRAFT")}
                    disabled={submitting}
                    className="gap-1"
                  >
                    <Save className="size-4" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit("PUBLISHED")}
                    disabled={submitting}
                    className="gap-1"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Publish Assessment
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Preview Modal */}
      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
      />
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
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(true)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${value
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
            }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${!value
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
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
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}