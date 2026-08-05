'use client';

import { useState } from 'react';
import { Search, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuestionAnalyzerPage() {
  const [search, setSearch] = useState('');

  const analyses = [
    {
      id: 1,
      question: 'What is the capital of France?',
      correctRate: 95,
      avgTime: '2.3s',
      difficulty: 'Easy',
      course: 'Geography Basics',
      status: 'Excellent',
    },
    {
      id: 2,
      question: 'Explain the photosynthesis process',
      correctRate: 68,
      avgTime: '45.2s',
      difficulty: 'Medium',
      course: 'Biology 101',
      status: 'Good',
    },
    {
      id: 3,
      question: 'Calculate the derivative of x³ + 2x²',
      correctRate: 42,
      avgTime: '120.5s',
      difficulty: 'Hard',
      course: 'Calculus',
      status: 'Needs Review',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Question Analyzer</h1>
        <p className="text-muted-foreground">Analyze question performance and student responses</p>
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 focus:ring-0 flex-1 outline-none bg-transparent"
        />
      </div>

      <div className="space-y-4">
        {analyses.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.course}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.correctRate >= 80
                    ? 'bg-green-100 text-green-700'
                    : item.correctRate >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Correct Rate</p>
                  <p className="font-semibold text-foreground">{item.correctRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                  <p className="font-semibold text-foreground">{item.avgTime}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Difficulty</p>
                <p className="font-semibold text-foreground">{item.difficulty}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
              <Button variant="outline" className="flex-1">
                View Responses
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


