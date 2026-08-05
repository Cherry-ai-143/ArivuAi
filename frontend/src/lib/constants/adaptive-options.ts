export function getSubjectOptionsForInstitution(institutionType?: string, educationLevel?: string): string[] {
  const type = (institutionType || educationLevel || "").toLowerCase();

  if (type.includes("engineering")) {
    return [
      "Python",
      "Java",
      "C",
      "C++",
      "Data Structures",
      "Algorithms",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
      "AI",
      "Machine Learning",
      "Deep Learning",
      "Cloud Computing",
      "Cyber Security",
      "Software Engineering",
      "React",
      "Node.js",
      "SQL",
      "MongoDB",
      "System Design",
    ];
  }

  if (type.includes("degree") || type.includes("undergraduate") || type.includes("b.tech") || type.includes("bca") || type.includes("bsc")) {
    return [
      "Programming",
      "Python",
      "Java",
      "C",
      "DBMS",
      "Web Development",
      "Data Analytics",
      "Artificial Intelligence",
      "Software Engineering",
      "Accountancy",
      "Economics",
      "Business Studies",
      "Statistics",
      "Digital Marketing",
      "Communication Skills",
    ];
  }

  if (type.includes("puc") || type.includes("higher secondary") || type.includes("11th") || type.includes("12th")) {
    return [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "Computer Science",
      "Statistics",
      "Electronics",
      "English",
      "Kannada",
      "Accountancy",
      "Economics",
      "Business Studies",
      "KCET",
      "NEET",
      "JEE Main",
    ];
  }

  if (type.includes("school") || type.includes("class 7") || type.includes("class 10") || type.includes("high school")) {
    return [
      "Mathematics",
      "Science",
      "Social Science",
      "English",
      "Kannada",
      "Hindi",
      "Computer Basics",
      "General Knowledge",
      "Environmental Science",
    ];
  }

  if (type.includes("coaching") || type.includes("neet") || type.includes("jee") || type.includes("exam")) {
    return [
      "Biology",
      "Chemistry",
      "Physics",
      "Mathematics",
      "KCET",
      "NEET",
      "JEE Main",
      "JEE Advanced",
      "UPSC",
      "GATE",
      "CAT",
      "Banking",
      "SSC",
    ];
  }

  if (type.includes("university")) {
    return [
      "Research & Innovation",
      "Artificial Intelligence",
      "Machine Learning",
      "Data Structures",
      "System Design",
      "Cloud Computing",
      "Cyber Security",
      "Advanced Mathematics",
      "Algorithms",
      "Project Management",
    ];
  }

  return [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Programming",
    "Python",
    "Java",
    "AI & ML",
    "Data Structures",
    "Communication Skills",
    "Research",
    "Business Strategy",
  ];
}

export const TEACHER_GOAL_OPTIONS = [
  "Improve Student Performance",
  "AI Assisted Teaching",
  "Create Better Assessments",
  "Competitive Exam Preparation",
  "Industry Readiness",
  "Research Guidance",
  "Practical Learning",
  "Placement Preparation",
  "Higher Education Preparation",
  "Skill Development",
];

export const STUDENT_GOAL_OPTIONS = [
  "Master Academic Subjects",
  "Score High in Exams",
  "Prepare for Competitive Exams (KCET/NEET/JEE)",
  "Placement & Career Readiness",
  "Learn Programming & AI",
  "Build Practical Projects",
  "Upskill & Certification",
];
