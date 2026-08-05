'use client'

import { useState } from 'react'
import {
  Trophy,
  Award,
  Star,
  Target,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  locked: boolean
  progress?: number
  unlockedDate?: string
}

const achievements: Achievement[] = [
  {
    id: '1',
    name: 'Quick Learner',
    description: 'Complete 5 courses',
    icon: Zap,
    locked: false,
    unlockedDate: '2024-02-01',
  },
  {
    id: '2',
    name: 'Quiz Master',
    description: 'Score 100% on 3 quizzes',
    icon: Trophy,
    locked: false,
    unlockedDate: '2024-02-05',
  },
  {
    id: '3',
    name: 'Streak Champion',
    description: '30-day study streak',
    icon: Flame,
    locked: false,
    progress: 24,
    unlockedDate: '2024-02-10',
  },
  {
    id: '4',
    name: 'Knowledge Seeker',
    description: 'Earn 1000 XP',
    icon: Star,
    locked: false,
    unlockedDate: '2024-02-08',
  },
  {
    id: '5',
    name: 'Perfectionist',
    description: 'Perfect score on 5 assessments',
    icon: Award,
    locked: true,
    progress: 2,
  },
  {
    id: '6',
    name: 'Master of All',
    description: 'Complete courses in 5 different subjects',
    icon: Trophy,
    locked: true,
    progress: 2,
  },
]

export default function AchievementsPage() {
  const { currentUser } = useAuth()
  const unlockedCount = achievements.filter((a) => !a.locked).length
  const totalXP = 2350

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock badges
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Achievements Unlocked</p>
          <p className="text-3xl font-bold text-foreground">{unlockedCount}</p>
          <p className="text-xs text-muted-foreground mt-2">of {achievements.length} total</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Current Level</p>
          <p className="text-3xl font-bold text-primary">Advanced</p>
          <p className="text-xs text-muted-foreground mt-2">User since Jan 2024</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Total XP</p>
          <p className="text-3xl font-bold text-accent">{totalXP}</p>
          <p className="text-xs text-muted-foreground mt-2">1150 XP to next level</p>
        </div>
      </div>

      {/* Badges */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          return (
            <div
              key={achievement.id}
              className={`rounded-2xl border-2 p-6 text-center transition-all ${
                achievement.locked
                  ? 'border-border bg-muted/50 opacity-60'
                  : 'border-accent/30 bg-gradient-to-br from-accent/10 to-primary/10'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 rounded-full ${
                    achievement.locked
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-gradient-to-br from-accent to-primary text-white'
                  }`}
                >
                  {achievement.locked ? (
                    <Lock className="size-8" />
                  ) : (
                    <Icon className="size-8" />
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2">{achievement.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>

              {achievement.progress !== undefined && (
                <div className="mb-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{
                        width: `${(achievement.progress / (achievement.name === 'Perfectionist' ? 5 : achievement.name === 'Master of All' ? 5 : 30)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.name === 'Perfectionist' ? 5 : achievement.name === 'Master of All' ? 5 : 30}
                  </p>
                </div>
              )}

              {achievement.unlockedDate && (
                <p className="text-xs text-muted-foreground">
                  Unlocked {achievement.unlockedDate}
                </p>
              )}

              {achievement.locked && (
                <button className="mt-4 w-full px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:border-primary/50 transition-all opacity-75">
                  Locked
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-6">Leaderboard</h2>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'Sarah Chen', xp: 5250, you: false },
            { rank: 2, name: 'You', xp: 2350, you: true },
            { rank: 3, name: 'Mike Johnson', xp: 1890, you: false },
            { rank: 4, name: 'Emma Davis', xp: 1650, you: false },
            { rank: 5, name: 'Alex Kumar', xp: 1420, you: false },
          ].map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                entry.you
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50 border border-border'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {entry.you ? (currentUser?.full_name ? `${currentUser.full_name} (You)` : 'You') : entry.name}
                </p>
              </div>
              <p className="text-sm font-bold text-accent">{entry.xp} XP</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
