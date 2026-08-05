'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft, Plus, Trash2, GripVertical } from 'lucide-react';

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Question {
  id: string;
  type: 'mcq' | 'multiselect' | 'trueFalse' | 'fillBlank' | 'shortAnswer';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  marks?: number;
}

export function CreateQuizDialog({ open, onOpenChange }: CreateQuizDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [chapter, setChapter] = useState('');
  const [lesson, setLesson] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [passingPercentage, setPassingPercentage] = useState('60');
  const [timeLimit, setTimeLimit] = useState('60');
  const [attemptsAllowed, setAttemptsAllowed] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '1',
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    marks: 1,
  });
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: String(questions.length + 1),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      marks: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      const newQuestion = { ...question, id: String(Math.random()) };
      setQuestions([...questions, newQuestion]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  s <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div className={`flex-1 h-1 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Quiz Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 1: Quiz Details</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Quiz Title *</label>
              <Input
                placeholder="e.g., Python Fundamentals Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="Add a brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course *</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option>Select course...</option>
                  <option>Python Programming</option>
                  <option>Web Development</option>
                  <option>Data Science</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chapter</label>
                <Input placeholder="Optional" value={chapter} onChange={(e) => setChapter(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lesson</label>
                <Input placeholder="Optional" value={lesson} onChange={(e) => setLesson(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 2: Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Passing Percentage %</label>
                <Input
                  type="number"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Attempts Allowed</label>
                <Input
                  type="number"
                  value={attemptsAllowed}
                  onChange={(e) => setAttemptsAllowed(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Add Questions */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Step 3: Add Questions</h3>
              <Button onClick={addQuestion} size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            {questions.map((q) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="mcq">MCQ</option>
                      <option value="multiselect">Multiple Select</option>
                      <option value="trueFalse">True/False</option>
                      <option value="fillBlank">Fill Blank</option>
                      <option value="shortAnswer">Short Answer</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateQuestion(q.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ⋮
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Input
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                />

                {(q.type === 'mcq' || q.type === 'multiselect') && (
                  <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                      <Input
                        key={i}
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(q.options || [])];
                          newOptions[i] = e.target.value;
                          updateQuestion(q.id, { options: newOptions });
                        }}
                      />
                    ))}
                  </div>
                )}

                <Input
                  placeholder="Correct Answer / Explanation"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Marks</label>
                  <Input
                    type="number"
                    value={q.marks}
                    onChange={(e) => updateQuestion(q.id, { marks: parseInt(e.target.value) })}
                    className="w-20"
                  />
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500">No questions added yet. Click &quot;Add Question&quot; to start.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Assignment */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 4: Assign Students</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Assign to:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="assignTo" defaultChecked className="rounded" />
                  <span>Entire Course</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="assignTo" className="rounded" />
                  <span>Specific Chapter</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="assignTo" className="rounded" />
                  <span>Student Groups</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="assignTo" className="rounded" />
                  <span>Individual Students</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search Students</label>
              <Input placeholder="Search by name or email..." />
            </div>
            <div className="max-h-48 border border-gray-200 rounded-lg p-3 overflow-y-auto">
              <div className="space-y-2">
                {['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown'].map((name) => (
                  <label key={name} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Settings */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 5: Review & Settings</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Total Questions:</span> {questions.length}
              </p>
              <p className="text-sm">
                <span className="font-medium">Estimated Time:</span> {timeLimit} minutes
              </p>
              <p className="text-sm">
                <span className="font-medium">Passing Score:</span> {passingPercentage}%
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
                <span className="text-sm">Shuffle Questions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={shuffleAnswers} onChange={(e) => setShuffleAnswers(e.target.checked)} />
                <span className="text-sm">Shuffle Answers</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={negativeMarking} onChange={(e) => setNegativeMarking(e.target.checked)} />
                <span className="text-sm">Enable Negative Marking</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showCorrectAnswers} onChange={(e) => setShowCorrectAnswers(e.target.checked)} />
                <span className="text-sm">Show Correct Answers After Submission</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={allowMultipleAttempts} onChange={(e) => setAllowMultipleAttempts(e.target.checked)} />
                <span className="text-sm">Allow Multiple Attempts</span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < 5 ? (
              <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600">
                Publish Quiz
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
