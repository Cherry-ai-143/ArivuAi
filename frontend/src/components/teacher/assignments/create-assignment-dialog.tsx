'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssignmentDialog({ open, onOpenChange }: CreateAssignmentDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Assignment Title</label>
            <Input placeholder="e.g., Python OOP Project" />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Points</label>
              <Input placeholder="100" type="number" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Enter assignment description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instructions</label>
            <textarea
              placeholder="Detailed instructions for students"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Allow file uploads</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600 text-white">
            Create Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


