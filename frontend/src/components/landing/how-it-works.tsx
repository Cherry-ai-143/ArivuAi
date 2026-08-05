import {
  BookPlus,
  Upload,
  BrainCircuit,
  ClipboardCheck,
  GraduationCap,
  Wand2,
  PenLine,
  LineChart,
  Rocket,
} from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const steps = [
  {
    icon: BookPlus,
    title: 'Teacher Creates Course',
    desc: 'Create and organize a brand new course with structured lessons.',
    tags: ['New course', 'Lessons'],
  },
  {
    icon: Upload,
    title: 'Uploads Materials',
    desc: 'Upload any learning material and let Arivu AI take it from there.',
    tags: ['PDF', 'DOC', 'PPT', 'Video', 'Notes'],
  },
  {
    icon: BrainCircuit,
    title: 'AI Understands Content',
    desc: 'AI analyzes content and builds a deep knowledge graph.',
    tags: ['Knowledge graph', 'Neural network'],
  },
  {
    icon: ClipboardCheck,
    title: 'Creates Assessments',
    desc: 'Generate AI quizzes or craft manual assessments, then publish.',
    tags: ['AI Quiz', 'Manual', 'Publish'],
  },
  {
    icon: GraduationCap,
    title: 'Students Enroll & Learn',
    desc: 'Students browse courses, study lessons, and track progress.',
    tags: ['Study', 'Watch', 'Track'],
  },
  {
    icon: Wand2,
    title: 'Generate AI Practice',
    desc: 'Students generate personalized practice quizzes from lessons.',
    tags: ['Personalized', 'Practice'],
  },
  {
    icon: PenLine,
    title: 'Take Assessments',
    desc: 'Attempt quizzes and get instant scores with detailed explanations.',
    tags: ['Instant results', 'Explanations'],
  },
  {
    icon: LineChart,
    title: 'AI Learning Analytics',
    desc: 'Track performance, weak and strong topics, streaks, and timeline.',
    tags: ['Weak topics', 'Strong topics', 'Streak'],
  },
  {
    icon: Rocket,
    title: 'Continuous Improvement',
    desc: 'AI recommends study plans, revision topics, and next best steps.',
    tags: ['Study plans', 'Revision', 'Insights'],
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-border bg-secondary/40 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="A complete AI-powered learning journey"
          description="From a teacher's first upload to a student's continuous improvement — nine intelligent steps working together."
        />
      </div>

      <div className="mt-14 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max gap-5 px-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i % 5}>
              <article className="relative flex h-full w-64 flex-col rounded-3xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_24px_60px_-30px_rgba(30,58,138,0.35)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <step.icon className="size-6" />
                  </span>
                  <span className="font-serif text-4xl font-bold text-secondary-foreground/15">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {step.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground lg:hidden">
        Swipe to explore all nine steps →
      </p>
    </section>
  )
}


