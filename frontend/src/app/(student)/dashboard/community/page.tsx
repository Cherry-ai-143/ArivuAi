'use client'

import { useState } from 'react'
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Search,
  Filter,
  TrendingUp,
  Plus,
  Award,
  BookOpen,
} from 'lucide-react'
import Image from 'next/image'

interface Post {
  id: string
  author: string
  avatar: string
  title: string
  content: string
  category: string
  timestamp: string
  likes: number
  replies: number
  views: number
  liked: boolean
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'Best resources for learning React Hooks?',
    content: 'I\'m struggling with custom hooks. Can anyone recommend the best resources or tutorials?',
    category: 'React',
    timestamp: '2 hours ago',
    likes: 24,
    replies: 8,
    views: 156,
    liked: false,
  },
  {
    id: '2',
    author: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    title: 'TypeScript Tips & Tricks',
    content: 'Here are some amazing TypeScript patterns I discovered that can level up your code...',
    category: 'TypeScript',
    timestamp: '5 hours ago',
    likes: 89,
    replies: 23,
    views: 542,
    liked: true,
  },
  {
    id: '3',
    author: 'Emma Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    title: 'CSS Grid vs Flexbox Comparison',
    content: 'Let me share my learning journey and when to use each method effectively.',
    category: 'CSS',
    timestamp: '8 hours ago',
    likes: 45,
    replies: 12,
    views: 234,
    liked: false,
  },
]

type FilterType = 'all' | 'trending' | 'unanswered' | 'following'

export default function CommunityPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const filteredPosts = mockPosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    members: 12534,
    discussions: 3452,
    answered: 2890,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">
          Join discussions, ask questions, and learn from peers
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Active Members</p>
          <p className="text-2xl font-bold text-foreground">{stats.members.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Discussions</p>
          <p className="text-2xl font-bold text-foreground">{stats.discussions.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Answered</p>
          <p className="text-2xl font-bold text-green-600">{stats.answered.toLocaleString()}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:border-primary/50 transition-all flex items-center gap-2">
            <Filter className="size-4" />
            Filter
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all flex items-center gap-2">
            <Plus className="size-4" />
            New Discussion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border flex-wrap">
        {(['all', 'trending', 'unanswered', 'following'] as FilterType[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`pb-4 px-2 font-medium text-sm transition-colors ${
              selectedFilter === filter
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {selectedPost ? (
        // Post Detail View
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-primary hover:text-primary/80 font-medium mb-6"
          >
            ← Back to Discussions
          </button>

          <div className="rounded-2xl border border-border bg-card p-6">
            {/* Post Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
              <Image
                src={selectedPost.avatar}
                alt={selectedPost.author}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedPost.author}</span>
                  <span>{selectedPost.timestamp}</span>
                  <span className="px-2 py-1 rounded-full bg-muted text-foreground text-xs font-medium">
                    {selectedPost.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-foreground mb-6 leading-relaxed">{selectedPost.content}</p>

            {/* Post Actions */}
            <div className="flex gap-4 flex-wrap pb-6 border-b border-border">
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="size-5" />
                {selectedPost.likes}
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="size-5" />
                {selectedPost.replies}
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="size-5" />
                Share
              </button>
            </div>

            {/* Replies */}
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-foreground mb-4">{selectedPost.replies} Replies</h3>
              {[
                {
                  author: 'John Smith',
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                  content: 'Great question! I struggled with this too.',
                  timestamp: '1 hour ago',
                  likes: 5,
                  isAnswered: true,
                },
              ].map((reply, idx) => (
                <div key={idx} className="flex gap-4">
                  <Image
                    src={reply.avatar}
                    alt={reply.author}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 rounded-lg border border-border bg-muted p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{reply.author}</p>
                        <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                      </div>
                      {reply.isAnswered && (
                        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium flex items-center gap-1">
                          <Award className="size-3" />
                          Answer
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-sm">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Posts List
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="w-full text-left rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <Image
                  src={post.avatar}
                  alt={post.author}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full flex-shrink-0 mt-1"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <span>{post.author}</span>
                    <span>{post.timestamp}</span>
                    <span className="px-2 py-1 rounded-full bg-muted text-foreground font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="size-4" />
                    {post.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    {post.replies}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="size-4" />
                    {post.views}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && !selectedPost && (
        <div className="text-center py-12">
          <Users className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No discussions found</p>
        </div>
      )}
    </div>
  )
}
