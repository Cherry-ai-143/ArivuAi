'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { SectionHeading } from './section-heading'

const faqs = [
  {
    q: 'What is Arivu AI?',
    a: 'Arivu AI is an AI-powered personalized learning platform that helps students and teachers learn and teach faster. Teachers create courses and assessments, while students study, generate practice quizzes, and improve with AI-driven recommendations.',
  },
  {
    q: 'How does AI quiz generation work?',
    a: 'Arivu AI analyzes your course content and lessons, understands the key concepts, and instantly generates relevant, high-quality quizzes with adjustable difficulty and detailed explanations.',
  },
  {
    q: 'Is Arivu AI suitable for all ages?',
    a: 'Yes. Arivu AI adapts to each learner’s level and pace, making it effective for school students, university learners, and competitive exam aspirants alike.',
  },
  {
    q: 'Can teachers track student performance?',
    a: 'Absolutely. Teachers get a powerful dashboard with performance graphs, weak and strong topic analysis, study streaks, and per-student progress reports.',
  },
  {
    q: 'Is my data safe with Arivu AI?',
    a: 'Your data is protected with industry-standard security practices, encrypted storage, and strict access controls. We never sell your personal learning data.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-border bg-card px-5 transition-colors hover:border-primary/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-foreground">{q}</span>
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-primary transition-transform duration-300 ${
            open ? 'rotate-45 bg-accent text-accent-foreground' : ''
          }`}
        >
          <Plus className="size-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
      <div className="mt-12 space-y-3">
        {faqs.map((f) => (
          <FaqItem key={f.q} {...f} />
        ))}
      </div>
    </section>
  )
}


