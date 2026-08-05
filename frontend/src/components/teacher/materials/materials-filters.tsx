import { Search } from 'lucide-react';

interface MaterialsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
}

export function MaterialsFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
}: MaterialsFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          placeholder="Search materials..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 focus:ring-0 flex-1 outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF Documents</option>
          <option value="video">Videos</option>
          <option value="slides">Slides</option>
          <option value="document">Documents</option>
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


