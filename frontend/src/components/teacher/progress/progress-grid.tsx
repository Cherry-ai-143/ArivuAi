import { TrendingUp, AlertCircle } from 'lucide-react';

export function ProgressGrid() {
  const students = [
    {
      name: 'Alex Johnson',
      course: 'Python Programming',
      progress: 85,
      lastActivity: '2 hours ago',
      status: 'on-track',
    },
    {
      name: 'Emma Williams',
      course: 'Web Development',
      progress: 72,
      lastActivity: '1 day ago',
      status: 'on-track',
    },
    {
      name: 'Michael Brown',
      course: 'Data Science',
      progress: 45,
      lastActivity: '3 days ago',
      status: 'at-risk',
    },
    {
      name: 'Sophia Davis',
      course: 'Python Programming',
      progress: 95,
      lastActivity: '30 min ago',
      status: 'on-track',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {students.map((student) => (
        <div key={student.name} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.course}</p>
            </div>
            {student.status === 'on-track' ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-gray-900">{student.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  student.status === 'on-track' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${student.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last activity: {student.lastActivity}</span>
            <button className="text-blue-500 hover:text-blue-700 font-medium">View Details</button>
          </div>
        </div>
      ))}
    </div>
  );
}


