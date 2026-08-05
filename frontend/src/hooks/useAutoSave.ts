import { useState, useEffect, useRef, useCallback } from "react";
import type { AutoSaveStatus } from "@/types/course-builder";

export function useAutoSave(onSaveCallback?: () => Promise<void>, delayMs = 2000) {
  const [status, setStatus] = useState<AutoSaveStatus>("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const markDirty = useCallback(() => {
    setStatus("unsaved");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        if (onSaveCallback) {
          await onSaveCallback();
        }
        setStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        setStatus("failed");
      }
    }, delayMs);
  }, [delayMs, onSaveCallback]);

  const triggerSaveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    try {
      if (onSaveCallback) {
        await onSaveCallback();
      }
      setStatus("saved");
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setStatus("failed");
    }
  }, [onSaveCallback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    status,
    lastSavedTime,
    isLocked: status === "saving",
    markDirty,
    triggerSaveNow,
  };
}
