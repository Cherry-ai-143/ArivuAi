"use client";

import { useState } from "react";
import { Upload, X, Link as LinkIcon, FileText, Loader2, Check } from "lucide-react";
import type { ResourceType } from "@/types/lesson-resource";

interface UploadResourceModalProps {
  isOpen: boolean;
  lessonId: number;
  onClose: () => void;
  onUpload: (data: {
    title: string;
    resource_type: string;
    file?: File | null;
    url?: string | null;
    description?: string;
    author?: string;
  }) => Promise<void>;
  isUploading: boolean;
}

const RESOURCE_TYPES: { label: string; value: ResourceType }[] = [
  { label: "PDF Document", value: "PDF" },
  { label: "PowerPoint Presentation", value: "PowerPoint" },
  { label: "Word Document", value: "Word" },
  { label: "Video Lecture", value: "Video" },
  { label: "Image / Diagram", value: "Image" },
  { label: "ZIP Archive", value: "ZIP" },
  { label: "YouTube Video Link", value: "YouTube" },
  { label: "GitHub Repository", value: "GitHub" },
  { label: "Website Link", value: "Website" },
  { label: "Reference Book", value: "Reference Book" },
];

export function UploadResourceModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}: UploadResourceModalProps) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<string>("PDF");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState("");

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    // 50MB size limit validation
    if (file.size > 50 * 1024 * 1024) {
      setValidationError("File size exceeds 50MB limit.");
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim()) {
      setValidationError("Resource Title is required.");
      return;
    }

    if (tab === "file" && !selectedFile) {
      setValidationError("Please select a file to upload.");
      return;
    }

    if (tab === "url" && !url.trim()) {
      setValidationError("Please enter a valid URL.");
      return;
    }

    // Simulate progress
    setUploadProgress(25);
    const timer1 = setTimeout(() => setUploadProgress(65), 300);
    const timer2 = setTimeout(() => setUploadProgress(90), 700);

    try {
      await onUpload({
        title: title.trim(),
        resource_type: resourceType,
        file: tab === "file" ? selectedFile : null,
        url: tab === "url" ? url.trim() : null,
        description: description.trim() || undefined,
        author: author.trim() || undefined,
      });
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setTitle("");
        setUrl("");
        setSelectedFile(null);
        setDescription("");
        onClose();
      }, 300);
    } catch (err: any) {
      setUploadProgress(0);
      setValidationError(err.response?.data?.detail || "Failed to upload resource.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight">Attach Study Resource</h3>
              <p className="text-xs text-muted-foreground">Upload files or link web resources</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "file" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "url" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            External Link / URL
          </button>
        </div>

        {validationError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "file" ? (
            /* Drag & Drop File Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : selectedFile
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-border bg-muted/20 hover:border-primary/50"
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3 text-left min-w-0">
                    <FileText className="size-8 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto size-8 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">Drag & Drop file here, or click to browse</p>
                  <p className="text-[11px] text-muted-foreground">PDF, PPTX, DOCX, MP4, PNG, ZIP (Max 50MB)</p>
                  <label className="inline-block cursor-pointer rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20">
                    Browse File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            /* External URL Input */
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <LinkIcon className="size-3 text-primary" /> External URL / Link *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://github.com/..."
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Arrays & Pointers Study Guide"
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Resource Category *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for students..."
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>Uploading study material...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Save Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
