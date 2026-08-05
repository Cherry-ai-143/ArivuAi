"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  X,
  BookOpen,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  Cloud,
  Check,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Link,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import type { Question, BloomLevel, QuestionStatus, QuestionDifficulty, QuestionType } from "@/types/question";
import { useCreateQuestion, useUpdateQuestion } from "@/hooks/useQuestionBank";

interface QuestionOptionItem {
  id: string;
  label: string; // A, B, C, D
  text: string;
  isCorrect: boolean;
}

interface QuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  lessonId: number;
  courseTitle?: string;
  chapterTitle?: string;
  lessonTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionModal({
  isOpen,
  question,
  lessonId,
  courseTitle = "Python Programming",
  chapterTitle = "Functions",
  lessonTitle = "Lambda Functions",
  onClose,
  onSuccess,
}: QuestionModalProps) {
  const isEditing = Boolean(question);
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<QuestionOptionItem[]>([
    { id: "opt-a", label: "A", text: "", isCorrect: true },
    { id: "opt-b", label: "B", text: "", isCorrect: false },
    { id: "opt-c", label: "C", text: "", isCorrect: false },
    { id: "opt-d", label: "D", text: "", isCorrect: false },
  ]);

  const [questionType, setQuestionType] = useState<QuestionType>("Multiple Choice");
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>("Understanding");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("Medium");
  const [marks, setMarks] = useState<number>(2);
  const [estimatedTimeSeconds, setEstimatedTimeSeconds] = useState<number>(30);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);

  // Tags State
  const [tagList, setTagList] = useState<string[]>(["functions", "lambda"]);
  const [tagInput, setTagInput] = useState("");

  // Explanation State
  const [explanationText, setExplanationText] = useState("");

  // Advanced Accordion State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Formatting & Validation State
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text || "");

      const opts: QuestionOptionItem[] = [
        { id: "opt-a", label: "A", text: question.option_a || "", isCorrect: question.correct_option?.toLowerCase() === "a" },
        { id: "opt-b", label: "B", text: question.option_b || "", isCorrect: question.correct_option?.toLowerCase() === "b" },
        { id: "opt-c", label: "C", text: question.option_c || "", isCorrect: question.correct_option?.toLowerCase() === "c" },
        { id: "opt-d", label: "D", text: question.option_d || "", isCorrect: question.correct_option?.toLowerCase() === "d" },
      ];
      setOptions(opts);

      setQuestionType(question.type || "Multiple Choice");
      setDifficulty(question.difficulty || "Medium");
      setBloomLevel(question.bloom_level || "Understanding");
      setMarks(question.marks || 2);
      setEstimatedTimeSeconds(question.estimated_time_seconds || 30);
      setShuffleOptions(question.shuffle_options ?? true);
      setExplanationText(question.explanation || "");
      if (Array.isArray(question.tags)) setTagList(question.tags);
    } else {
      setQuestionText("");
      setOptions([
        { id: "opt-a", label: "A", text: "", isCorrect: true },
        { id: "opt-b", label: "B", text: "", isCorrect: false },
        { id: "opt-c", label: "C", text: "", isCorrect: false },
        { id: "opt-d", label: "D", text: "", isCorrect: false },
      ]);
      setQuestionType("Multiple Choice");
      setDifficulty("Medium");
      setBloomLevel("Understanding");
      setMarks(2);
      setEstimatedTimeSeconds(30);
      setShuffleOptions(true);
      setExplanationText("");
      setTagList(["functions", "lambda"]);
    }
    setErrors({});
  }, [question, isOpen]);

  // Update last saved time
  useEffect(() => {
    const now = new Date();
    setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [questionText, options]);

  if (!isOpen) return null;

  // Handle Tag Addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tagList.includes(val)) {
        setTagList((prev) => [...prev, val]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Option Operations
  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length); // E, F...
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, label: nextLabel, text: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return; // Keep minimum 2 options
    setOptions((prev) => {
      const filtered = prev.filter((o) => o.id !== id);
      return filtered.map((o, idx) => ({ ...o, label: String.fromCharCode(65 + idx) }));
    });
  };

  const handleSelectCorrectOption = (id: string) => {
    setOptions((prev) =>
      prev.map((o) => ({
        ...o,
        isCorrect: o.id === id,
      }))
    );
  };

  const handleUpdateOptionText = (id: string, text: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, text } : o))
    );
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!questionText.trim()) errs.questionText = "Question text is required.";
    
    options.forEach((opt) => {
      if (!opt.text.trim()) {
        errs[`option_${opt.id}`] = `Option ${opt.label} is required.`;
      }
    });

    const correct = options.find((o) => o.isCorrect);
    if (!correct) errs.correct = "Please select one correct answer.";

    if (Object.keys(errs).length > 0) {
      errs.general = "Please fill in all empty fields highlighted in red below before saving.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (targetStatus: QuestionStatus) => {
    if (!validate()) return;

    const correctIdx = options.findIndex((o) => o.isCorrect);
    const correctLetter = options[correctIdx < 0 ? 0 : correctIdx]?.label.toLowerCase() || "a";

    const payload = {
      assessment_id: 1,
      lesson_id: lessonId,
      question_text: questionText,
      option_a: options[0]?.text || "",
      option_b: options[1]?.text || "",
      option_c: options[2]?.text || "",
      option_d: options[3]?.text || "",
      correct_option: correctLetter,
      marks,
      order_number: 1,
      difficulty,
      type: questionType,
      bloom_level: bloomLevel,
      status: targetStatus,
      source: ("Manual" as const),
      shuffle_options: shuffleOptions,
      explanation: explanationText,
      tags: tagList,
    };

    try {
      if (isEditing && question) {
        await updateMutation.mutateAsync({
          id: question.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save question:", err);
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || "Server connection interrupted. Please try clicking Save & Approve again.",
      }));
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? "Edit Manual Question" : "Create Manual Question"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Attached to: <span className="text-slate-700 font-semibold">{courseTitle}</span> &gt; <span className="text-slate-700 font-semibold">{chapterTitle}</span> &gt; <span className="text-slate-700 font-semibold">{lessonTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* VALIDATION WARNING BANNER */}
        {errors.general && (
          <div className="mx-6 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs font-bold text-rose-600 flex items-center gap-2 flex-shrink-0">
            <AlertTriangle className="size-4 text-rose-500 flex-shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* SECTION 1: QUESTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Question</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Question Text <span className="text-rose-500">*</span>
              </label>

              {/* Rich Text Editor Simulation Box */}
              <div
                className={`rounded-xl border bg-white overflow-hidden transition-all ${
                  errors.questionText
                    ? "border-rose-500 bg-rose-50/10 focus-within:ring-2 focus-within:ring-rose-500/30"
                    : "border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500"
                }`}
              >
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs flex-wrap">
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 font-bold" title="Bold">
                    <Bold className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 italic" title="Italic">
                    <Italic className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 underline" title="Underline">
                    <Underline className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 line-through" title="Strikethrough">
                    <Strikethrough className="size-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Bullet List">
                    <List className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Ordered List">
                    <ListOrdered className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 font-mono text-[11px]" title="Code Block">
                    <Code className="size-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <select className="bg-transparent text-[11px] font-semibold text-slate-600 outline-none px-1">
                    <option>Normal</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Link">
                    <Link className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Image">
                    <ImageIcon className="size-3.5" />
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                    if (errors.questionText) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.questionText;
                        delete copy.general;
                        return copy;
                      });
                    }
                  }}
                  placeholder="Enter your question here..."
                  className="w-full p-3.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none resize-y"
                />

                <div className="p-2 border-t border-slate-100 flex justify-end text-[10px] text-slate-400 font-medium">
                  {questionText.length} / 2000
                </div>
              </div>

              {errors.questionText && (
                <p className="text-[11px] font-semibold text-rose-500">⚠️ {errors.questionText}</p>
              )}
            </div>
          </div>

          {/* SECTION 2: OPTIONS & CORRECT ANSWER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900">Options & Correct Answer</h3>
              </div>

              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Multiple Choice">Multiple Choice (Single Answer)</option>
                <option value="Multiple Select">Multiple Select (Multiple Answers)</option>
                <option value="True/False">True / False</option>
              </select>
            </div>

            {/* Options List with Highlighted Error Validation */}
            <div className="space-y-3">
              {options.map((opt) => {
                const optError = errors[`option_${opt.id}`];
                return (
                  <div key={opt.id} className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-8 font-bold text-xs rounded-lg flex items-center justify-center flex-shrink-0 ${
                          optError
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {opt.label}
                      </span>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          handleUpdateOptionText(opt.id, e.target.value);
                          if (optError) {
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy[`option_${opt.id}`];
                              delete copy.general;
                              return copy;
                            });
                          }
                        }}
                        placeholder={`Enter option ${opt.label} text...`}
                        className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all ${
                          optError
                            ? "border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/30"
                            : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        }`}
                      />

                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none px-2 py-1">
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={opt.isCorrect}
                          onChange={() => handleSelectCorrectOption(opt.id)}
                          className="size-4 accent-indigo-600 cursor-pointer"
                        />
                        <span className={opt.isCorrect ? "text-emerald-600 font-bold" : "text-slate-400"}>
                          Correct Answer
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        disabled={options.length <= 2}
                        className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {optError && (
                      <p className="text-[11px] font-semibold text-rose-500 ml-11">
                        ⚠️ {optError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Option Button */}
            <button
              type="button"
              onClick={handleAddOption}
              className="w-full py-2.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4" /> Add Option
            </button>

            {/* Info Notice Banner */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-700 font-medium flex items-center gap-2">
              <Info className="size-4 text-blue-600 flex-shrink-0" />
              <span>Select one correct answer for Multiple Choice questions.</span>
            </div>
          </div>

          {/* SECTION 3: QUESTION SETTINGS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Question Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Bloom's Taxonomy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bloom's Taxonomy Level
                </label>
                <select
                  value={bloomLevel}
                  onChange={(e) => setBloomLevel(e.target.value as BloomLevel)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Knowledge">Knowledge</option>
                  <option value="Understanding">Understanding</option>
                  <option value="Application">Application</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Evaluation">Evaluation</option>
                  <option value="Creation">Creation</option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Select cognitive learning level</p>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Choose difficulty level</p>
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                  <option value="Multiple Select">Multiple Select</option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Type of question</p>
              </div>

              {/* Marks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marks (Weight) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">Points for this question</p>
              </div>
            </div>

            {/* Grid Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Estimated Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={estimatedTimeSeconds}
                    onChange={(e) => setEstimatedTimeSeconds(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-14 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    seconds
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Expected time to answer</p>
              </div>

              {/* Shuffle Options Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shuffle Options
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShuffleOptions(!shuffleOptions)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                      shuffleOptions ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
                    }`}
                  >
                    <div className="size-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Randomize options for students</p>
              </div>

              {/* Tags Tag-Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-1.5 flex items-center flex-wrap gap-1.5 min-h-[38px]">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500 text-indigo-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags..."
                    className="flex-1 min-w-[80px] bg-transparent text-xs outline-none px-1 text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Add relevant topics/tags</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: EXPLANATION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">Explanation (Optional)</h3>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs flex-wrap">
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 font-bold" title="Bold">
                    <Bold className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 italic" title="Italic">
                    <Italic className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 underline" title="Underline">
                    <Underline className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200 line-through" title="Strikethrough">
                    <Strikethrough className="size-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Bullet List">
                    <List className="size-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Ordered List">
                    <ListOrdered className="size-3.5" />
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="Explain why the correct answer is correct..."
                  className="w-full p-3.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none resize-y"
                />

                <div className="p-2 border-t border-slate-100 flex justify-end text-[10px] text-slate-400 font-medium">
                  {explanationText.length} / 2000
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: ADVANCED (OPTIONAL ACCORDION) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                  5
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Advanced (Optional)</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Additional settings for this question</p>
                </div>
              </div>

              {isAdvancedOpen ? (
                <ChevronUp className="size-5 text-slate-400" />
              ) : (
                <ChevronDown className="size-5 text-slate-400" />
              )}
            </button>

            {isAdvancedOpen && (
              <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500">
                Advanced parameters (version tracking, custom penalty weight) can be configured here.
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM FOOTER BAR */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Cloud className="size-4 text-emerald-500" />
            <span>Auto-save: Saved {lastSavedTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("Draft")}
              className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("Approved")}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Save & Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
