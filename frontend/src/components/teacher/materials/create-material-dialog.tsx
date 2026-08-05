'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CreateMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMaterialDialog({ open, onOpenChange }: CreateMaterialDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Select a course...</option>
              <option>Python Programming</option>
              <option>Web Development</option>
              <option>Data Science</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Material Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Select type...</option>
              <option>PDF Document</option>
              <option>Video</option>
              <option>Presentation Slides</option>
              <option>Document</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex justify-center mb-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {selectedFile ? 'File selected' : 'Drag and drop or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max file size: 500MB
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <File className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{selectedFile.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              placeholder="Add description for this material"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={!selectedFile}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Upload Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


