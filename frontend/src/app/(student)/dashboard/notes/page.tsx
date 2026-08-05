'use client'

import { useState } from 'react'
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pin,
  MoreVertical,
  Bold,
  Italic,
  List,
  Code,
  Quote,
  Link as LinkIcon,
  Save,
  X,
  Folder,
  Calendar,
} from 'lucide-react'

interface Note {
  id: string
  title: string
  subject: string
  content: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  color: string
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'React Hooks Best Practices',
    subject: 'React',
    content:
      'useEffect cleanup function, dependency arrays, custom hooks patterns, Rules of Hooks',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-15',
    isPinned: true,
    color: 'blue',
  },
  {
    id: '2',
    title: 'CSS Flexbox Cheatsheet',
    subject: 'CSS',
    content: 'flex-direction, justify-content, align-items, gap, flex-wrap properties',
    createdAt: '2024-02-08',
    updatedAt: '2024-02-14',
    isPinned: false,
    color: 'purple',
  },
  {
    id: '3',
    title: 'TypeScript Generics',
    subject: 'TypeScript',
    content: 'Generic constraints, utility types, mapped types, conditional types',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-12',
    isPinned: true,
    color: 'orange',
  },
]

type ViewMode = 'grid' | 'editor'

export default function NotesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')

  const filteredNotes = mockNotes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned)
  const otherNotes = filteredNotes.filter((n) => !n.isPinned)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Notes</h1>
          <p className="text-muted-foreground">
            Create and organize your study notes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingNote({ id: '', title: '', subject: '', content: '', createdAt: '', updatedAt: '', isPinned: false, color: 'blue' })
            setViewMode('editor')
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Note
        </button>
      </div>

      {viewMode === 'grid' && (
        <>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Pin className="size-5" />
                Pinned Notes
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`rounded-xl border-2 p-4 cursor-pointer hover:shadow-md transition-all bg-${note.color}-50 border-${note.color}-200 group`}
                    onClick={() => {
                      setEditingNote(note)
                      setViewMode('editor')
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{note.subject}</p>
                      </div>
                      <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {note.updatedAt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Notes */}
          {otherNotes.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-4">All Notes</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => {
                      setEditingNote(note)
                      setViewMode('editor')
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{note.subject}</p>
                      </div>
                      <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {note.updatedAt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No notes found</p>
            </div>
          )}
        </>
      )}

      {viewMode === 'editor' && editingNote && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Editor Header */}
            <div className="border-b border-border p-6 flex items-center justify-between">
              <div>
                <input
                  type="text"
                  placeholder="Note Title"
                  defaultValue={editingNote.title}
                  className="text-2xl font-bold text-foreground bg-transparent outline-none w-full placeholder:text-muted-foreground"
                />
                <select className="mt-2 text-sm text-muted-foreground bg-transparent outline-none">
                  <option>{editingNote.subject}</option>
                </select>
              </div>
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="border-b border-border p-4 flex gap-2 flex-wrap">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <Bold className="size-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <Italic className="size-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <List className="size-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <Code className="size-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <Quote className="size-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <LinkIcon className="size-4" />
              </button>
            </div>

            {/* Editor */}
            <div className="p-6">
              <textarea
                defaultValue={editingNote.content}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Start typing your notes here..."
                className="w-full h-96 rounded-lg border border-border bg-muted p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono"
              />
            </div>

            {/* Actions */}
            <div className="border-t border-border p-6 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Last edited {editingNote.updatedAt}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium hover:border-primary/50 transition-all"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all flex items-center gap-2">
                  <Save className="size-4" />
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
