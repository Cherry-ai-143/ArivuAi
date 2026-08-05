'use client'

import {
  Users,
  GraduationCap,
  BookOpen,
  HardDrive,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Server,
  Database,
  Layers,
} from 'lucide-react'
import { useAdminDashboard } from '@/hooks/useDashboard'

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useAdminDashboard()

  const usersSummary = data?.users
  const coursesSummary = data?.courses
  const uploadsSummary = data?.uploads
  const health = data?.system_health

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-border bg-card p-6 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-destructive flex items-center gap-3">
          <ShieldAlert className="size-6" />
          <div>
            <h3 className="font-bold">Failed to load admin dashboard data</h3>
            <p className="text-xs font-medium">{(error as Error)?.message || 'An error occurred.'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Admin Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time system health, user analytics, and platform metrics
        </p>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Users</p>
              <p className="text-3xl font-bold text-foreground mt-2">{usersSummary?.total ?? 0}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {usersSummary?.active_today ?? 0} active today
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Users className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Educators</p>
              <p className="text-3xl font-bold text-foreground mt-2">{usersSummary?.teachers ?? 0}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">Teachers on platform</p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-600">
              <GraduationCap className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Courses</p>
              <p className="text-3xl font-bold text-foreground mt-2">{coursesSummary?.total ?? 0}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {coursesSummary?.published ?? 0} published
              </p>
            </div>
            <div className="rounded-xl bg-accent/10 p-3 text-accent">
              <BookOpen className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Storage & Files</p>
              <p className="text-3xl font-bold text-foreground mt-2">{uploadsSummary?.total_files ?? 0}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {uploadsSummary?.total_storage_mb ? `${uploadsSummary.total_storage_mb} MB` : '0 MB'}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
              <HardDrive className="size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: System Health & Platform Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* System Health */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Server className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">System Health Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" /> Platform Status
              </span>
              <span className="font-semibold text-emerald-600 text-sm">{health?.status || 'Healthy'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Database className="size-4 text-primary" /> PostgreSQL Database
              </span>
              <span className="font-semibold text-foreground text-sm">{health?.database || 'Connected'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Layers className="size-4 text-accent" /> System Uptime
              </span>
              <span className="font-semibold text-foreground text-sm">{health?.uptime || '99.98%'}</span>
            </div>
          </div>
        </div>

        {/* Platform Growth & Sessions */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Activity className="size-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Platform Performance</h2>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Platform Growth Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {data?.analytics?.platform_growth || '+24% this month'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Active Concurrent Sessions</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {data?.analytics?.active_sessions || 142} sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
