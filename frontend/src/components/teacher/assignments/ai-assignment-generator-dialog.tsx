import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  RefreshCw,
  Edit3,
  Check,
  BookOpen,
  FileText,
  HelpCircle,
  BarChart3,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { assignmentApi } from '@/lib/api/assignments';
import apiClient from '@/lib/api/axios';
import { LESSONS } from '@/lib/api/endpoints';
import {
  AssignmentType,
  AssignmentDifficulty,
  AIAssignmentGenResponse,
} from '@/types/assignment';

interface AIAssignmentGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: { id: number; title: string }[];
}

type DialogStep = 'FORM' | 'GENERATING' | 'PREVIEW';

export function AIAssignmentGeneratorDialog({
  open,
  onOpenChange,
  courses = [],
}: AIAssignmentGeneratorDialogProps) {
  const router = useRouter();

  // Form State
  const [courseId, setCourseId] = useState<number>(courses[0]?.id || 0);
  const [lessons, setLessons] = useState<{ id: number; title: string }[]>([]);
  const [lessonId, setLessonId] = useState<number | 0>(0);
  const [topic, setTopic] = useState('');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('PROBLEM_SOLVING');
  const [difficulty, setDifficulty] = useState<AssignmentDifficulty>('MEDIUM');
  const [taskCount, setTaskCount] = useState<number>(5);
  const [customDirectives, setCustomDirectives] = useState('');

  // Flow State
  const [step, setStep] = useState<DialogStep>('FORM');
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [generatedResult, setGeneratedResult] = useState<AIAssignmentGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync initial course
  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  // Fetch lessons when selected course changes
  useEffect(() => {
    if (courseId) {
      apiClient
        .get(LESSONS, { params: { course_id: courseId } })
        .then((res) => {
          setLessons(res.data || []);
          setLessonId(0); // Reset to course-level
        })
        .catch(() => {
          setLessons([]);
          setLessonId(0);
        });
    } else {
      setLessons([]);
      setLessonId(0);
    }
  }, [courseId]);

  if (!open) return null;

  // Real progress step titles
  const progressSteps = [
    'Loading course & lesson educational context...',
    'Analyzing topic and target learning objectives...',
    'Designing structured tasks & problems with Gemini...',
    'Formatting instructions and submission requirements...',
    'Building grading rubric and calculating points allocation...',
  ];

  // Dynamic label for Task Count based on assignment type
  const getTaskCountLabel = () => {
    switch (assignmentType) {
      case 'PROBLEM_SOLVING':
        return 'Number of Problems *';
      case 'WRITTEN':
        return 'Number of Questions *';
      case 'PROGRAMMING':
        return 'Number of Tasks *';
      case 'RESEARCH':
        return 'Number of Sections / Questions *';
      case 'CREATIVE':
        return 'Number of Deliverables *';
      case 'PROJECT':
        return 'Number of Key Milestones *';
      default:
        return 'Number of Tasks *';
    }
  };

  const handleGenerate = async () => {
    if (!courseId) {
      setError('Please select a course.');
      return;
    }
    if (!topic.trim()) {
      setError('Please enter a topic or learning objective.');
      return;
    }

    setError(null);
    setStep('GENERATING');
    setProgressIndex(0);
    setGeneratedResult(null);

    // Simulate progressive UI status steps driven by timer while API executes
    const interval = setInterval(() => {
      setProgressIndex((prev) => {
        if (prev < progressSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await assignmentApi.generateAI(
        {
          course_id: courseId,
          lesson_id: lessonId > 0 ? lessonId : undefined,
          topic: topic.trim(),
          assignment_type: assignmentType,
          difficulty: difficulty,
          task_count: taskCount,
          custom_directives: customDirectives.trim(),
        },
        { signal: controller.signal }
      );

      clearInterval(interval);
      setProgressIndex(progressSteps.length - 1);
      setGeneratedResult(result);
      setStep('PREVIEW');
    } catch (err: any) {
      clearInterval(interval);
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        setError('Assignment generation was cancelled.');
      } else {
        setError(
          err?.response?.data?.detail ||
            'Arivu AI couldn’t generate the assignment right now. Please try again.'
        );
      }
      setStep('FORM');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStep('FORM');
    setError('Generation cancelled.');
  };

  const handleUseThisDraft = () => {
    if (!generatedResult) return;

    // Save to sessionStorage for Create page pre-fill
    if (typeof window !== 'undefined') {
      const payloadToSave = {
        ...generatedResult,
        course_id: courseId,
        lesson_id: lessonId > 0 ? lessonId : undefined,
      };
      sessionStorage.setItem('ai_generated_assignment', JSON.stringify(payloadToSave));
    }

    onOpenChange(false);
    router.push('/teacher-dashboard/assignments/create?from_ai=true');
  };

  const selectedCourseTitle = courses.find((c) => c.id === courseId)?.title || 'Course';
  const selectedLessonTitle = lessons.find((l) => l.id === lessonId)?.title;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-5 bg-gradient-to-r from-primary/5 via-card to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-md">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                Generate Assignment with AI
                <span className="text-xs font-sans font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                  Real-time Draft
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tell Arivu AI what your students should accomplish. Arivu AI will create a complete assignment draft for your review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              <AlertCircle className="size-5 flex-shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* MODE 1: FORM INPUTS */}
          {step === 'FORM' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Course *
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course-aware Lesson Selection */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Lesson / Topic (Optional)
                  </label>
                  <select
                    value={lessonId}
                    onChange={(e) => setLessonId(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value={0}>None / Entire Course Level</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic / Learning Objective */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Topic / Learning Objective *
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quadratic equations — solve and explain real-world applications"
                  className="h-11 text-sm rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Assignment Type */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Assignment Type *
                  </label>
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value as AssignmentType)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="PROBLEM_SOLVING">Problem Solving</option>
                    <option value="WRITTEN">Written Response</option>
                    <option value="PROGRAMMING">Programming</option>
                    <option value="PROJECT">Project</option>
                    <option value="RESEARCH">Research / Report</option>
                    <option value="CREATIVE">Creative / Presentation</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as AssignmentDifficulty)}
                    className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                {/* Task Count */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 truncate">
                    {getTaskCountLabel()}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={taskCount}
                    onChange={(e) => setTaskCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                    className="h-11 text-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Custom Directives */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Custom Directives (Optional)
                </label>
                <Textarea
                  value={customDirectives}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomDirectives(e.target.value)}
                  placeholder="e.g. Make it suitable for Form 4 students, require students to show all working, and design the assignment to take approximately 60 minutes."
                  rows={3}
                  className="text-sm rounded-xl"
                />
              </div>
            </div>
          )}

          {/* MODE 2: GENERATING PROGRESS */}
          {step === 'GENERATING' && (
            <div className="py-8 px-4 text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="size-20 rounded-3xl bg-gradient-to-tr from-primary/20 via-accent/20 to-primary/10 animate-pulse flex items-center justify-center">
                  <Sparkles className="size-10 text-primary animate-spin" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-serif font-bold text-foreground">
                  Arivu AI is crafting your assignment
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Analyzing course context, designing real-world problems, generating structured rubrics, and formatting instructions.
                </p>
              </div>

              {/* Progress Steps List */}
              <div className="max-w-md mx-auto text-left space-y-3 bg-muted/40 p-5 rounded-2xl border border-border/60">
                {progressSteps.map((stepText, idx) => {
                  const isDone = idx < progressIndex;
                  const isCurrent = idx === progressIndex;

                  return (
                    <div key={stepText} className="flex items-center gap-3 text-sm">
                      {isDone ? (
                        <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="size-5 text-primary animate-spin flex-shrink-0" />
                      ) : (
                        <div className="size-5 rounded-full border-2 border-border flex-shrink-0" />
                      )}
                      <span
                        className={
                          isDone
                            ? 'text-foreground font-medium line-through opacity-70'
                            : isCurrent
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground'
                        }
                      >
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelGeneration}
                  className="rounded-xl border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  Cancel Generation
                </Button>
              </div>
            </div>
          )}

          {/* MODE 3: PREVIEW DRAFT */}
          {step === 'PREVIEW' && generatedResult && (
            <div className="space-y-6">
              {/* Draft Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-primary text-primary-foreground">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      AI Generated Draft — Review Required
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Review all sections below. Click <strong>Use This Draft</strong> to import into the full editor.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">
                  {generatedResult.max_points} Points
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  {generatedResult.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-muted font-semibold text-foreground border border-border">
                    {selectedCourseTitle}
                  </span>
                  {selectedLessonTitle && (
                    <span className="px-2.5 py-1 rounded-lg bg-muted font-semibold text-foreground border border-border">
                      Lesson: {selectedLessonTitle}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold">
                    {generatedResult.assignment_type}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent font-semibold">
                    {generatedResult.difficulty}
                  </span>
                </div>
              </div>

              {/* Overview Description */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Overview & Objective
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {generatedResult.description}
                </p>
              </div>

              {/* Student Instructions */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Detailed Student Instructions
                </h4>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed font-sans">
                  {generatedResult.instructions}
                </p>
              </div>

              {/* Tasks / Problems List */}
              {generatedResult.tasks && generatedResult.tasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    Generated Tasks & Problems ({generatedResult.tasks.length})
                  </h4>
                  <div className="space-y-2.5">
                    {generatedResult.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {idx + 1}. {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                        {task.points && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                            {task.points} pts
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Requirements */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Submission Requirements
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Methods: </span>
                    <span className="font-semibold text-foreground">
                      {generatedResult.submission_config?.allowed_methods?.join(', ') || 'file, text'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formats: </span>
                    <span className="font-semibold text-foreground uppercase">
                      {generatedResult.submission_config?.allowed_file_types?.join(', ') || 'pdf, docx'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Size: </span>
                    <span className="font-semibold text-foreground">
                      {generatedResult.submission_config?.max_file_size_mb || 25} MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Rubric Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="size-4 text-primary" />
                    Grading Rubric Criteria
                  </h4>
                  <span className="text-xs font-bold text-foreground">
                    Total: {generatedResult.rubric_criteria?.reduce((acc, r) => acc + r.max_points, 0)} / {generatedResult.max_points} Points
                  </span>
                </div>
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                      <tr>
                        <th className="p-3">Criterion</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Max Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {generatedResult.rubric_criteria?.map((c, i) => (
                        <tr key={i}>
                          <td className="p-3 font-semibold text-foreground">{c.criterion_name}</td>
                          <td className="p-3 text-muted-foreground">{c.description || 'N/A'}</td>
                          <td className="p-3 text-right font-bold text-primary">{c.max_points} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optional Teacher Notes */}
              {generatedResult.optional_teacher_notes && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
                  <span className="font-bold">Teacher Note: </span>
                  {generatedResult.optional_teacher_notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
          {step === 'FORM' && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 shadow-md"
              >
                <Sparkles className="size-4" />
                Generate Assignment Draft
              </Button>
            </>
          )}

          {step === 'GENERATING' && (
            <div className="w-full flex justify-end">
              <Button variant="ghost" disabled className="gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                Arivu AI is writing...
              </Button>
            </div>
          )}

          {step === 'PREVIEW' && (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('FORM')}
                  className="rounded-xl border-border gap-1.5"
                >
                  <Edit3 className="size-4" />
                  Edit Directives
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  className="rounded-xl border-border gap-1.5 text-primary"
                >
                  <RefreshCw className="size-4" />
                  Regenerate
                </Button>
              </div>
              <Button
                onClick={handleUseThisDraft}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg"
              >
                <Check className="size-4" />
                Use This Draft
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
