'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

interface CreateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQuestionDialog({ open, onOpenChange }: CreateQuestionDialogProps) {
  const [questionType, setQuestionType] = useState('mcq');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="short">Short Answer</option>
              <option value="essay">Essay</option>
              <option value="true-false">True/False</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Select a course...</option>
              <option>Python Programming</option>
              <option>Web Development</option>
              <option>Data Science</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              placeholder="Enter your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          {questionType === 'mcq' && (
            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      className="w-4 h-4"
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddOption}
                className="mt-2 text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>
          )}

          {questionType === 'true-false' && (
            <div>
              <label className="block text-sm font-medium mb-2">Correct Answer</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>True</option>
                <option>False</option>
              </select>
            </div>
          )}

          {(questionType === 'short' || questionType === 'essay') && (
            <div>
              <label className="block text-sm font-medium mb-2">Answer Keywords (Optional)</label>
              <Input placeholder="Separate keywords with commas" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600 text-white">
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


