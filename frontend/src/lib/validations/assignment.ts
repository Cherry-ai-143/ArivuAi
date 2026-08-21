import { z } from 'zod';

export const rubricCriterionSchema = z.object({
  id: z.number().optional(),
  criterion_name: z.string().min(1, 'Criterion name is required'),
  max_points: z.number().gt(0, 'Max points must be greater than 0'),
  description: z.string().optional(),
  order_index: z.number().default(0),
});

export const assignmentFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  course_id: z.number().min(1, 'Please select a course'),

  lesson_id: z.number().nullable().optional(),
  assignment_type: z.enum([
    'WRITTEN',
    'PROBLEM_SOLVING',
    'PROGRAMMING',
    'PROJECT',
    'RESEARCH',
    'CREATIVE',
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  max_points: z.number().gt(0, 'Max points must be greater than 0'),
  due_date: z.string().min(1, 'Due date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),

  // Submission Requirements
  submission_methods: z.array(z.string()).min(1, 'At least one submission method must be selected'),
  allowed_file_types: z.array(z.string()).optional(),
  max_file_size_mb: z.number().default(25),
  max_files_count: z.number().default(5),

  // Type-specific
  language: z.string().optional(),
  allow_repo_url: z.boolean().optional(),
  allow_zip: z.boolean().optional(),
  required_concepts: z.array(z.string()).optional(),
  step_by_step_required: z.boolean().optional(),
  calculator_allowed: z.boolean().optional(),
  min_word_count: z.number().optional(),
  max_word_count: z.number().optional(),
  citation_format: z.string().optional(),

  // Grading Config
  grading_method: z.enum(['MANUAL', 'RUBRIC', 'AI_ASSISTED']),
  enable_ai_assistance: z.boolean().default(true),
  rubric_criteria: z.array(rubricCriterionSchema).optional(),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export const submissionFormSchema = z.object({
  text_response: z.string().optional(),
  external_url: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  file_ids: z.array(z.any()).optional(),
});

export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;
