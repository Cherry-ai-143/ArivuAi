"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import type { LessonResource } from "@/types/lesson-resource";

interface EditResourceModalProps {
  isOpen: boolean;
  resource: LessonResource | null;
  onClose: () => void;
  onSave: (data: {
    title?: string;
    resource_type?: string;
    url?: string;
    author?: string;
    description?: string;
  }) => Promise<void>;
  isSaving: boolean;
}

export function EditResourceModal({
  isOpen,
  resource,
  onClose,
  onSave,
  isSaving,
}: EditResourceModalProps) {
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || "");
      setResourceType(resource.resource_type || "PDF");
      setUrl(resource.url || "");
      setAuthor(resource.author || "");
      setDescription(resource.description || "");
    }
    setValidationError("");
  }, [resource, isOpen]);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Resource title cannot be empty.");
      return;
    }

    await onSave({
      title: title.trim(),
      resource_type: resourceType,
      url: url.trim() || undefined,
      author: author.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">Edit Resource Metadata</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {validationError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Resource Category
            </label>
            <input
              type="text"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              URL / Link
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
