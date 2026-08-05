'use client'

import { useState } from 'react'
import {
  Upload,
  Sparkles,
  FileText,
  BookOpen,
  Plus,
  Clock,
  HelpCircle,
  MoreVertical,
  Trash2,
  Download,
  Play,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface GeneratedQuiz {
  id: string
  title: string
  questions: number
  difficulty: string
  createdAt: string
  accuracy: number
  attempts: number
}

const mockQuizzes: GeneratedQuiz[] = [
  {
    id: '1',
    title: 'React Hooks Deep Dive',
    questions: 15,
    difficulty: 'Advanced',
    createdAt: '2 hours ago',
    accuracy: 85,
    attempts: 3,
  },
  {
    id: '2',
    title: 'CSS Flexbox Basics',
    questions: 10,
    difficulty: 'Beginner',
    createdAt: '1 day ago',
    accuracy: 92,
    attempts: 2,
  },
  {
    id: '3',
    title: 'TypeScript Generics',
    questions: 12,
    difficulty: 'Advanced',
    createdAt: '3 days ago',
    accuracy: 78,
    attempts: 4,
  },
]

type QuizSource = 'pdf' | 'notes' | 'course' | 'manual'

export default function QuizGeneratorPage() {
  const [selectedSource, setSelectedSource] = useState<QuizSource | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple-choice'])
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleGenerateQuiz = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setSelectedSource(null)
    }, 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Quiz Generator</h1>
        <p className="text-muted-foreground">
          Create custom quizzes powered by AI from your study materials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        <button
          onClick={() => setActiveTab('generate')}
          className={`pb-4 px-2 font-medium text-sm transition-colors ${
            activeTab === 'generate'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Generate Quiz
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-2 font-medium text-sm transition-colors ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Quiz History
        </button>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left - Source Selection */}
          <div className="lg:col-span-1">
            <h2 className="font-semibold text-foreground mb-4">Choose Source</h2>
            <div className="space-y-3">
              {/* PDF Upload */}
              <button
                onClick={() => setSelectedSource('pdf')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                  selectedSource === 'pdf'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Upload className="size-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Upload PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From textbooks or notes
                    </p>
                  </div>
                </div>
              </button>

              {/* Study Notes */}
              <button
                onClick={() => setSelectedSource('notes')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                  selectedSource === 'notes'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="size-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Study Notes</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your personal notes
                    </p>
                  </div>
                </div>
              </button>

              {/* Course Content */}
              <button
                onClick={() => setSelectedSource('course')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                  selectedSource === 'course'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="size-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Course Topics</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From enrolled courses
                    </p>
                  </div>
                </div>
              </button>

              {/* Manual Topic */}
              <button
                onClick={() => setSelectedSource('manual')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                  selectedSource === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Plus className="size-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Manual Topic</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter topic name
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Right - Settings */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-6">Quiz Settings</h2>

              {!selectedSource ? (
                <div className="text-center py-12">
                  <Sparkles className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a source to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Number of Questions
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">5 Questions</span>
                      <span className="text-sm font-semibold text-primary">{numQuestions}</span>
                      <span className="text-xs text-muted-foreground">50 Questions</span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['beginner', 'intermediate', 'advanced'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            difficulty === level
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border bg-card text-foreground hover:border-primary/50'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Types */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Question Types
                    </label>
                    <div className="space-y-2">
                      {['multiple-choice', 'true-false', 'short-answer', 'matching'].map(
                        (type) => (
                          <label key={type} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={questionTypes.includes(type)}
                              onChange={() => toggleQuestionType(type)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-0"
                            />
                            <span className="text-sm text-foreground capitalize">
                              {type.replace('-', ' ')}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        Generate Quiz
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground mb-4">Recent Quizzes</h2>
          {mockQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-medium text-foreground">{quiz.title}</h3>
                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="size-3" />
                    {quiz.questions} Questions
                  </span>
                  <span className="px-2 py-1 rounded-full bg-muted text-foreground text-xs font-medium">
                    {quiz.difficulty}
                  </span>
                  <span>{quiz.createdAt}</span>
                  <span>{quiz.accuracy}% accuracy</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                  <Play className="size-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                  <Download className="size-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
