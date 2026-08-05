import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LessonFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  view: string;
  onViewChange: (value: string) => void;
}

export function LessonFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  view,
  onViewChange,
}: LessonFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 focus:ring-0 flex-1 outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Lessons</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Courses</option>
          <option>Python Programming</option>
          <option>Web Development</option>
          <option>Data Science</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('grid')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


