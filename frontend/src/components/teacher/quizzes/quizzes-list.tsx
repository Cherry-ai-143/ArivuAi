import { useState } from 'react';
import { BarChart3, Edit2, Trash2, MoreVertical, Eye, Copy, Users, Share2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface QuizzesListProps {
  search: string;
  status: string;
}

const quizzes = [
  {
    id: 1,
    name: 'Python Fundamentals Quiz',
    course: 'Python Programming',
    type: 'Manual',
    questions: 15,
    students: 142,
    submissions: 135,
    avgScore: 78,
    status: 'active',
    difficulty: 'Medium',
    date: '2024-01-20',
  },
  {
    id: 2,
    name: 'Web Development Midterm',
    course: 'Web Development',
    type: 'AI Generated',
    questions: 40,
    students: 89,
    submissions: 78,
    avgScore: 82,
    status: 'completed',
    difficulty: 'Hard',
    date: '2024-01-15',
  },
  {
    id: 3,
    name: 'Data Analysis Assessment',
    course: 'Data Science',
    type: 'Manual',
    questions: 20,
    students: 67,
    submissions: 54,
    avgScore: 85,
    status: 'published',
    difficulty: 'Medium',
    date: '2024-01-18',
  },
  {
    id: 4,
    name: 'Advanced Python Concepts',
    course: 'Python Programming',
    type: 'AI Generated',
    questions: 25,
    students: 98,
    submissions: 0,
    avgScore: 0,
    status: 'draft',
    difficulty: 'Hard',
    date: '2024-01-25',
  },
];

export function QuizzesList({ search, status }: QuizzesListProps) {
  const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([]);

  const filtered = quizzes.filter((q) => {
    const matchesSearch = q.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || q.status === status;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      active: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-indigo-100 text-indigo-700',
      expired: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Easy: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Hard: 'bg-red-100 text-red-700',
      Mixed: 'bg-blue-100 text-blue-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  const toggleSelectQuiz = (id: number) => {
    setSelectedQuizzes((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuizzes.length === filtered.length) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(filtered.map((q) => q.id));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {selectedQuizzes.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedQuizzes.length} quiz{selectedQuizzes.length !== 1 ? 'zes' : ''} selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
              Publish
            </button>
            <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
              Assign
            </button>
            <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
              Archive
            </button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedQuizzes.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="rounded"
              />
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quiz Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Questions</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submissions</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg Score</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Difficulty</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q) => (
            <tr key={q.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedQuizzes.includes(q.id)}
                  onChange={() => toggleSelectQuiz(q.id)}
                  className="rounded"
                />
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{q.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{q.course}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    q.type === 'AI Generated'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {q.type}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{q.questions}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {q.submissions}/{q.students}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {q.avgScore > 0 ? `${q.avgScore}%` : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    q.difficulty
                  )}`}
                >
                  {q.difficulty}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(q.status)}`}
                >
                  {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-blue-500 hover:text-blue-700 p-2">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-500 hover:text-green-700 p-2">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="w-4 h-4 mr-2" />
                          Assign Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-500">No quizzes found. Create a new quiz to get started.</p>
        </div>
      )}
    </div>
  );
}
