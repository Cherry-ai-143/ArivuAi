import type { CurrentUser } from "./auth";

export type EducationLevel =
  | "Higher School (Class 7–10)"
  | "PUC / 11th–12th"
  | "Diploma"
  | "Undergraduate (Degree)"
  | "Engineering"
  | "Postgraduate"
  | "Other";

export type TeacherInstitutionType =
  | "School (Class 7–10)"
  | "PUC / 11th–12th"
  | "Degree College"
  | "Engineering College"
  | "Coaching Institute"
  | "University"
  | "Other";

export interface UserProfileDetails {
  // Student & Shared fields
  education?: EducationLevel | string;
  institutionName?: string;
  classLevel?: string;
  board?: string;
  stream?: string;
  scienceFocus?: string;
  degree?: string;
  program?: string;
  course?: string;
  branch?: string;
  semester?: string;
  learningInterests?: string[];
  goals?: string[];
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  hasCompletedOnboarding?: boolean;
  createdAt?: string;

  // Teacher-specific fields
  institutionType?: TeacherInstitutionType | string;
  designation?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  classesTeaching?: string;
  teachingCategory?: string;
  subjects?: string[];
  teachingGoals?: string[];
  researchInterests?: string;
  officeHours?: string;
  linkedIn?: string;
}

export interface ProfileCompletionStatus {
  percentage: number;
  missingItems: { key: string; label: string; actionUrl?: string }[];
}

export function calculateProfileCompletion(
  user: CurrentUser | null,
  profile: UserProfileDetails | null
): ProfileCompletionStatus {
  const missingItems: { key: string; label: string; actionUrl?: string }[] = [];
  const isTeacher = user?.role === "teacher";

  // Check required values from either user (backend source) or profile (fallback)
  const fullName = user?.full_name?.trim();
  const email = user?.email?.trim();
  const avatar = user?.avatar_url?.trim() || profile?.avatarUrl?.trim();
  const bio = user?.bio?.trim() || profile?.bio?.trim();
  const institution = user?.institution_name?.trim() || profile?.institutionName?.trim();
  const institutionType = user?.institution_type?.trim() || profile?.institutionType?.trim();
  const educationLevel = user?.education_level?.trim() || profile?.education?.trim();
  const isOnboarded = user?.onboarding_completed ?? profile?.hasCompletedOnboarding ?? false;

  const interests = (user?.interests?.length ? user.interests : profile?.learningInterests) || [];
  const subjects = (user?.interests?.length ? user.interests : profile?.subjects) || interests;
  const goals = (user?.goals?.length ? user.goals : (profile?.teachingGoals?.length ? profile.teachingGoals : profile?.goals)) || [];

  let requiredFields: { key: string; label: string; isFilled: boolean; weight: number }[] = [];

  if (isTeacher) {
    const designation = user?.designation?.trim() || profile?.designation?.trim();
    const department = user?.department?.trim() || profile?.department?.trim();
    const qualification = user?.qualification?.trim() || profile?.qualification?.trim();
    const experience = user?.years_of_experience?.trim() || profile?.experience?.trim();

    requiredFields = [
      { key: "full_name", label: "Full Name", isFilled: Boolean(fullName), weight: 10 },
      { key: "email", label: "Email Address", isFilled: Boolean(email), weight: 5 },
      { key: "avatar", label: "Profile Picture", isFilled: Boolean(avatar), weight: 10 },
      { key: "institution_type", label: "Institution Type", isFilled: Boolean(institutionType), weight: 10 },
      { key: "institution_name", label: "Institution Name", isFilled: Boolean(institution), weight: 10 },
      { key: "designation", label: "Designation", isFilled: Boolean(designation), weight: 5 },
      { key: "department", label: "Department / Stream", isFilled: Boolean(department), weight: 5 },
      { key: "qualification", label: "Highest Qualification", isFilled: Boolean(qualification), weight: 5 },
      { key: "experience", label: "Years of Experience", isFilled: Boolean(experience), weight: 5 },
      { key: "subjects", label: "Subjects Taught", isFilled: subjects.length > 0, weight: 10 },
      { key: "goals", label: "Teaching Goals", isFilled: goals.length > 0, weight: 10 },
      { key: "bio", label: "Bio / Summary", isFilled: Boolean(bio), weight: 10 },
      { key: "onboarding", label: "Onboarding Completion", isFilled: Boolean(isOnboarded), weight: 5 },
    ];
  } else {
    const course = user?.course?.trim() || profile?.course?.trim() || profile?.classLevel?.trim();
    const branch = user?.branch?.trim() || profile?.branch?.trim();

    requiredFields = [
      { key: "full_name", label: "Full Name", isFilled: Boolean(fullName), weight: 10 },
      { key: "email", label: "Email Address", isFilled: Boolean(email), weight: 5 },
      { key: "avatar", label: "Profile Picture", isFilled: Boolean(avatar), weight: 10 },
      { key: "education_level", label: "Education Level", isFilled: Boolean(educationLevel), weight: 10 },
      { key: "institution_name", label: "Institution Name", isFilled: Boolean(institution), weight: 10 },
      { key: "course", label: "Course / Stream", isFilled: Boolean(course), weight: 10 },
      { key: "branch", label: "Branch / Specialization", isFilled: Boolean(branch), weight: 5 },
      { key: "interests", label: "Learning Interests", isFilled: interests.length > 0, weight: 10 },
      { key: "goals", label: "Learning Goals", isFilled: goals.length > 0, weight: 10 },
      { key: "bio", label: "Bio / Summary", isFilled: Boolean(bio), weight: 15 },
      { key: "onboarding", label: "Onboarding Completion", isFilled: Boolean(isOnboarded), weight: 5 },
    ];
  }

  let totalWeight = 0;
  let earnedScore = 0;

  for (const field of requiredFields) {
    totalWeight += field.weight;
    if (field.isFilled) {
      earnedScore += field.weight;
    } else {
      missingItems.push({ key: field.key, label: `Add ${field.label}` });
    }
  }

  let percentage = Math.round((earnedScore / totalWeight) * 100);

  // NEVER display 100% unless EVERY required field exists AND onboarding is completed
  if (missingItems.length > 0 || !isOnboarded) {
    percentage = Math.min(percentage, 95);
  }

  return {
    percentage,
    missingItems,
  };
}
