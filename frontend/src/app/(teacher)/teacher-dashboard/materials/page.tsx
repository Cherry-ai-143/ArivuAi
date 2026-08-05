"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Video,
  Link as LinkIcon,
  Book,
  Zap,
  AlertTriangle,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";

import { CourseLessonSelector } from "@/components/teacher/materials/course-lesson-selector";
import { ResourceStatsOverview } from "@/components/teacher/materials/resource-stats-overview";
import { UploadResourceModal } from "@/components/teacher/materials/upload-resource-modal";
import { ResourcePreviewModal } from "@/components/teacher/materials/resource-preview-modal";
import { EditResourceModal } from "@/components/teacher/materials/edit-resource-modal";
import {
  useLessonResources,
  useUploadLessonResource,
  useUpdateLessonResource,
  useDeleteLessonResource,
} from "@/hooks/useLessonResources";
import { getLessonResourceDownloadUrl } from "@/lib/services/lesson-resource.service";
import type { LessonResource } from "@/types/lesson-resource";

const CATEGORIES = ["All", "PDF", "Video", "YouTube", "GitHub", "PPT", "Books", "Links"];

export default function MaterialsPage() {
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonContext, setLessonContext] = useState<{
    courseTitle: string;
    chapterTitle: string;
    lessonTitle: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<LessonResource | null>(null);
  const [editingResource, setEditingResource] = useState<LessonResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<LessonResource | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // React Query Hook
  const { data: resourcesGroup, isLoading, isError, refetch } = useLessonResources(
    selectedLessonId || undefined
  );

  const uploadMutation = useUploadLessonResource();
  const updateMutation = useUpdateLessonResource();
  const deleteMutation = useDeleteLessonResource();

  const allResources = useMemo(() => resourcesGroup?.all_resources || [], [resourcesGroup]);

  // Filter & Search logic
  const filteredResources = useMemo(() => {
    let result = [...allResources];

    if (activeCategory !== "All") {
      const cat = activeCategory.toLowerCase();
      result = result.filter((r) => {
        const type = (r.resource_type || "").toLowerCase();
        if (cat === "pdf") return type.includes("pdf") || type.includes("doc");
        if (cat === "video") return type.includes("video");
        if (cat === "youtube") return type.includes("youtube");
        if (cat === "github") return type.includes("github");
        if (cat === "ppt") return type.includes("ppt") || type.includes("powerpoint");
        if (cat === "books") return type.includes("book") || type.includes("reference");
        if (cat === "links") return type.includes("link") || type.includes("website");
        return type.includes(cat);
      });
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.author?.toLowerCase().includes(q) ||
          r.resource_type.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [allResources, activeCategory, debouncedSearch, sortBy]);

  // Actions
  const handleUploadSubmit = async (data: {
    title: string;
    resource_type: string;
    file?: File | null;
    url?: string | null;
    description?: string;
    author?: string;
  }) => {
    if (!selectedLessonId) return;
    try {
      await uploadMutation.mutateAsync({
        lessonId: selectedLessonId,
        data,
      });
      showToast("success", "Resource uploaded successfully!");
    } catch (err: any) {
      showToast("error", err.response?.data?.detail || "Failed to upload resource");
      throw err;
    }
  };

  const handleSaveEdit = async (data: {
    title?: string;
    resource_type?: string;
    url?: string;
    author?: string;
    description?: string;
  }) => {
    if (!editingResource || !selectedLessonId) return;
    try {
      await updateMutation.mutateAsync({
        lessonId: selectedLessonId,
        resourceId: editingResource.id,
        data,
      });
      setEditingResource(null);
      showToast("success", "Resource metadata updated!");
    } catch (err: any) {
      showToast("error", "Failed to update resource.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource || !selectedLessonId) return;
    try {
      await deleteMutation.mutateAsync({
        lessonId: selectedLessonId,
        resourceId: deletingResource.id,
      });
      setDeletingResource(null);
      showToast("success", "Resource deleted successfully!");
    } catch (err: any) {
      showToast("error", "Failed to delete resource.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center justify-between shadow-lg ${
            toastMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-xs opacity-70">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold uppercase">
              Study Materials Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">Lesson Resources</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Attach PDFs, presentations, videos, and GitHub repositories directly to academic lessons.
          </p>
        </div>

        {selectedLessonId && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all self-start sm:self-auto"
          >
            <Plus className="size-4" />
            + Add Resource
          </button>
        )}
      </div>

      {/* Academic Hierarchy Selector */}
      <CourseLessonSelector
        onLessonChange={(lessonId, details) => {
          setSelectedLessonId(lessonId);
          if (details) setLessonContext(details);
          else setLessonContext(null);
        }}
      />

      {/* Lesson Context Banner & Summary Stats */}
      {selectedLessonId && (
        <>
          <ResourceStatsOverview resources={allResources} />

          {/* Search, Filter & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Resource Grid / Loading / Empty */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-2xl border border-border bg-card p-5 animate-pulse space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-10 bg-muted/60 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <FileText className="mx-auto size-10 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">No Study Materials Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {debouncedSearch || activeCategory !== "All"
                  ? "No resources match your active search or category filter. Try clearing your search query."
                  : "No study materials have been uploaded to this lesson yet. Upload your first PDF, video, or presentation."}
              </p>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all mt-2"
              >
                <Plus className="size-4" />
                + Upload First Resource
              </button>
            </div>
          ) : (
            /* Resource Cards Grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((res) => {
                const downloadUrl = getLessonResourceDownloadUrl(res.lesson_id, res.id);
                const typeLower = (res.resource_type || "").toLowerCase();

                let Icon = FileText;
                let badgeColor = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
                if (typeLower.includes("video") || typeLower.includes("youtube")) {
                  Icon = Video;
                  badgeColor = "bg-purple-500/10 text-purple-600 border-purple-500/20";
                } else if (typeLower.includes("github") || typeLower.includes("link") || typeLower.includes("website")) {
                  Icon = LinkIcon;
                  badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                } else if (typeLower.includes("book")) {
                  Icon = Book;
                  badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                }

                return (
                  <div
                    key={res.id}
                    className="group relative rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md hover:border-accent/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground font-bold">
                            <Icon className="size-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground text-sm truncate">{res.title}</h4>
                            <p className="text-[11px] text-muted-foreground truncate">{res.author || "Author N/A"}</p>
                          </div>
                        </div>
                      </div>

                      {res.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border ${badgeColor}`}>
                          {res.resource_type || "File"}
                        </span>
                        {res.file_size && (
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {(res.file_size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-accent/80 border border-accent/20 rounded-md px-1.5 py-0.5 inline-flex items-center gap-1">
                          <Sparkles className="size-2.5" /> AI Ready
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewResource(res)}
                          className="p-1.5 text-accent hover:bg-accent/10 rounded-lg text-xs font-semibold flex items-center gap-1"
                          title="Preview Resource"
                        >
                          <Eye className="size-3.5" />
                          Preview
                        </button>
                        <a
                          href={downloadUrl}
                          download
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg text-xs font-semibold flex items-center gap-1"
                          title="Download Resource"
                        >
                          <Download className="size-3.5" />
                          Download
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingResource(res)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                          title="Edit Metadata"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingResource(res)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
                          title="Delete Resource"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Upload Resource Modal */}
      {selectedLessonId && (
        <UploadResourceModal
          isOpen={isUploadModalOpen}
          lessonId={selectedLessonId}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadSubmit}
          isUploading={uploadMutation.isPending}
        />
      )}

      {/* Resource Preview Modal */}
      <ResourcePreviewModal
        isOpen={Boolean(previewResource)}
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Edit Resource Modal */}
      <EditResourceModal
        isOpen={Boolean(editingResource)}
        resource={editingResource}
        onClose={() => setEditingResource(null)}
        onSave={handleSaveEdit}
        isSaving={updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {deletingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Delete Resource &quot;{deletingResource.title}&quot;?
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingResource(null)}
                disabled={deleteMutation.isPending}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-md"
              >
                {deleteMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Delete Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
