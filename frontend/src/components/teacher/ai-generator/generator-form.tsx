'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Type, Wand2 } from 'lucide-react';

interface GeneratorFormProps {
  onGenerate: () => void;
}

export function GeneratorForm({ onGenerate }: GeneratorFormProps) {
  const [method, setMethod] = useState('paste');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Generate Quiz</h2>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="method"
            value="paste"
            checked={method === 'paste'}
            onChange={(e) => setMethod(e.target.value)}
            className="w-4 h-4"
          />
          <Type className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Paste Content</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="method"
            value="upload"
            checked={method === 'upload'}
            onChange={(e) => setMethod(e.target.value)}
            className="w-4 h-4"
          />
          <Upload className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Upload File</span>
        </label>
      </div>

      {method === 'paste' ? (
        <div>
          <label className="block text-sm font-medium mb-2">Paste your study material</label>
          <textarea
            placeholder="Paste lecture notes, book excerpts, or any study material here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 text-sm"
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Drop file here or click to select</p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, TXT (Max 10MB)</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Number of Questions</label>
        <Input type="number" placeholder="10" min="1" max="50" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Question Type</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Multiple Choice</option>
          <option>Short Answer</option>
          <option>Essay</option>
          <option>Mixed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Difficulty Level</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
          <option>Mixed</option>
        </select>
      </div>

      <Button
        onClick={onGenerate}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Wand2 className="w-4 h-4" />
        Generate Quiz
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Powered by advanced AI • Generates in ~30 seconds
      </p>
    </div>
  );
}


