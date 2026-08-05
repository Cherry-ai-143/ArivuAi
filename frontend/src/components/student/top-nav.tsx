'use client'

import { Bell, Search, User, Settings, HelpCircle, LogOut, ChevronDown, Edit3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { UserAvatar } from '@/components/ui/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TopNav() {
  const router = useRouter()
  const { currentUser, profileDetails, logout } = useAuth()

  const fullName = currentUser?.full_name || 'Student'
  const firstName = fullName.split(' ')[0]
  const userRole = currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Student'

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between gap-4 px-6 lg:px-8">
        {/* Left - Greeting */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-serif font-bold text-foreground">
            Welcome back, {firstName} <span className="wave">👋</span>
          </h2>
          <p className="text-sm text-muted-foreground">Let's continue your learning journey today</p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden sm:block">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses, quizzes..."
                className="w-full rounded-xl border border-border bg-muted pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => router.push('/dashboard/settings?tab=notifications')}
            className="group relative rounded-xl p-2.5 text-muted-foreground hover:bg-muted transition-colors border border-border/50"
            title="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2.5 bg-accent rounded-full ring-2 ring-card animate-pulse" />
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/70 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <UserAvatar name={fullName} src={currentUser?.avatar_url || profileDetails?.avatarUrl} size="md" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-foreground leading-tight">{fullName}</p>
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground ml-1 hidden sm:block" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-2 shadow-2xl space-y-1"
            >
              {/* User Header (Plain div - semantically correct container) */}
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={fullName} src={currentUser?.avatar_url || profileDetails?.avatarUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-border/60" />

              {/* Group 1: Profile & Settings */}
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/profile')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <User className="size-4 text-primary" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/profile?edit=true')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit3 className="size-4 text-primary" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/settings')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Settings className="size-4 text-primary" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/community')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <HelpCircle className="size-4 text-primary" />
                  <span>Help Center</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-border/60" />

              {/* Group 2: Logout */}
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        .wave {
          display: inline-block;
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </nav>
  )
}
