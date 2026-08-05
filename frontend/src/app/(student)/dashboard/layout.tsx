'use client'

import { Sidebar } from '@/components/student/sidebar'
import { TopNav } from '@/components/student/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
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


