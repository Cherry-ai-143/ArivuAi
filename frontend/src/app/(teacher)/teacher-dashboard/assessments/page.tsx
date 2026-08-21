"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText } from "lucide-react";
import { AssessmentsList } from "@/components/teacher/assessments/assessments-list";
import { CreateAssessmentDialog } from "@/components/teacher/assessments/create-assessment-dialog";
import { getAssessments } from "@/lib/services/assessment.service";
import type { Assessment, AssessmentStatus } from "@/types/assessment";

const FILTER_TABS: { key: "all" | AssessmentStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "PUBLISHED", label: "Published" },
  { key: "DRAFT", label: "Draft" },
  { key: "ARCHIVED", label: "Archived" },
];

export default function AssessmentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<

    "all" | AssessmentStatus
  >("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);


  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await getAssessments();
      setAssessments(data);
    } catch (err) {
      console.error("Failed to load assessments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const handlePreview = (a: Assessment) => {
    router.push(`/teacher-dashboard/assessments/${a.id}`);
  };

  const handleEdit = (a: Assessment) => {
    setEditingAssessment(a);
  };


  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, configure, and publish assessments from your Question Bank.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110"
        >
          <Plus className="size-4" />
          Create Assessment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${statusFilter === tab.key
              ? "bg-primary text-primary-foreground shadow"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <AssessmentsList
          assessments={assessments}
          search={search}
          statusFilter={statusFilter}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onRefresh={loadAssessments}
        />
      )}

      {/* Create Dialog */}
      <CreateAssessmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={loadAssessments}
      />

      {/* Edit Dialog */}
      {editingAssessment && (
        <CreateAssessmentDialog
          open={!!editingAssessment}
          onOpenChange={(open) => {
            if (!open) setEditingAssessment(null);
          }}
          initialCourseId={editingAssessment.course_id}
          initialChapterId={editingAssessment.chapter_id}
          initialLessonId={editingAssessment.lesson_id}
          initialSelectedQuestionIds={editingAssessment.assessment_questions?.map((aq) => aq.question_id || aq.id)}
          onCreated={() => {
            setEditingAssessment(null);
            loadAssessments();
          }}
        />
      )}
    </div>
  );
}