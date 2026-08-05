import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  course: string;
  onCourseChange: (value: string) => void;
}

export function StudentsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  course,
  onCourseChange,
}: StudentsFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 focus:ring-0 flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={course}
          onChange={(e) => onCourseChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Courses</option>
          <option value="python">Python Programming</option>
          <option value="web">Web Development</option>
          <option value="data">Data Science</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm ml-auto">
          <option>Sort by: Name</option>
          <option>Sort by: Enrollment Date</option>
          <option>Sort by: Score</option>
          <option>Sort by: Progress</option>
        </select>
      </div>
    </div>
  );
}


