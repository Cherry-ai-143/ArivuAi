import { Edit2, Trash2, CheckCircle, Clock, MoreVertical } from 'lucide-react';

interface AssignmentsListProps {
  search: string;
  status: string;
}

const assignments = [
  {
    id: 1,
    title: 'Python OOP Project',
    course: 'Python Programming',
    dueDate: '2024-02-15',
    submissions: 78,
    total: 89,
    avgGrade: 85,
    status: 'pending-review',
  },
  {
    id: 2,
    title: 'Website Development',
    course: 'Web Development',
    dueDate: '2024-02-10',
    submissions: 92,
    total: 92,
    avgGrade: 88,
    status: 'completed',
  },
  {
    id: 3,
    title: 'Data Analysis Report',
    course: 'Data Science',
    dueDate: '2024-02-20',
    submissions: 45,
    total: 67,
    avgGrade: 82,
    status: 'active',
  },
  {
    id: 4,
    title: 'API Integration Task',
    course: 'Web Development',
    dueDate: '2024-02-08',
    submissions: 5,
    total: 56,
    avgGrade: 0,
    status: 'draft',
  },
];

export function AssignmentsList({ search, status }: AssignmentsListProps) {
  const filtered = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || a.status === status;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assignment</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submissions</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg Grade</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const daysLeft = getDaysUntilDue(a.dueDate);
            return (
              <tr key={a.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.course}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{a.dueDate}</span>
                    <span className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      ({daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {a.submissions}/{a.total}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {a.avgGrade > 0 ? `${a.avgGrade}%` : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>
                    {a.status.replace('-', ' ').charAt(0).toUpperCase() + a.status.replace('-', ' ').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-green-500 hover:text-green-700">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


