'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { getDashboardPathForRole } from '@/lib/auth/auth-guards';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const publicRoutes = ['/login', '/register'];
    const dashboardRoutes = ['/dashboard', '/teacher-dashboard', '/admin-dashboard'];
    const publicPageRoutes = ['/', '/about', '/contact', '/pricing', '/features'];

    // Map alternative role dashboard URLs to actual Next.js routes
    if (pathname === '/student/dashboard') {
      router.replace('/dashboard');
      return;
    }
    if (pathname === '/teacher/dashboard') {
      router.replace('/teacher-dashboard');
      return;
    }
    if (pathname === '/admin/dashboard') {
      router.replace('/admin-dashboard');
      return;
    }

    // Allow public pages for all users (authenticated or not)
    if (publicPageRoutes.includes(pathname)) {
      return;
    }

    // Unauthenticated users trying to access protected routes go to login
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.replace('/login');
      return;
    }

    // Authenticated users on login/register routes go to their role dashboard
    if (isAuthenticated && currentUser?.role && publicRoutes.includes(pathname)) {
      const destination = getDashboardPathForRole(currentUser.role);
      if (destination) {
        router.replace(destination);
      }
      return;
    }

    // Validate dashboard roles - only redirect if role doesn't match current dashboard
    if (isAuthenticated && dashboardRoutes.some(route => pathname.startsWith(route))) {
      // Allow all authenticated roles (teachers, admins, students) to view course details & learning page
      if (pathname.startsWith('/dashboard/courses')) {
        return;
      }

      const destination = getDashboardPathForRole(currentUser?.role);
      const isCorrectDashboard = destination && pathname.startsWith(destination);
      
      if (!isCorrectDashboard && destination) {
        router.replace(destination);
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, currentUser?.role]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Checking session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

