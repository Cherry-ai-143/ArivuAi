import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ProgressFilters() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search students..."
          className="border-0 focus:ring-0 flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>All Courses</option>
          <option>Python Programming</option>
          <option>Web Development</option>
          <option>Data Science</option>
        </select>

        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option>Progress: All</option>
          <option>0-25%</option>
          <option>25-50%</option>
          <option>50-75%</option>
          <option>75-100%</option>
        </select>
      </div>
    </div>
  );
}


