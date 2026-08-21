import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AssignmentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  courseId?: string;
  onCourseChange?: (value: string) => void;
  assignmentType?: string;
  onAssignmentTypeChange?: (value: string) => void;
  difficulty?: string;
  onDifficultyChange?: (value: string) => void;
  courses?: { id: number; title: string }[];
}

export function AssignmentsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  courseId = 'all',
  onCourseChange = () => {},
  assignmentType = 'all',
  onAssignmentTypeChange = () => {},
  difficulty = 'all',
  onDifficultyChange = () => {},
  courses = [],
}: AssignmentsFiltersProps) {

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assignments..."
            className="pl-9 h-10 text-sm bg-gray-50 border-gray-200"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending-review">Pending Review</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>

        {/* Course Filter */}
        <select
          value={courseId}
          onChange={(e) => onCourseChange(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Assignment Type Filter */}
        <select
          value={assignmentType}
          onChange={(e) => onAssignmentTypeChange(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Types</option>
          <option value="written">Written Response</option>
          <option value="problem_solving">Problem Solving</option>
          <option value="programming">Programming</option>
          <option value="project">Project</option>
          <option value="research">Research / Report</option>
          <option value="creative">Creative / Presentation</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}
