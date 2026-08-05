'use client'

import { motion } from 'motion/react'
import { Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export function AIRecommendation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="rounded-3xl border border-border bg-gradient-to-br from-card to-purple-50/30 p-6 shadow-sm overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute -left-8 -bottom-8 size-20 bg-purple-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-foreground">
                AI Recommendation
              </h3>
              <Sparkles className="size-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Personalized for you
            </p>
          </div>
        </div>

        {/* AI Character */}
        <div className="mb-4 flex justify-center">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>

        {/* Recommendation Text */}
        <div className="mb-5 p-3 rounded-lg bg-white/50 border border-purple-100">
          <p className="text-sm font-semibold text-foreground">
            Deep Learning Fundamentals
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on your strong performance in Machine Learning, this course will help you master deep neural networks and advanced AI concepts.
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Your Readiness</span>
            <span className="font-semibold text-primary">65%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>
        </div>

        {/* CTA */}
        <button className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
          Start Learning
          <ArrowRight className="size-4" />
        </button>
      </div>
    </motion.div>
  )
}


