import { CheckCircle, Edit2, Trash2, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GeneratedQuizzes() {
  const questions = [
    {
      id: 1,
      question: 'What is the difference between list and tuple in Python?',
      options: [
        'Lists are mutable, tuples are immutable',
        'Tuples are mutable, lists are immutable',
        'Both are the same',
        'Lists are faster than tuples',
      ],
      type: 'mcq',
      difficulty: 'Medium',
    },
    {
      id: 2,
      question: 'Explain the concept of inheritance in object-oriented programming.',
      type: 'essay',
      difficulty: 'Hard',
    },
    {
      id: 3,
      question: 'Python is an interpreted language. True or False?',
      type: 'true-false',
      difficulty: 'Easy',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Generated Questions (3)</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Copy className="w-4 h-4" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">{q.question}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'essay' ? 'Essay' : 'True/False'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>

            {q.options && (
              <div className="space-y-2 mb-3">
                {q.options.map((option, idx) => (
                  <div key={idx} className="text-sm text-gray-600 pl-4">
                    {String.fromCharCode(65 + idx)}) {option}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button className="text-blue-500 hover:text-blue-700">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="text-purple-500 hover:text-purple-700">
                <Copy className="w-4 h-4" />
              </button>
              <button className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
        Save as Quiz
      </Button>
    </div>
  );
}


