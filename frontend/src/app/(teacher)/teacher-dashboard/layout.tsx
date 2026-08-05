'use client'

import { TeacherSidebar } from '@/components/teacher/teacher-sidebar'
import { TeacherTopNav } from '@/components/teacher/teacher-top-nav'

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
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


