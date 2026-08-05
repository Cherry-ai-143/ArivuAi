import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface QuestionsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
}

export function QuestionsFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
}: QuestionsFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 focus:ring-0 flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="mcq">Multiple Choice</option>
          <option value="short">Short Answer</option>
          <option value="essay">Essay</option>
          <option value="true-false">True/False</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
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


