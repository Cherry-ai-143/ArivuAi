'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import {
  Sparkles,
  ArrowRight,
  Play,
  Brain,
  Flame,
  TrendingUp,
  CircleCheckBig,
} from 'lucide-react'

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Teachers' },
  { value: '1M+', label: 'AI Questions Generated' },
]

function Float({
  children,
  className,
  delay = 0,
  amplitude = 10,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  amplitude?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div
        animate={{ y: [0, -amplitude, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 left-[-10%] size-[420px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24">
        {/* LEFT */}
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Sparkles className="size-4 text-accent" />
            AI-Powered Personalized Learning
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-serif text-5xl font-bold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
          >
            The Future of Learning{' '}
            <span className="text-accent">Starts Here.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            Arivu AI transforms learning through AI-generated quizzes, adaptive
            assessments, intelligent recommendations, and deep analytics — helping
            students learn faster and teachers teach smarter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#cta"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[0_14px_40px_-12px_rgba(249,115,22,0.7)] transition-all hover:brightness-105"
            >
              Get Started Free
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
                <Play className="size-3 fill-primary" />
              </span>
              Watch Demo
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl font-bold text-primary">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground text-pretty">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto aspect-square w-full max-w-xl"
          >
            <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-b from-primary/10 to-accent/5 blur-2xl" />
            <Image
              src="/images/hero-ai-learning.png"
              alt="A student learning with Arivu AI, surrounded by an AI knowledge graph and glowing book"
              width={720}
              height={720}
              priority
              className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
            />

            {/* floating cards */}
            <Float
              delay={0.3}
              amplitude={12}
              className="absolute -left-2 top-10 z-20 sm:left-0"
            >
              <div className="glass w-44 rounded-2xl border border-border/70 p-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Brain className="size-4" />
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">AI Quiz Ready</p>
                    <p className="text-muted-foreground">8 questions</p>
                  </div>
                </div>
                <span className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-primary">
                  Medium
                </span>
              </div>
            </Float>

            <Float
              delay={0.5}
              amplitude={14}
              className="absolute -right-1 top-24 z-20 sm:right-0"
            >
              <div className="glass w-48 rounded-2xl border border-border/70 p-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    Recommended
                  </p>
                  <span className="text-[10px] font-semibold text-accent">
                    75% match
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Calculus Basics</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-3/4 rounded-full bg-accent" />
                </div>
              </div>
            </Float>

            <Float
              delay={0.65}
              amplitude={11}
              className="absolute bottom-24 -right-2 z-20 sm:right-2"
            >
              <div className="glass flex w-40 items-center gap-2 rounded-2xl border border-border/70 p-3 shadow-xl">
                <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Flame className="size-5" />
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">21 Day Streak</p>
                  <p className="text-muted-foreground">Keep it up!</p>
                </div>
              </div>
            </Float>

            <Float
              delay={0.8}
              amplitude={13}
              className="absolute -left-3 bottom-10 z-20 sm:left-2"
            >
              <div className="glass w-44 rounded-2xl border border-border/70 p-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <TrendingUp className="size-4 text-accent" />
                  Concept Understanding
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="font-serif text-2xl font-bold text-primary">
                    86%
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <CircleCheckBig className="size-3" /> Great!
                  </span>
                </div>
              </div>
            </Float>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


