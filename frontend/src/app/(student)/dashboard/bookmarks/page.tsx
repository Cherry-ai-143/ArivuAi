'use client'

import { useState } from 'react'
import {
  Bookmark,
  Grid3x3,
  List,
  Search,
  Trash2,
  BookOpen,
  FileText,
  Play,
  HelpCircle,
} from 'lucide-react'

interface BookmarkedItem {
  id: string
  title: string
  type: 'course' | 'lesson' | 'quiz' | 'resource' | 'note'
  category: string
  savedDate: string
}

const mockBookmarks: BookmarkedItem[] = [
  { id: '1', title: 'React Hooks Deep Dive', type: 'course', category: 'React', savedDate: '2024-02-10' },
  { id: '2', title: 'Advanced TypeScript Patterns', type: 'lesson', category: 'TypeScript', savedDate: '2024-02-08' },
  { id: '3', title: 'CSS Grid Mastery Quiz', type: 'quiz', category: 'CSS', savedDate: '2024-02-05' },
  { id: '4', title: 'JavaScript Cheatsheet PDF', type: 'resource', category: 'JavaScript', savedDate: '2024-02-03' },
  { id: '5', title: 'Web Performance Tips', type: 'note', category: 'Performance', savedDate: '2024-02-01' },
  { id: '6', title: 'Flexbox Tutorial Video', type: 'lesson', category: 'CSS', savedDate: '2024-01-28' },
]

type ViewMode = 'grid' | 'list'

export default function BookmarksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredBookmarks = mockBookmarks.filter(
    (item) =>
      (selectedType === 'all' || item.type === selectedType) &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeColors: Record<string, string> = {
    course: 'bg-blue-50 text-blue-700 border-blue-200',
    lesson: 'bg-purple-50 text-purple-700 border-purple-200',
    quiz: 'bg-orange-50 text-orange-700 border-orange-200',
    resource: 'bg-green-50 text-green-700 border-green-200',
    note: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }

  const typeIcons: Record<string, any> = {
    course: BookOpen,
    lesson: Play,
    quiz: HelpCircle,
    resource: FileText,
    note: Bookmark,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bookmarks</h1>
        <p className="text-muted-foreground">
          Your saved courses, lessons, quizzes, and resources
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="lesson">Lessons</option>
            <option value="quiz">Quizzes</option>
            <option value="resource">Resources</option>
            <option value="note">Notes</option>
          </select>

          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3x3 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((item) => {
            const Icon = typeIcons[item.type]
            return (
              <div
                key={item.id}
                className={`rounded-xl border-2 p-4 ${typeColors[item.type]} cursor-pointer hover:shadow-md transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="size-5 flex-shrink-0" />
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
                <p className="text-xs mb-3 opacity-80">{item.category}</p>
                <p className="text-xs opacity-70">Saved {item.savedDate}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredBookmarks.map((item) => {
            const Icon = typeIcons[item.type]
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Icon className="size-5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.category} • Saved {item.savedDate}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                </div>
                <button className="ml-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-lg">
                  <Trash2 className="size-4 text-muted-foreground" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {filteredBookmarks.length === 0 && (
        <div className="text-center py-12">
          <Bookmark className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No bookmarks found</p>
        </div>
      )}
    </div>
  )
}
