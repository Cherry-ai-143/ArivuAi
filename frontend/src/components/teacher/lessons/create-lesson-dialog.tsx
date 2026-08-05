'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLessonDialog({ open, onOpenChange }: CreateLessonDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setTitle('');
    setCourse('');
    setDuration('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                s <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lesson Title</label>
              <Input
                placeholder="Enter lesson title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option>Select a course...</option>
                <option>Python Programming</option>
                <option>Web Development</option>
                <option>Data Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input
                placeholder="45"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lesson Description</label>
              <textarea
                placeholder="Enter lesson description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Learning Objectives</label>
              <Input placeholder="Add objectives separated by commas" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="visibility" defaultChecked />
                  <span>Public</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="visibility" />
                  <span>Private</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="visibility" />
                  <span>Draft</span>
                </label>
              </div>
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
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600">
                Create Lesson
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


