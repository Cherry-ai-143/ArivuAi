'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { CreateCourseDialog } from '@/components/teacher/courses/create-course-dialog';
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar';
import { TeacherTopNav } from '@/components/teacher/teacher-top-nav';

export default function CourseBuilderPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (currentUser?.role !== 'teacher' && currentUser?.role !== 'admin') {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Loading Course Creation Wizard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (currentUser?.role !== 'teacher' && currentUser?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar />
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        <TeacherTopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Launch the complete Multi-Step Course Creation Wizard starting at Step 1 */}
          <CreateCourseDialog
            isOpen={true}
            onClose={() => router.push('/teacher-dashboard/courses')}
          />
        </main>
      </div>
    </div>
  );
}
