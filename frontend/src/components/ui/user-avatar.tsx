"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

export function UserAvatar({
  name,
  src,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);

  let formattedSrc = src;
  if (src && src.startsWith("/uploads/")) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://127.0.0.1:8000";
    formattedSrc = `${apiHost}${src}`;
  }

  if (formattedSrc && formattedSrc.trim()) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full border border-border/50 shadow-sm flex-shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={formattedSrc}
          alt={name || "User Avatar"}
          fill
          unoptimized
          priority
          sizes="100px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-indigo-600 to-accent font-semibold text-white shadow-md ring-2 ring-background",
        sizeClasses[size],
        className
      )}
      aria-label={name || "User Avatar"}
    >
      <span>{initials}</span>
    </div>
  );
}
