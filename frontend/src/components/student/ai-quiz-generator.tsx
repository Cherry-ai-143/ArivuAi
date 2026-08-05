'use client'

import { motion } from 'motion/react'
import { Upload, Sparkles, FileText, BarChart3 } from 'lucide-react'

export function AIQuizGenerator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-7 shadow-sm"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-xl bg-accent/10">
            <Sparkles className="size-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-foreground">
              AI Quiz Generator
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create quizzes instantly
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6 rounded-xl border-2 border-dashed border-border bg-muted/50 p-6 text-center hover:border-accent hover:bg-muted transition-colors cursor-pointer group">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-2.5 group-hover:bg-accent/20 transition-colors">
            <Upload className="size-5 text-accent" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drop files here or click
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, Notes, Textbooks supported
          </p>
        </div>
      </div>

      {/* Generation Options */}
      <div className="space-y-3 mb-6">
        <button className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-accent hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="size-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Generate from Topic
              </p>
              <p className="text-xs text-muted-foreground">
                Choose course topic
              </p>
            </div>
          </div>
          <Sparkles className="size-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-accent hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 group-hover:bg-purple-200 transition-colors">
              <FileText className="size-4 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                From Study Notes
              </p>
              <p className="text-xs text-muted-foreground">
                Previous quizzes
              </p>
            </div>
          </div>
          <Sparkles className="size-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <button className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition-all flex items-center justify-center gap-2">
        <Sparkles className="size-4" />
        Generate Quiz
      </button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        💡 Tip: Upload personal study materials only. Create high-quality quizzes in seconds.
      </p>
    </motion.div>
  )
}


