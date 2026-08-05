import { Mail, MoreVertical, MessageSquare } from 'lucide-react';

interface StudentsListProps {
  search: string;
  status: string;
  course: string;
}

const students = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    course: 'Python Programming',
    enrollDate: '2024-01-01',
    progress: 85,
    avgScore: 92,
    status: 'active',
    avatar: '👨‍💼',
  },
  {
    id: 2,
    name: 'Emma Williams',
    email: 'emma@example.com',
    course: 'Web Development',
    enrollDate: '2024-01-05',
    progress: 72,
    avgScore: 78,
    status: 'active',
    avatar: '👩‍💼',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael@example.com',
    course: 'Data Science',
    enrollDate: '2024-01-10',
    progress: 45,
    avgScore: 65,
    status: 'pending',
    avatar: '👨‍💻',
  },
  {
    id: 4,
    name: 'Sophia Davis',
    email: 'sophia@example.com',
    course: 'Python Programming',
    enrollDate: '2023-12-15',
    progress: 95,
    avgScore: 89,
    status: 'active',
    avatar: '👩‍💻',
  },
];

export function StudentsList({ search, status, course }: StudentsListProps) {
  const filtered = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || student.status === status;
    const matchesCourse = course === 'all' || student.course.toLowerCase().includes(course);
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg Score</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((student) => (
            <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{student.avatar}</span>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">Enrolled: {student.enrollDate}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.course}</td>
              <td className="px-6 py-4">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{student.progress}%</p>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.avgScore}%</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="text-purple-500 hover:text-purple-700">
                    <MessageSquare className="w-4 h-4" />
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


