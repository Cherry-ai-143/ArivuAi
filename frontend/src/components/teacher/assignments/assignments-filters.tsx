import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AssignmentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function AssignmentsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: AssignmentsFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search assignments..."
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
          <option value="pending-review">Pending Review</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Courses</option>
          <option>Python Programming</option>
          <option>Web Development</option>
          <option>Data Science</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
    </div>
  );
}


