"use client";

import { useState } from "react";
import { CheckCircle2, Eye, HelpCircle, Sparkles, User, X } from "lucide-react";
import type { Question } from "@/types/question";

interface QuestionPreviewModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Hard: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export function QuestionPreviewModal({
  isOpen,
  question,
  onClose,
}: QuestionPreviewModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isOpen || !question) return null;

  const options = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ].filter((o) => o.text);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Eye className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Question Preview
              </span>
              <h3 className="text-lg font-bold text-foreground truncate">
                Question #{question.id}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Question Content */}
        <div className="space-y-4">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20">
              {question.type || "Multiple Choice"}
            </span>
            <span className="rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-semibold border border-emerald-500/20">
              {question.marks || 1} Marks
            </span>
            {question.difficulty && (
              <span
                className={`rounded-lg px-3 py-1 text-xs font-semibold border ${DIFFICULTY_STYLES[question.difficulty] ||
                  "bg-muted text-muted-foreground border-border"
                  }`}
              >
                {question.difficulty}
              </span>
            )}
            {question.bloom_level && (
              <span className="rounded-lg bg-violet-500/10 text-violet-600 px-3 py-1 text-xs font-semibold border border-violet-500/20">
                {question.bloom_level}
              </span>
            )}
            {question.is_ai_generated ? (
              <span className="flex items-center gap-1 rounded-lg bg-violet-500/10 text-violet-600 px-3 py-1 text-xs font-semibold border border-violet-500/20">
                <Sparkles className="size-3" /> AI
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-lg bg-blue-500/10 text-blue-600 px-3 py-1 text-xs font-semibold border border-blue-500/20">
                <User className="size-3" /> Manual
              </span>
            )}
          </div>

          {/* Lesson title */}
          {question.lesson_title && (
            <p className="text-xs text-muted-foreground">
              Lesson:{" "}
              <span className="font-semibold text-foreground">
                {question.lesson_title}
              </span>
            </p>
          )}

          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <p className="text-base font-bold text-foreground leading-relaxed">
              {question.question_text}
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isCorrect = opt.key === question.correct_option;
              const isSelected = selectedOption === opt.key;

              return (
                <div
                  key={opt.key}
                  onClick={() => setSelectedOption(opt.key)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${isCorrect
                      ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                      : isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card hover:bg-muted/40 text-foreground"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-7 items-center justify-center rounded-lg text-xs font-bold ${isCorrect
                          ? "bg-emerald-500 text-white"
                          : isSelected
                            ? "bg-primary text-white"
                            : "bg-muted text-foreground"
                        }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </div>

                  {isCorrect && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Correct Answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation if present */}
          {question.explanation && (
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                <HelpCircle className="size-4" /> Explanation & Solution
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
