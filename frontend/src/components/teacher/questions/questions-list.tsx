import { Edit2, Trash2, Copy, MoreVertical, Star } from 'lucide-react';

interface QuestionsListProps {
  search: string;
  type: string;
}

const questions = [
  {
    id: 1,
    question: 'What is the difference between list and tuple?',
    type: 'mcq',
    difficulty: 'medium',
    course: 'Python Programming',
    used: 45,
    rating: 4.5,
  },
  {
    id: 2,
    question: 'Explain the concept of inheritance in OOP',
    type: 'essay',
    difficulty: 'hard',
    course: 'Python Programming',
    used: 32,
    rating: 4.8,
  },
  {
    id: 3,
    question: 'HTML is a programming language. True or False?',
    type: 'true-false',
    difficulty: 'easy',
    course: 'Web Development',
    used: 156,
    rating: 4.2,
  },
  {
    id: 4,
    question: 'What is the purpose of CSS?',
    type: 'short',
    difficulty: 'easy',
    course: 'Web Development',
    used: 78,
    rating: 4.6,
  },
];

export function QuestionsList({ search, type }: QuestionsListProps) {
  const filtered = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === 'all' || q.type === type;
    return matchesSearch && matchesType;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'short':
        return 'Short Answer';
      case 'essay':
        return 'Essay';
      case 'true-false':
        return 'True/False';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Question</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Difficulty</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Used</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q) => (
            <tr key={q.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                {q.question}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{getTypeLabel(q.type)}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                  {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{q.course}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{q.used}x</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-700">{q.rating}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-purple-500 hover:text-purple-700">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


