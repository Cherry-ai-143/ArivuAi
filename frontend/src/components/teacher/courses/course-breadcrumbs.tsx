"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface CourseBreadcrumbsProps {
  courseTitle?: string;
  chapterTitle?: string;
  lessonTitle?: string;
}

export function CourseBreadcrumbs({
  courseTitle,
  chapterTitle,
  lessonTitle,
}: CourseBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium overflow-x-auto pb-1">
      <Link
        href="/teacher-dashboard/courses"
        className="flex items-center gap-1 hover:text-foreground transition-colors flex-shrink-0"
      >
        <Home className="size-3.5" />
        My Courses
      </Link>

      {courseTitle && (
        <>
          <ChevronRight className="size-3 flex-shrink-0 opacity-60" />
          <span className="text-foreground font-bold truncate max-w-[150px] sm:max-w-[200px]">
            {courseTitle}
          </span>
        </>
      )}

      {chapterTitle && (
        <>
          <ChevronRight className="size-3 flex-shrink-0 opacity-60" />
          <span className="truncate max-w-[120px] sm:max-w-[180px]">{chapterTitle}</span>
        </>
      )}

      {lessonTitle && (
        <>
          <ChevronRight className="size-3 flex-shrink-0 opacity-60" />
          <span className="text-primary font-bold truncate max-w-[120px] sm:max-w-[180px]">
            {lessonTitle}
          </span>
        </>
      )}
    </nav>
  );
}
