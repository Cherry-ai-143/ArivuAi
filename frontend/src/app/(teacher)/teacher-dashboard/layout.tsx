'use client'

import { SidebarProvider, useSidebar } from '@/context/sidebar-context'
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar'
import { TeacherTopNav } from '@/components/teacher/teacher-top-nav'

function TeacherDashboardContent({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar()

  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar />
      <div
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
        }}
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
      >

        <TeacherTopNav />
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

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <TeacherDashboardContent>{children}</TeacherDashboardContent>
    </SidebarProvider>
  )
}
