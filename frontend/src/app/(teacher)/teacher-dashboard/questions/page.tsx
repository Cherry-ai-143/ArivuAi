"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus,
  Search,
  Sparkles,
  Eye,
  Edit2,
  Trash2,
  HelpCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  BookOpen,
  Layers,
  Book,
  CheckSquare,
  FolderOpen,
  Check,
  AlertCircle,
  RefreshCw,
  Archive,
  CheckCircle2,
  Filter,
  Layers3,
} from "lucide-react";

import { useCourses } from "@/hooks/useCourses";
import { useChapters } from "@/hooks/useChapters";
import { useLessons } from "@/hooks/useLessons";
import {
  useSearchQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useQuestionBank";
import { QuestionModal } from "@/components/teacher/questions/question-modal";
import { QuestionPreviewModal } from "@/components/teacher/questions/question-preview-modal";
import { AiQuizGeneratorModal } from "@/components/teacher/quizzes/ai-quiz-generator-modal";
import { CreateAssessmentDialog } from "@/components/teacher/assessments/create-assessment-dialog";
import type { Question, QuestionSearchQueryParams } from "@/types/question";
import type { Course } from "@/types/course";
import type { Chapter } from "@/types/chapter";
import type { Lesson } from "@/types/lesson";

export default function ContextAwareQuestionBankPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Context parameters
  const initialCourseId = searchParams.get("course_id") ? Number(searchParams.get("course_id")) : null;
  const initialChapterId = searchParams.get("chapter_id") ? Number(searchParams.get("chapter_id")) : null;
  const initialLessonId = searchParams.get("lesson_id") ? Number(searchParams.get("lesson_id")) : null;

  // Progressive Context Selector State (Defaulting to ALL for progressive filtering)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(initialCourseId);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(initialChapterId);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(initialLessonId);

  // Search, Filters & Bulk State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [filterBloom, setFilterBloom] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Bulk Selection
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());

  // Modals state
  const [activeQuestionModal, setActiveQuestionModal] = useState<{
    isOpen: boolean;
    question: Question | null;
  }>({ isOpen: false, question: null });
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- ACADEMIC CONTEXT DATA FETCHING ---
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ page: 1, page_size: 100, my_courses: true });
  const courses: Course[] = coursesData?.items || [];

  const { data: chaptersData, isLoading: isLoadingChapters } = useChapters(selectedCourseId || undefined);
  const chapters: Chapter[] = (chaptersData as Chapter[]) || [];

  const { data: lessonsData, isLoading: isLoadingLessons } = useLessons(selectedChapterId || undefined);
  const lessons: Lesson[] = (lessonsData as any)?.items || (Array.isArray(lessonsData) ? lessonsData : []);

  // Selected Objects Lookup
  const selectedCourse = useMemo(() => courses.find((c) => c.id === selectedCourseId) || null, [courses, selectedCourseId]);
  const selectedChapter = useMemo(() => chapters.find((ch) => ch.id === selectedChapterId) || null, [chapters, selectedChapterId]);
  const selectedLesson = useMemo(() => lessons.find((l) => l.id === selectedLessonId) || null, [lessons, selectedLessonId]);

  // Sync selection to URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCourseId) params.set("course_id", String(selectedCourseId));
    if (selectedChapterId) params.set("chapter_id", String(selectedChapterId));
    if (selectedLessonId) params.set("lesson_id", String(selectedLessonId));

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (newQuery !== currentQuery) {
      const query = newQuery ? `?${newQuery}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    }
  }, [selectedCourseId, selectedChapterId, selectedLessonId, pathname, router, searchParams]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --- FETCH QUESTIONS WITH PROGRESSIVE HIERARCHICAL FILTERING ---
  const queryParams = useMemo(() => {
    const params: QuestionSearchQueryParams = {
      q: debouncedSearch,
      page,
      page_size: pageSize,
    };
    if (selectedLessonId) {
      params.lesson_id = selectedLessonId;
    } else if (selectedChapterId) {
      params.chapter_id = selectedChapterId;
    } else if (selectedCourseId) {
      params.course_id = selectedCourseId;
    }

    if (filterSource !== "All") params.source = filterSource;
    if (filterType !== "All") params.type = filterType;
    if (filterDifficulty !== "All") params.difficulty = filterDifficulty;
    if (filterBloom !== "All") params.bloom_level = filterBloom;
    if (filterStatus !== "All") params.status = filterStatus;

    return params;
  }, [selectedLessonId, selectedChapterId, selectedCourseId, debouncedSearch, page, pageSize, filterSource, filterType, filterDifficulty, filterBloom, filterStatus]);

  const { data: questionsData, isLoading: isLoadingQuestions, refetch: refetchQuestions } = useSearchQuestions(queryParams);

  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const rawQuestions: Question[] = questionsData?.items || [];
  const filteredQuestions = rawQuestions;
  const totalQuestions = questionsData?.total || 0;

  // Handle Bulk Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q.id)));
    } else {
      setSelectedQuestionIds(new Set());
    }
  };

  const handleToggleSelectQuestion = (id: number) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkArchive = async () => {
    try {
      for (const id of Array.from(selectedQuestionIds)) {
        await updateQuestionMutation.mutateAsync({ id, data: { status: "Archived" } });
      }
      showToast("success", `Archived ${selectedQuestionIds.size} questions.`);
      setSelectedQuestionIds(new Set());
      refetchQuestions();
    } catch (err) {
      showToast("error", "Failed to archive selected questions.");
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const id of Array.from(selectedQuestionIds)) {
        await updateQuestionMutation.mutateAsync({ id, data: { status: "Approved" } });
      }
      showToast("success", `Approved ${selectedQuestionIds.size} questions.`);
      setSelectedQuestionIds(new Set());
      refetchQuestions();
    } catch (err) {
      showToast("error", "Failed to approve selected questions.");
    }
  };

  // Helper map for lesson titles lookup
  const lessonTitleMap = useMemo(() => {
    const map = new Map<number, string>();
    lessons.forEach((l) => map.set(l.id, l.title));
    return map;
  }, [lessons]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all ${
            toastMsg.type === "success"
              ? "bg-emerald-500 text-white border-emerald-600"
              : "bg-rose-500 text-white border-rose-600"
          }`}
        >
          {toastMsg.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-6 text-primary" /> Question Bank Repository
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse and manage reusable questions across courses, chapters, and lessons.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refetchQuestions()}
            className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Refresh Questions"
          >
            <RefreshCw className="size-4" />
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition-all"
          >
            <Sparkles className="size-4" /> Generate AI Questions
          </button>

          <button
            onClick={() => setActiveQuestionModal({ isOpen: true, question: null })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition-all"
          >
            <Plus className="size-4" /> Create Question
          </button>
        </div>
      </div>

      {/* PROGRESSIVE HIERARCHICAL FILTERS (Course -> Chapter -> Lesson) */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Hierarchical Content Selector
            </h3>
          </div>

          <span className="text-[11px] font-semibold text-muted-foreground">
            Progressive Filtering
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Course */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Book className="size-3 text-primary" /> 1. Select Course
            </label>
            <select
              value={selectedCourseId || ""}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setSelectedCourseId(id);
                setSelectedChapterId(null);
                setSelectedLessonId(null);
              }}
              disabled={isLoadingCourses}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Chapter */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Layers3 className="size-3 text-indigo-600" /> 2. Select Chapter
            </label>
            <select
              value={selectedChapterId || ""}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setSelectedChapterId(id);
                setSelectedLessonId(null);
              }}
              disabled={!selectedCourseId || isLoadingChapters}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate disabled:opacity-50"
            >
              <option value="">All Chapters</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Unit {ch.order_number}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Lesson */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CheckSquare className="size-3 text-emerald-600" /> 3. Select Lesson
            </label>
            <select
              value={selectedLessonId || ""}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setSelectedLessonId(id);
              }}
              disabled={!selectedChapterId || isLoadingLessons}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate disabled:opacity-50"
            >
              <option value="">All Lessons</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  Lesson {l.order_number}: {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONTEXT BREADCRUMB & METRICS HEADER */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground flex-wrap">
            <span>{selectedCourse?.title || "All Courses"}</span>
            {selectedChapter && (
              <>
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <span className="text-indigo-600">{selectedChapter.title}</span>
              </>
            )}
            {selectedLesson && (
              <>
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <span className="text-emerald-600">{selectedLesson.title}</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Showing: <strong className="text-foreground">{totalQuestions} Questions</strong>
            {selectedCourse && !selectedChapter && chapters.length > 0 && (
              <span> across {chapters.length} Chapters</span>
            )}
            {selectedChapter && !selectedLesson && lessons.length > 0 && (
              <span> across {lessons.length} Lessons</span>
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCourseId(null);
            setSelectedChapterId(null);
            setSelectedLessonId(null);
          }}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Reset Hierarchical Filters
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search question text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-muted/20 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Filter Options */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs">
            <div className="flex items-center gap-1 text-muted-foreground font-semibold">
              <Filter className="size-3.5" /> Filters:
            </div>

            {/* Source */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground"
            >
              <option value="All">All Sources</option>
              <option value="Manual">Manual</option>
              <option value="AI Generated">AI Generated</option>
            </select>

            {/* Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground"
            >
              <option value="All">All Types</option>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True/False">True/False</option>
              <option value="Multiple Select">Multiple Select</option>
            </select>

            {/* Difficulty */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Bloom's Level */}
            <select
              value={filterBloom}
              onChange={(e) => setFilterBloom(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground"
            >
              <option value="All">All Bloom Levels</option>
              <option value="Knowledge">Knowledge</option>
              <option value="Understanding">Understanding</option>
              <option value="Application">Application</option>
              <option value="Analysis">Analysis</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Creation">Creation</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedQuestionIds.size > 0 && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold bg-primary/5 p-2.5 rounded-xl">
            <span className="text-primary font-bold">
              {selectedQuestionIds.size} questions selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateAssessmentOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="size-3.5" />
                Create Assessment from Selected ({selectedQuestionIds.size})
              </button>
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
              >
                Approve Selected
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors"
              >
                Archive Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QUESTION TABLE / CONTEXT EMPTY STATES */}
      {isLoadingQuestions ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading question bank items...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <FolderOpen className="mx-auto size-12 text-primary opacity-50" />
          <h3 className="text-base font-bold text-foreground">No Questions Found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No questions have been created for{" "}
            <strong className="text-foreground">
              {selectedLesson?.title || selectedChapter?.title || selectedCourse?.title || "this context"}
            </strong>{" "}
            yet. Start by creating one manually or generate with AI.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveQuestionModal({ isOpen: true, question: null })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition-all"
            >
              <Plus className="size-3.5" /> Create Manual Question
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-bold shadow-md hover:bg-purple-700 transition-all"
            >
              <Sparkles className="size-3.5" /> Generate AI Questions
            </button>
          </div>
        </div>
      ) : (
        /* QUESTION DATA TABLE WITH LESSON COLUMN */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedQuestionIds.size === filteredQuestions.length && filteredQuestions.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="p-3">Lesson Module</th>
                  <th className="p-3">Question Item</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Bloom's Level</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.has(q.id);
                  const lessonTitle = q.lesson_id ? lessonTitleMap.get(q.lesson_id) || `Lesson #${q.lesson_id}` : "General Bank";

                  return (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectQuestion(q.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="p-3 w-[240px] min-w-[200px]">
                        <div
                          className="flex items-center gap-3 rounded-2xl bg-[#f0f3fe] border border-[#e0e6fe] px-3.5 py-2.5 shadow-sm transition-all hover:bg-[#e7ecfe]"
                          title={q.lesson_title || lessonTitle}
                        >
                          <BookOpen className="size-4 text-[#3b52d4] shrink-0 fill-[#3b52d4]/20" />
                          <span className="font-bold text-[11.5px] leading-snug text-[#1e2448] line-clamp-2">
                            {q.lesson_title || lessonTitle}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="font-bold text-foreground line-clamp-2">{q.question_text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Options: A, B, C, D • Correct: <strong className="text-primary">{q.correct_option?.toUpperCase()}</strong>
                        </p>
                      </td>
                      <td className="p-3 font-semibold text-muted-foreground">
                        {q.type || "Multiple Choice"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            q.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : q.difficulty === "Hard"
                              ? "bg-rose-500/10 text-rose-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {q.difficulty || "Medium"}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-indigo-600">
                        {q.bloom_level || "Understanding"}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                          {q.is_ai_generated || q.source === "AI Generated" ? (
                            <>
                              <Sparkles className="size-3 text-purple-600" /> AI
                            </>
                          ) : (
                            <>
                              <Edit2 className="size-3 text-primary" /> Manual
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            q.status === "Approved" || q.status === "Published"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : q.status === "Archived"
                              ? "bg-muted text-muted-foreground"
                              : "bg-blue-500/10 text-blue-600"
                          }`}
                        >
                          {q.status || "Approved"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Preview Question"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveQuestionModal({ isOpen: true, question: q })}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await updateQuestionMutation.mutateAsync({
                                  id: q.id,
                                  data: { status: "Archived" },
                                });
                                showToast("success", "Question archived.");
                                refetchQuestions();
                              } catch (e) {
                                showToast("error", "Failed to archive question.");
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-amber-600 hover:text-amber-700 transition-colors"
                            title="Archive Question"
                          >
                            <Archive className="size-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to permanently delete this question?")) {
                                try {
                                  await deleteQuestionMutation.mutateAsync(q.id);
                                  showToast("success", "Question deleted permanently.");
                                  refetchQuestions();
                                } catch (e) {
                                  showToast("error", "Failed to delete question.");
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION FOOTER */}
      {totalQuestions > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-border bg-muted/20 px-2.5 py-1 font-semibold text-foreground"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2">
              Showing <strong>{totalQuestions === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{" "}
              <strong>{Math.min(page * pageSize, totalQuestions)}</strong> of <strong>{totalQuestions}</strong> questions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card font-bold hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="font-semibold text-muted-foreground px-2">
              Page {page} of {questionsData?.pages || Math.ceil(totalQuestions / pageSize) || 1}
            </span>
            <button
              disabled={page >= (questionsData?.pages || Math.ceil(totalQuestions / pageSize) || 1)}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card font-bold hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {activeQuestionModal.isOpen && (
        <QuestionModal
          isOpen={activeQuestionModal.isOpen}
          onClose={() => setActiveQuestionModal({ isOpen: false, question: null })}
          question={activeQuestionModal.question}
          lessonId={selectedLessonId || 1}
          courseTitle={selectedCourse?.title}
          chapterTitle={selectedChapter?.title}
          lessonTitle={selectedLesson?.title}
          onSuccess={() => {
            showToast("success", "Question saved successfully.");
            refetchQuestions();
          }}
        />
      )}

      {previewQuestion && (
        <QuestionPreviewModal
          isOpen={Boolean(previewQuestion)}
          onClose={() => setPreviewQuestion(null)}
          question={previewQuestion}
        />
      )}

      {isAiModalOpen && (
        <AiQuizGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          lessonId={selectedLessonId || 1}
          onSuccess={() => {
            showToast("success", "AI questions approved and saved to Question Bank.");
            refetchQuestions();
          }}
        />
      )}

      {isCreateAssessmentOpen && (
        <CreateAssessmentDialog
          open={isCreateAssessmentOpen}
          onOpenChange={setIsCreateAssessmentOpen}
          initialSelectedQuestionIds={Array.from(selectedQuestionIds)}
          initialCourseId={selectedCourseId}
          initialChapterId={selectedChapterId}
          initialLessonId={selectedLessonId}
          onCreated={() => {
            showToast("success", "Assessment created and saved successfully.");
            setSelectedQuestionIds(new Set());
          }}
        />
      )}
    </div>
  );
}
