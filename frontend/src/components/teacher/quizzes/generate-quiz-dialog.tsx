'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft, Sparkles, Edit2, Trash2, RefreshCw } from 'lucide-react';

interface GenerateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficulty?: string;
  isApproved?: boolean;
}

export function GenerateQuizDialog({ open, onOpenChange }: GenerateQuizDialogProps) {
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState('course');
  const [numQuestions, setNumQuestions] = useState('20');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    trueFalse: false,
    fillBlank: false,
    shortAnswer: false,
  });
  const [bloomsLevel, setBloomsLevel] = useState('all');
  const [language, setLanguage] = useState('english');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuestion[]>([
    {
      id: '1',
      question: 'What is the primary purpose of using variables in programming?',
      options: ['To store data values', 'To create functions', 'To define classes', 'To handle errors'],
      correctAnswer: 'To store data values',
      explanation: 'Variables are used to store and manage data values in a program.',
      difficulty: 'Easy',
      isApproved: true,
    },
    {
      id: '2',
      question: 'Which of the following is a valid Python identifier?',
      options: ['2variable', '_variable', 'class', 'for'],
      correctAnswer: '_variable',
      explanation: 'Python identifiers must start with a letter or underscore, not a number.',
      difficulty: 'Medium',
      isApproved: false,
    },
  ]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);

  const handleNext = () => {
    if (step === 2) {
      // Simulate AI generation
      setIsGenerating(true);
      setStep(3);
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          setGenerationProgress(100);
          clearInterval(interval);
          setIsGenerating(false);
          setTimeout(() => setStep(4), 1000);
        } else {
          setGenerationProgress(progress);
        }
      }, 800);
    } else if (step < 6) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setGenerationProgress(0);
  };

  const toggleQuestionType = (type: keyof typeof questionTypes) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const approveQuestion = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: true } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const regenerateQuestion = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: false } : q))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Generate Quiz with AI
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 6 && (
                <div className={`flex-1 h-1 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Source */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 1: Select Source</h3>
            <p className="text-sm text-muted-foreground">Choose where to generate quiz questions from:</p>

            <div className="space-y-3">
              {[
                { value: 'course', label: 'From Course', desc: 'Generate from entire course' },
                { value: 'chapter', label: 'From Chapter', desc: 'Generate from specific chapter' },
                { value: 'lesson', label: 'From Lesson', desc: 'Generate from specific lesson' },
                { value: 'pdf', label: 'Upload PDF', desc: 'Upload PDF materials' },
                { value: 'ppt', label: 'Upload PowerPoint', desc: 'Upload presentation' },
                { value: 'questionBank', label: 'Question Bank', desc: 'From existing questions' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="source"
                    value={option.value}
                    checked={sourceType === option.value}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-gray-600">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {sourceType !== 'pdf' && sourceType !== 'ppt' && sourceType !== 'docx' && (
              <div>
                <label className="block text-sm font-medium mb-2">Select {sourceType}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Choose {sourceType}...</option>
                  <option>Python Programming 101</option>
                  <option>Web Development Basics</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Configuration */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 2: AI Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                <Input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  min="5"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Question Types</label>
              <div className="space-y-2">
                {[
                  { key: 'mcq', label: 'Multiple Choice' },
                  { key: 'trueFalse', label: 'True/False' },
                  { key: 'fillBlank', label: 'Fill in the Blank' },
                  { key: 'shortAnswer', label: 'Short Answer' },
                ].map((type) => (
                  <label key={type.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={questionTypes[type.key as keyof typeof questionTypes]}
                      onChange={() => toggleQuestionType(type.key as keyof typeof questionTypes)}
                      className="rounded"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bloom&apos;s Taxonomy</label>
                <select
                  value={bloomsLevel}
                  onChange={(e) => setBloomsLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="remember">Remember</option>
                  <option value="understand">Understand</option>
                  <option value="apply">Apply</option>
                  <option value="analyze">Analyze</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Generation Progress */}
        {step === 3 && (
          <div className="space-y-6 py-12">
            <div className="text-center space-y-4">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
              <h3 className="text-lg font-semibold">Generating Your Quiz...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>▪ Analyzing learning material...</p>
                <p>▪ Extracting concepts...</p>
                <p className={generationProgress > 33 ? '' : 'text-gray-400'}>▪ Generating questions...</p>
                <p className={generationProgress > 66 ? '' : 'text-gray-400'}>▪ Validating answers...</p>
                <p className={generationProgress > 90 ? '' : 'text-gray-400'}>▪ Creating explanations...</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review Questions */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 4: Review AI-Generated Questions</h3>
            <p className="text-sm text-muted-foreground">Review and edit the AI-generated questions below:</p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`border-2 rounded-lg p-4 ${
                    q.isApproved ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{q.question}</p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-white px-2 py-1 rounded">{q.difficulty}</span>
                        {q.isApproved && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Approved</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => regenerateQuestion(q.id)}
                        className="p-2 hover:bg-white rounded"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => approveQuestion(q.id)}
                        className="p-2 hover:bg-white rounded text-green-600"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-2 hover:bg-white rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {q.options && (
                    <div className="space-y-1 mb-2">
                      {q.options.map((opt, i) => (
                        <p key={i} className="text-sm text-gray-700">
                          {String.fromCharCode(65 + i)}. {opt}
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Answer:</span> {q.correctAnswer}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Assign Students */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 5: Assign Students</h3>
            <p className="text-sm text-muted-foreground">Assign this quiz to students or groups:</p>

            <div>
              <label className="block text-sm font-medium mb-2">Assign to:</label>
              <div className="space-y-2">
                {['Entire Course', 'Specific Chapter', 'Student Groups', 'Individual Students'].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input type="radio" name="assignTo" className="rounded" />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Search Students</label>
              <Input placeholder="Search by name or email..." />
            </div>

            <div className="max-h-48 border border-gray-200 rounded-lg p-3 overflow-y-auto">
              <div className="space-y-2">
                {['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Davis'].map((name) => (
                  <label key={name} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Publish */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Step 6: Publish</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900">Quiz Summary</p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Questions:</span> {generatedQuestions.filter((q) => q.isApproved).length} approved
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Source:</span> {sourceType}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Difficulty:</span> {difficulty}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Publishing Options:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="publishOption" defaultChecked className="rounded" />
                  <span className="text-sm">Save as Draft</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="publishOption" className="rounded" />
                  <span className="text-sm">Schedule for Later</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="publishOption" className="rounded" />
                  <span className="text-sm">Publish Immediately</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || step === 3 || isGenerating}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
              Cancel
            </Button>
            {step < 6 ? (
              <Button
                onClick={handleNext}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 gap-1 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                Publish Quiz
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
