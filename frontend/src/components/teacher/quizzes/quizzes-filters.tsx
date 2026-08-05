import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface QuizzesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function QuizzesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: QuizzesFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 focus:ring-0 flex-1"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Types</option>
          <option>Manual</option>
          <option>AI Generated</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
          <option>Mixed</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Courses</option>
          <option>Python Programming</option>
          <option>Web Development</option>
          <option>Data Science</option>
        </select>
      </div>
    </div>
  );
}
