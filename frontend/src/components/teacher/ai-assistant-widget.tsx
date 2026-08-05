'use client'

import { Sparkles, FileText, CheckSquare, PlusCircle, ArrowRight } from 'lucide-react'

interface AIAction {
  id: string
  icon: React.ReactNode
  label: string
  description: string
}

const aiActions: AIAction[] = [
  {
    id: '1',
    icon: <CheckSquare className="size-5" />,
    label: 'Generate Quiz',
    description: 'From any topic',
  },
  {
    id: '2',
    icon: <FileText className="size-5" />,
    label: 'Generate Questions',
    description: 'From textbooks',
  },
  {
    id: '3',
    icon: <PlusCircle className="size-5" />,
    label: 'Create Assignment',
    description: 'With AI assistance',
  },
  {
    id: '4',
    icon: <Sparkles className="size-5" />,
    label: 'Analyze Content',
    description: 'Study materials',
  },
]

export function AIAssistantWidget() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 shadow-sm p-8">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/20 text-accent">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            AI Assistant for Teachers
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate questions, create quizzes and get AI help
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {aiActions.map((action) => (
          <button
            key={action.id}
            className="flex items-center gap-2 p-3 rounded-lg bg-white/50 hover:bg-white transition-colors text-left group"
          >
            <div className="text-accent flex-shrink-0">{action.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* CTA Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:brightness-110 transition-all">
        Open AI Assistant <ArrowRight className="size-4" />
      </button>
    </div>
  )
}


