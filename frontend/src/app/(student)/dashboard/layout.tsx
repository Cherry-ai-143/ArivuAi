'use client'

import { SidebarProvider, useSidebar } from '@/context/sidebar-context'
import { Sidebar } from '@/components/student/sidebar'
import { TopNav } from '@/components/student/top-nav'

function StudentDashboardContent({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
        }}
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
      >

        <TopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <style jsx global>{`
            main::-webkit-scrollbar {
              width: 8px;
            }
            main::-webkit-scrollbar-track {
              background: transparent;
            }
            main::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 4px;
            }
            main::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <StudentDashboardContent>{children}</StudentDashboardContent>
    </SidebarProvider>
  )
}
