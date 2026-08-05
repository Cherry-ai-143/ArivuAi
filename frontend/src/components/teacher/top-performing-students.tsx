'use client'

import Image from 'next/image'
import { TrendingUp, ArrowRight } from 'lucide-react'

interface Student {
  id: string
  name: string
  avatar: string
  score: number
  improvement: number
  rank: number
}

const students: Student[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    score: 92,
    improvement: 12,
    rank: 1,
  },
  {
    id: '2',
    name: 'Emma Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    score: 89,
    improvement: 8,
    rank: 2,
  },
  {
    id: '3',
    name: 'Michael Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    score: 88,
    improvement: 15,
    rank: 3,
  },
  {
    id: '4',
    name: 'Sophia Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    score: 86,
    improvement: 7,
    rank: 4,
  },
  {
    id: '5',
    name: 'James Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    score: 85,
    improvement: 10,
    rank: 5,
  },
]

export function TopPerformingStudents() {
  return (
    <div className="rounded-2xl bg-white border border-border shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Top Performing Students
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Based on quiz and assignment scores
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-muted rounded-lg transition-colors">
          View All <ArrowRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="rounded-xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-5 hover:shadow-md transition-all"
          >
            {/* Rank Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                {student.rank}
              </div>
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-4">
              <Image
                src={student.avatar}
                alt={student.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full mb-3"
              />
              <h4 className="font-semibold text-foreground text-sm">
                {student.name}
              </h4>
            </div>

            {/* Score */}
            <div className="py-3 border-y border-border/50 mb-4">
              <p className="text-xs text-muted-foreground text-center">
                Average Score
              </p>
              <p className="text-lg font-bold text-foreground text-center">
                {student.score}%
              </p>
            </div>

            {/* Improvement */}
            <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-semibold">
              <TrendingUp className="size-3" />
              {student.improvement}% improvement
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


