import { FileText, Play, Presentation, Download, Trash2, MoreVertical } from 'lucide-react';

interface MaterialsListProps {
  search: string;
  type: string;
}

const materials = [
  {
    id: 1,
    name: 'Python Fundamentals.pdf',
    type: 'pdf',
    course: 'Python Programming',
    size: '2.4 MB',
    uploads: 342,
    date: '2024-01-15',
  },
  {
    id: 2,
    name: 'Introduction to Web Dev',
    type: 'video',
    course: 'Web Development',
    size: '156 MB',
    uploads: 567,
    date: '2024-01-14',
  },
  {
    id: 3,
    name: 'Data Science Basics.pptx',
    type: 'slides',
    course: 'Data Science',
    size: '8.7 MB',
    uploads: 234,
    date: '2024-01-13',
  },
  {
    id: 4,
    name: 'Advanced Python Concepts.pdf',
    type: 'pdf',
    course: 'Python Programming',
    size: '3.1 MB',
    uploads: 156,
    date: '2024-01-12',
  },
];

export function MaterialsList({ search, type }: MaterialsListProps) {
  const filtered = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === 'all' || material.type === type;
    return matchesSearch && matchesType;
  });

  const getIcon = (materialType: string) => {
    switch (materialType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'slides':
        return <Presentation className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Material</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Downloads</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((material) => (
            <tr key={material.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {getIcon(material.type)}
                  <span className="font-medium text-gray-900">{material.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{material.course}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{material.size}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{material.uploads}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{material.date}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <Download className="w-4 h-4" />
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


