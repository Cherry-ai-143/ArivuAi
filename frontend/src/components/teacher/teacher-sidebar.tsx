'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/sidebar-context'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Sparkles,
  BarChart3,
  CheckSquare,
  ClipboardList,
  MessageSquare,
  Settings,
  Zap,
  ChevronDown,
} from 'lucide-react'
import { BrandLogo } from '@/components/landing/brand-logo'


const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/teacher-dashboard' },
  {
    label: 'My Courses',
    icon: BookOpen,
    href: '/teacher-dashboard/courses',
  },
  {
    label: 'Lessons',
    icon: FileText,
    href: '/teacher-dashboard/lessons',
  },
  {
    label: 'Study Materials',
    icon: ClipboardList,
    href: '/teacher-dashboard/materials',
  },
  {
    label: 'Question Bank',
    icon: HelpCircle,
    href: '/teacher-dashboard/questions',
  },
  { label: 'Assessments', icon: CheckSquare, href: '/teacher-dashboard/assessments' },
  {
    label: 'Assignments',
    icon: ClipboardList,
    href: '/teacher-dashboard/assignments',
  },
  {
    label: 'Student Analytics',
    icon: BarChart3,
    href: '/teacher-dashboard/analytics',
  },
  {
    label: 'Performance',
    icon: BarChart3,
    href: '/teacher-dashboard/analytics/performance',
  },
  { label: 'Reports', icon: FileText, href: '/teacher-dashboard/analytics/reports' },
  {
    label: 'Question Analyzer',
    icon: MessageSquare,
    href: '/teacher-dashboard/analyzer',
  },
  {
    label: 'AI Assistant',
    icon: Sparkles,
    href: '/teacher-dashboard/assistant',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/teacher-dashboard/settings',
  },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const { isExpanded, toggleSidebar, sidebarWidth } = useSidebar()

  const sectionGroups = [
    {
      title: 'CONTENT',
      items: navItems.slice(0, 5),
    },
    {
      title: 'ASSESSMENTS',
      items: navItems.slice(5, 7),
    },
    {
      title: 'ANALYTICS',
      items: navItems.slice(7, 10),
    },
    {
      title: 'TOOLS',
      items: navItems.slice(10, 13),
    },
  ]

  return (
    <aside
      style={{ width: sidebarWidth }}
      className="fixed left-0 top-0 z-30 h-screen bg-gradient-to-b from-primary via-primary to-primary/95 transition-all duration-300 flex flex-col overflow-hidden"
    >

      {/* Logo */}
      <div className={`flex items-center ${isExpanded ? 'justify-between px-6' : 'justify-center px-2'} border-b border-primary/30 py-5`}>
        {isExpanded && (
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Arivu AI</span>
              <span className="text-xs text-primary-foreground/70">
                Learn Smarter
              </span>
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="text-primary-foreground/60 hover:text-primary-foreground transition-colors p-1.5 rounded-lg hover:bg-primary-foreground/10"
          title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <ChevronDown
            className={`size-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : '-rotate-90'}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {sectionGroups.map((section) => (
          <div key={section.title}>
            {isExpanded && (
              <p className="px-4 py-2 text-xs font-semibold text-primary-foreground/60 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isExpanded ? item.label : undefined}
                    className={`group flex items-center ${
                      isExpanded ? 'gap-3 px-4' : 'justify-center px-2'
                    } rounded-xl py-3 text-sm font-medium transition-all ${
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
            </div>
          </div>
        ))}
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
                  Unlock advanced AI features
                </p>
                <button className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}


