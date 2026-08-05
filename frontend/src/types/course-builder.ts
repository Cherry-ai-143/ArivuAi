export interface CourseValidationChecklist {
  hasTitle: boolean;
  hasDescription: boolean;
  hasThumbnail: boolean;
  hasChapters: boolean;
  hasLessons: boolean;
  hasResources: boolean;
  isReadyToPublish: boolean;
  missingItems: string[];
}

export interface CourseCompletionProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
}

export interface CourseStatisticsSummary {
  totalChapters: number;
  totalLessons: number;
  totalResources: number;
  pdfCount: number;
  videoCount: number;
  linkCount: number;
  bookCount: number;
  totalStorageBytes: number;
}

export type AutoSaveStatus = "unsaved" | "saving" | "saved" | "failed";
