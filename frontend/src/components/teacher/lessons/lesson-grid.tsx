import { FileText, Users, Clock, MoreVertical } from 'lucide-react';

interface LessonGridProps {
  view: string;
  search: string;
  filter: string;
}

const lessons = [
  {
    id: 1,
    title: 'Python Basics',
    course: 'Python Programming',
    duration: '45 min',
    students: 156,
    views: 892,
    status: 'published',
  },
  {
    id: 2,
    title: 'Variables and Data Types',
    course: 'Python Programming',
    duration: '60 min',
    students: 142,
    views: 754,
    status: 'published',
  },
  {
    id: 3,
    title: 'Control Flow Structures',
    course: 'Python Programming',
    duration: '90 min',
    students: 128,
    views: 612,
    status: 'draft',
  },
  {
    id: 4,
    title: 'Functions and Modules',
    course: 'Python Programming',
    duration: '75 min',
    students: 115,
    views: 523,
    status: 'published',
  },
];

export function LessonGrid({ view, search, filter }: LessonGridProps) {
  const filtered = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || lesson.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (view === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Students</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lesson) => (
              <tr key={lesson.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{lesson.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lesson.course}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lesson.duration}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lesson.students}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lesson.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">{lesson.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{lesson.course}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lesson.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {lesson.students}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              lesson.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{lesson.views} views</span>
          </div>
        </div>
      ))}
    </div>
  );
}


