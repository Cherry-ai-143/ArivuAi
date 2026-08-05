'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2, Circle } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { calculateProfileCompletion } from '@/types/user-profile'

export function ProfileCompletionWidget() {
  const { currentUser, profileDetails } = useAuth()

  const completion = useMemo(
    () => calculateProfileCompletion(currentUser, profileDetails),
    [currentUser, profileDetails]
  )

  if (completion.percentage >= 100) {
    return null
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Profile Completion</h3>
        </div>
        <span className="text-sm font-bold text-accent">{completion.percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-indigo-600 to-accent transition-all duration-500 rounded-full"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      {/* Missing Items */}
      {completion.missingItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Missing Actions:
          </p>
          <div className="flex flex-wrap gap-2">
            {completion.missingItems.map((item) => (
              <Link
                key={item.key}
                href="/dashboard/profile?edit=true"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors"
              >
                <Circle className="size-3 text-accent" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="pt-1 flex justify-end">
        <Link
          href="/dashboard/profile?edit=true"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Complete Profile
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
