"use client";

import { useMemo } from "react";
import { FileText, Video, Link as LinkIcon, Book, HardDrive, Layers } from "lucide-react";
import type { LessonResource } from "@/types/lesson-resource";

interface ResourceStatsOverviewProps {
  resources: LessonResource[];
}

export function ResourceStatsOverview({ resources }: ResourceStatsOverviewProps) {
  const stats = useMemo(() => {
    let totalCount = resources.length;
    let pdfCount = 0;
    let videoCount = 0;
    let linkCount = 0;
    let bookCount = 0;
    let totalBytes = 0;

    resources.forEach((r) => {
      const type = (r.resource_type || "").toLowerCase();
      if (type.includes("pdf") || type.includes("docx") || type.includes("doc")) pdfCount++;
      else if (type.includes("video") || type.includes("youtube")) videoCount++;
      else if (type.includes("book") || type.includes("reference")) bookCount++;
      else if (type.includes("link") || type.includes("github") || type.includes("website")) linkCount++;
      else pdfCount++;

      if (r.file_size) totalBytes += r.file_size;
    });

    const formattedBytes =
      totalBytes > 1024 * 1024
        ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(totalBytes / 1024)} KB`;

    return {
      totalCount,
      pdfCount,
      videoCount,
      linkCount,
      bookCount,
      formattedBytes,
    };
  }, [resources]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Resources */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total</span>
          <Layers className="size-4 text-primary" />
        </div>
        <p className="text-xl font-bold text-foreground">{stats.totalCount}</p>
      </div>

      {/* PDFs & Documents */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider">PDF & Docs</span>
          <FileText className="size-4 text-indigo-500" />
        </div>
        <p className="text-xl font-bold text-foreground">{stats.pdfCount}</p>
      </div>

      {/* Videos */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Videos</span>
          <Video className="size-4 text-accent" />
        </div>
        <p className="text-xl font-bold text-foreground">{stats.videoCount}</p>
      </div>

      {/* External Links */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Links</span>
          <LinkIcon className="size-4 text-emerald-500" />
        </div>
        <p className="text-xl font-bold text-foreground">{stats.linkCount}</p>
      </div>

      {/* Books */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Books</span>
          <Book className="size-4 text-amber-500" />
        </div>
        <p className="text-xl font-bold text-foreground">{stats.bookCount}</p>
      </div>

      {/* Storage Used */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Storage</span>
          <HardDrive className="size-4 text-primary" />
        </div>
        <p className="text-xl font-bold text-foreground">{stats.formattedBytes}</p>
      </div>
    </div>
  );
}
