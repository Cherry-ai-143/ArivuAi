'use client'

import { Search, Grid3x3, List } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CourseFiltersProps {
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedDifficulty: string
  onDifficultyChange: (difficulty: string) => void
}

export function CourseFilters({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
}: CourseFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 rounded-xl bg-muted p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`rounded-lg px-3 py-2 transition-all ${
              viewMode === 'grid'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3x3 className="size-5" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`rounded-lg px-3 py-2 transition-all ${
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="size-5" />
          </button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedStatus} onValueChange={(val) => onStatusChange(val || '')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={(val) => onCategoryChange(val || '')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="Programming">Programming</SelectItem>
            <SelectItem value="Web Development">Web Development</SelectItem>
            <SelectItem value="AI/ML">AI/ML</SelectItem>
            <SelectItem value="Databases">Databases</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={(val) => onDifficultyChange(val || '')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}


