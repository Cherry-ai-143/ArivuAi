'use client';

import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizzesFilters } from '@/components/teacher/quizzes/quizzes-filters';
import { QuizzesList } from '@/components/teacher/quizzes/quizzes-list';
import { CreateQuizDialog } from '@/components/teacher/quizzes/create-quiz-dialog';
import { AiQuizGeneratorModal } from '@/components/teacher/quizzes/ai-quiz-generator-modal';

export default function QuizzesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header with Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quizzes & Assessment Bank</h1>
          <p className="text-muted-foreground mt-1">Create, manage, assign, and monitor AI-powered and manually created quizzes.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </Button>
          <Button
            onClick={() => setGenerateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Filters */}
      <QuizzesFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {/* Quizzes List */}
      <QuizzesList search={search} status={status} />

      {/* Create Quiz Dialog */}
      <CreateQuizDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Generate AI Quiz Modal */}
      <AiQuizGeneratorModal
        isOpen={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
      />
    </div>
  );
}
