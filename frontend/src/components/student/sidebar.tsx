'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  BarChart3,
  Calendar,
  FileText,
  Bookmark,
  Trophy,
  MessageCircle,
  Users,
  Settings,
  Zap,
  ChevronDown,
} from 'lucide-react'
import { BrandLogo } from '@/components/landing/brand-logo'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'My Learning', icon: BookOpen, href: '/dashboard/courses?tab=my-learning' },
  { label: 'Explore Courses', icon: Zap, href: '/dashboard/courses' },
  { label: 'Assessments', icon: CheckSquare, href: '/dashboard/assessments' },
  { label: 'Certificates', icon: Trophy, href: '/dashboard/course-completion' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Study Planner', icon: Calendar, href: '/dashboard/study-planner' },
  { label: 'Notes', icon: FileText, href: '/dashboard/notes' },
  { label: 'Bookmarks', icon: Bookmark, href: '/dashboard/bookmarks' },
  { label: 'Community', icon: Users, href: '/dashboard/community' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-primary via-primary to-primary/95 transition-all duration-300 flex flex-col overflow-hidden ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-primary/30 px-6 py-5">
        {isExpanded && (
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Arivu AI</span>
              <span className="text-xs text-primary-foreground/70">Learn Smart</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
        >
          <ChevronDown
            className={`size-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-lg'
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
              }`}
            >
              <Icon className="size-5 flex-shrink-0" />
              {isExpanded && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      {isExpanded && (
        <div className="border-t border-primary/30 space-y-4 px-4 py-6">
          {/* Premium Upgrade Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
            <div className="flex items-start gap-2">
              <Zap className="size-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
                <p className="text-xs text-primary-foreground/70 mt-1">
                  Unlock advanced features and unlimited quizzes
                </p>
                <button className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>

          {/* Learning Level Card */}
          <div className="rounded-2xl border border-primary-foreground/20 bg-white/5 p-4">
            <p className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide">
              Learning Level
            </p>
            <p className="text-lg font-bold text-white mt-2">Advanced</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary-foreground/70">XP Progress</span>
                <span className="font-semibold text-white">2300/3500</span>
              </div>
              <div className="h-1.5 w-full bg-primary-foreground/20 rounded-full overflow-hidden">
                <div className="h-full w-[66%] bg-gradient-to-r from-accent to-yellow-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}


