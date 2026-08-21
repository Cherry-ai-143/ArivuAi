"use client";

import { useState } from "react";
import {
  BarChart3,
  Clock,
  Copy,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  PlayCircle,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { Assessment, AssessmentStatus } from "@/types/assessment";
import { updateAssessmentStatus } from "@/lib/services/assessment.service";

interface AssessmentsListProps {
  assessments: Assessment[];
  search: string;
  statusFilter: "all" | AssessmentStatus;
  onPreview: (assessment: Assessment) => void;
  onEdit: (assessment: Assessment) => void;
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<
  AssessmentStatus,
  { label: string; badge: string; dot: string }
> = {
  PUBLISHED: {
    label: "Published",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  DRAFT: {
    label: "Draft",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500",
  },
  ARCHIVED: {
    label: "Archived",
    badge: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    dot: "bg-zinc-500",
  },
};

const TYPE_LABELS: Record<string, string> = {
  QUIZ: "Quiz",
  PRACTICE: "Practice",
  CHAPTER_TEST: "Chapter Test",
  MIDTERM: "Midterm",
  FINAL: "Final",
};

const SCOPE_LABELS: Record<string, string> = {
  LESSON: "Lesson",
  CHAPTER: "Chapter",
  COURSE: "Course",
};

export function AssessmentsList({
  assessments,
  search,
  statusFilter,
  onPreview,
  onEdit,
  onRefresh,
}: AssessmentsListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filtered = assessments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    id: number,
    newStatus: AssessmentStatus
  ) => {
    try {
      await updateAssessmentStatus(id, newStatus);
      onRefresh();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileText className="size-8" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">
          No assessments found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {search
            ? "Try adjusting your search or filters."
            : "Click 'Create Assessment' to build your first assessment."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((a) => {
        const cfg = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.DRAFT;
        return (
          <div
            key={a.id}
            className="group relative flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badge}`}
                  >
                    <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {TYPE_LABELS[a.assessment_type] ?? a.assessment_type}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-base font-bold text-foreground">
                  {a.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {SCOPE_LABELS[a.scope] ?? a.scope} scope
                </p>
              </div>

              {/* Actions menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId(openMenuId === a.id ? null : a.id)
                  }
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <MoreVertical className="size-4" />
                </button>
                {openMenuId === a.id && (
                  <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onPreview(a);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Eye className="size-4 text-primary" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(a);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Pencil className="size-4 text-indigo-600" />
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        setOpenMenuId(null);
                        try {
                          const { duplicateAssessment } = await import("@/lib/services/assessment.service");
                          await duplicateAssessment(a.id);
                          onRefresh();
                        } catch (err) {
                          console.error("Failed to duplicate assessment", err);
                        }
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Copy className="size-4 text-purple-600" />
                      Duplicate
                    </button>
                    {a.status !== "PUBLISHED" && (
                      <button
                        onClick={() => handleStatusChange(a.id, "PUBLISHED")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <PlayCircle className="size-4 text-emerald-600" />
                        Publish
                      </button>
                    )}
                    {a.status !== "DRAFT" && (
                      <button
                        onClick={() => handleStatusChange(a.id, "DRAFT")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <Pencil className="size-4 text-amber-600" />
                        Move to Draft
                      </button>
                    )}
                    {a.status !== "ARCHIVED" && (
                      <button
                        onClick={() => handleStatusChange(a.id, "ARCHIVED")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <FileText className="size-4 text-zinc-500" />
                        Archive
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat
                icon={<FileText className="size-4" />}
                label="Questions"
                value={a.question_count}
              />
              <Stat
                icon={<Clock className="size-4" />}
                label="Duration"
                value={`${a.duration_minutes}m`}
              />
              <Stat
                icon={<Target className="size-4" />}
                label="Pass Score"
                value={`${a.passing_score}%`}
              />
              <Stat
                icon={<Users className="size-4" />}
                label="Max Attempts"
                value={a.max_attempts}
              />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trophy className="size-3.5 text-amber-500" />
                <span className="font-semibold text-foreground">
                  {a.total_marks}
                </span>{" "}
                marks
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPreview(a)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="View Details"
                >
                  <Eye className="size-4" />
                </button>
                <button
                  onClick={() => onEdit(a)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Edit"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}