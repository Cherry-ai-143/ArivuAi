'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RubricBuilder } from '@/components/teacher/assignments/rubric-builder';
import { assignmentApi } from '@/lib/api/assignments';
import apiClient from '@/lib/api/axios';
import { COURSES, LESSONS } from '@/lib/api/endpoints';
import {
  AssignmentDifficulty,
  AssignmentStatus,
  AssignmentType,
  GradingMethod,
  RubricCriterion,
} from '@/types/assignment';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const fromAi = searchParams.get('from_ai');

  // Courses & Lessons dropdowns
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [lessons, setLessons] = useState<{ id: number; title: string }[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [lessonId, setLessonId] = useState<number | ''>('');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('WRITTEN');
  const [difficulty, setDifficulty] = useState<AssignmentDifficulty>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);

  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  // Submission Config
  const [submissionMethods, setSubmissionMethods] = useState<('text' | 'file' | 'url')[]>(['text', 'file']);
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>(['pdf', 'docx', 'zip']);

  const [maxFileSizeMb, setMaxFileSizeMb] = useState(25);
  const [maxFilesCount, setMaxFilesCount] = useState(5);

  // Type-specific
  const [language, setLanguage] = useState('Python');
  const [allowRepoUrl, setAllowRepoUrl] = useState(true);
  const [allowZip, setAllowZip] = useState(true);
  const [requiredConcepts, setRequiredConcepts] = useState<string[]>([]);
  const [conceptInput, setConceptInput] = useState('');

  const [stepByStepRequired, setStepByStepRequired] = useState(true);
  const [calculatorAllowed, setCalculatorAllowed] = useState(false);

  const [minWordCount, setMinWordCount] = useState(500);
  const [citationFormat, setCitationFormat] = useState('APA');

  // Grading Config
  const [gradingMethod, setGradingMethod] = useState<GradingMethod>('RUBRIC');
  const [enableAiAssistance, setEnableAiAssistance] = useState(true);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    { criterion_name: 'Content Completeness', max_points: 40, description: 'Covers core problem scope', order_index: 0 },
    { criterion_name: 'Technical Depth & Quality', max_points: 40, description: 'Demonstrates clear accuracy', order_index: 1 },
    { criterion_name: 'Presentation & Style', max_points: 20, description: 'Well formatted and structured', order_index: 2 },
  ]);

  // Loading & Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses
  useEffect(() => {
    apiClient.get(COURSES).then((res) => {
      setCourses(res.data);
      if (!courseId && res.data.length > 0) {
        setCourseId(res.data[0].id);
      }
    }).catch(() => {});
  }, []);

  // Fetch lessons when course changes
  useEffect(() => {
    if (courseId) {
      apiClient.get(`${LESSONS}`, { params: { course_id: courseId } }).then((res) => {
        setLessons(res.data);
      }).catch(() => setLessons([]));
    }
  }, [courseId]);

  // Load existing assignment if editing OR AI generated draft if from_ai
  useEffect(() => {
    if (editId) {
      assignmentApi.getDetail(editId).then((data) => {
        setTitle(data.title);
        setCourseId(data.course_id);
        setLessonId(data.lesson_id || '');
        setAssignmentType(data.assignment_type);
        setDifficulty(data.difficulty);
        setMaxPoints(data.max_points);
        if (data.due_date) {
          setDueDate(new Date(data.due_date).toISOString().slice(0, 16));
        }
        setDescription(data.description);
        setInstructions(data.instructions);

        if (data.submission_config) {
          setSubmissionMethods(data.submission_config.allowed_methods || ['text', 'file']);
          setAllowedFileTypes(data.submission_config.allowed_file_types || ['pdf', 'docx', 'zip']);
          setMaxFileSizeMb(data.submission_config.max_file_size_mb || 25);
          setMaxFilesCount(data.submission_config.max_files_count || 5);
        }

        if (data.type_config) {
          if (data.type_config.language) setLanguage(data.type_config.language);
          if (data.type_config.required_concepts) setRequiredConcepts(data.type_config.required_concepts);
          if (data.type_config.min_word_count) setMinWordCount(data.type_config.min_word_count);
        }

        if (data.grading_config) {
          setGradingMethod(data.grading_config.grading_method || 'RUBRIC');
          setEnableAiAssistance(data.grading_config.enable_ai_assistance ?? true);
        }

        if (data.rubric_criteria && data.rubric_criteria.length > 0) {
          setRubricCriteria(data.rubric_criteria);
        }
      });
    } else if (fromAi && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ai_generated_assignment');
      if (stored) {
        try {
          const aiData = JSON.parse(stored);
          setTitle(aiData.title || '');
          if (aiData.course_id) setCourseId(aiData.course_id);
          if (aiData.lesson_id) setLessonId(aiData.lesson_id);
          setAssignmentType(aiData.assignment_type || 'WRITTEN');
          setDifficulty(aiData.difficulty || 'MEDIUM');
          setMaxPoints(aiData.max_points || 100);
          setDescription(aiData.description || '');

          let fullInstructions = aiData.instructions || '';
          if (aiData.tasks && Array.isArray(aiData.tasks) && aiData.tasks.length > 0) {
            fullInstructions += '\n\n### Tasks & Requirements:\n';
            aiData.tasks.forEach((t: any, idx: number) => {
              fullInstructions += `\n${idx + 1}. **${t.title || 'Task ' + (idx + 1)}** (${t.points || 0} pts)\n   ${t.description || ''}`;
            });
          }
          setInstructions(fullInstructions);

          if (aiData.submission_config) {
            if (aiData.submission_config.allowed_methods) setSubmissionMethods(aiData.submission_config.allowed_methods);
            if (aiData.submission_config.allowed_file_types) setAllowedFileTypes(aiData.submission_config.allowed_file_types);
            if (aiData.submission_config.max_file_size_mb) setMaxFileSizeMb(aiData.submission_config.max_file_size_mb);
            if (aiData.submission_config.max_files_count) setMaxFilesCount(aiData.submission_config.max_files_count);
          }

          if (aiData.type_config) {
            if (aiData.type_config.language) setLanguage(aiData.type_config.language);
            if (aiData.type_config.required_concepts) setRequiredConcepts(aiData.type_config.required_concepts);
            if (aiData.type_config.min_word_count) setMinWordCount(aiData.type_config.min_word_count);
          }

          if (aiData.rubric_criteria && aiData.rubric_criteria.length > 0) {
            setRubricCriteria(aiData.rubric_criteria);
          }

          // Clear sessionStorage after loading
          sessionStorage.removeItem('ai_generated_assignment');
        } catch (e) {
          console.error('Failed to parse AI assignment draft from sessionStorage:', e);
        }
      }
    }
  }, [editId, fromAi]);


  const toggleMethod = (method: 'text' | 'file' | 'url') => {
    if (submissionMethods.includes(method)) {
      if (submissionMethods.length > 1) {
        setSubmissionMethods(submissionMethods.filter((m) => m !== method));
      }
    } else {
      setSubmissionMethods([...submissionMethods, method]);
    }
  };


  const toggleFileType = (ext: string) => {
    if (allowedFileTypes.includes(ext)) {
      setAllowedFileTypes(allowedFileTypes.filter((t) => t !== ext));
    } else {
      setAllowedFileTypes([...allowedFileTypes, ext]);
    }
  };

  const handleAddConcept = () => {
    if (conceptInput.trim() && !requiredConcepts.includes(conceptInput.trim())) {
      setRequiredConcepts([...requiredConcepts, conceptInput.trim()]);
      setConceptInput('');
    }
  };

  const handleRemoveConcept = (concept: string) => {
    setRequiredConcepts(requiredConcepts.filter((c) => c !== concept));
  };

  const handleSubmitForm = async (targetStatus: AssignmentStatus) => {
    if (!title.trim()) {
      setError('Assignment Title is required');
      return;
    }
    if (!courseId) {
      setError('Please select a course');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!instructions.trim()) {
      setError('Instructions are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title,
      course_id: Number(courseId),
      lesson_id: lessonId ? Number(lessonId) : null,
      assignment_type: assignmentType,
      difficulty,
      max_points: Number(maxPoints),
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      description,
      instructions,
      status: targetStatus,

      submission_config: {
        allowed_methods: submissionMethods,
        allowed_file_types: allowedFileTypes,
        max_file_size_mb: Number(maxFileSizeMb),
        max_files_count: Number(maxFilesCount),
      },

      type_config: {
        language,
        allow_repo_url: allowRepoUrl,
        allow_zip: allowZip,
        required_concepts: requiredConcepts,
        step_by_step_required: stepByStepRequired,
        calculator_allowed: calculatorAllowed,
        min_word_count: minWordCount,
        citation_format: citationFormat,
      },

      grading_config: {
        grading_method: gradingMethod,
        enable_ai_assistance: enableAiAssistance,
      },

      rubric_criteria: rubricCriteria,
    };

    try {
      if (editId) {
        await assignmentApi.update(editId, payload);
      } else {
        await assignmentApi.create(payload);
      }
      router.push('/teacher-dashboard/assignments');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save assignment.');
    } finally {
      setIsSubmitting(false);
      setPublishModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/teacher-dashboard/assignments">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editId ? 'Edit Assignment' : 'Create Assignment'}
            </h1>
            <p className="text-xs text-gray-500">
              Define instructions, submission requirements, and rubric criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmitForm('DRAFT')}
            disabled={isSubmitting}
            className="gap-2 border-gray-300"
          >
            <Save className="w-4 h-4" /> Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-semibold shadow-sm"
          >
            <Send className="w-4 h-4" /> Publish Assignment
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Main Form Sections */}
      <div className="space-y-6">
        {/* SECTION 1: Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Assignment Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Python OOP Project"
                className="h-10 text-sm font-medium"
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Course *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Lesson / Topic */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Lesson / Topic (Optional)
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value ? Number(e.target.value) : '')}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
              >
                <option value="">None (Course-level)</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Assignment Type *
              </label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value as AssignmentType)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
              >
                <option value="WRITTEN">Written Response</option>
                <option value="PROBLEM_SOLVING">Problem Solving</option>
                <option value="PROGRAMMING">Programming</option>
                <option value="PROJECT">Project</option>
                <option value="RESEARCH">Research / Report</option>
                <option value="CREATIVE">Creative / Presentation</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as AssignmentDifficulty)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Due Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Max Points */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Max Points *
              </label>
              <Input
                type="number"
                min={1}
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value))}
                className="h-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Description & Instructions */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            2. Description & Instructions
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description Overview *
            </label>
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Explain what the assignment is about..."
              rows={2}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Detailed Student Instructions *
            </label>
            <Textarea
              value={instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
              placeholder="1. Create at least four classes.&#10;2. Demonstrate inheritance.&#10;3. Implement polymorphism..."
              rows={6}
              className="text-sm font-mono"
            />

          </div>
        </div>

        {/* SECTION 3: Submission Requirements */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            3. Submission Requirements
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Allowed Submission Methods *
            </label>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { key: 'text', label: 'Text Response' },
                  { key: 'file', label: 'File Upload' },
                  { key: 'url', label: 'External URL / Repository Link' },
                ] as const
              ).map((m) => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => toggleMethod(m.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    submissionMethods.includes(m.key)
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}

            </div>
          </div>

          {submissionMethods.includes('file') && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Allowed File Formats
                </label>
                <div className="flex flex-wrap gap-2">
                  {['pdf', 'docx', 'pptx', 'xlsx', 'zip', 'png', 'jpg', 'mp4'].map((ext) => (
                    <button
                      type="button"
                      key={ext}
                      onClick={() => toggleFileType(ext)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                        allowedFileTypes.includes(ext)
                          ? 'bg-orange-100 text-orange-700 border border-orange-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      .{ext}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Max File Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={maxFileSizeMb}
                    onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Max File Count
                  </label>
                  <Input
                    type="number"
                    value={maxFilesCount}
                    onChange={(e) => setMaxFilesCount(Number(e.target.value))}
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Type-Specific Configuration */}
        {assignmentType === 'PROGRAMMING' && (
          <div className="bg-white p-6 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">
              4. Programming Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Programming Language
                </label>
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Python, Java, TypeScript"
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Required Concepts
                </label>
                <div className="flex gap-2">
                  <Input
                    value={conceptInput}
                    onChange={(e) => setConceptInput(e.target.value)}
                    placeholder="e.g. Inheritance"
                    className="h-10 text-sm"
                  />
                  <Button type="button" onClick={handleAddConcept} size="sm" className="h-10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {requiredConcepts.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      {c}
                      <button type="button" onClick={() => handleRemoveConcept(c)}>
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Grading Config & Rubric */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            5. Grading Configuration & Rubric
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Grading Method
              </label>
              <select
                value={gradingMethod}
                onChange={(e) => setGradingMethod(e.target.value as GradingMethod)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
              >
                <option value="MANUAL">Manual Grading</option>
                <option value="RUBRIC">Rubric Grading</option>
                <option value="AI_ASSISTED">AI-Assisted Grading</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="aiCheck"
                checked={enableAiAssistance}
                onChange={(e) => setEnableAiAssistance(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="aiCheck" className="text-sm font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Enable AI Grading Assistance ("Analyze with AI")
              </label>
            </div>
          </div>

          <RubricBuilder
            criteria={rubricCriteria}
            onChange={setRubricCriteria}
            maxPoints={maxPoints}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Publish Assignment?</h3>
            <p className="text-sm text-gray-600">
              Once published, students enrolled in this course will be able to view and submit this assignment.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPublishModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmitForm('ACTIVE')}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Publish'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
