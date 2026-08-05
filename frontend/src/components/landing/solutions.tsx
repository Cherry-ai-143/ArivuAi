import Image from 'next/image'
import { Check, ArrowRight, Flame, Trophy, Users } from 'lucide-react'
import { Reveal } from './reveal'

const studentBenefits = [
  'Access high-quality courses',
  'Generate AI quizzes anytime',
  'Get instant feedback & explanations',
  'Track your progress with analytics',
  'Personalized recommendations',
  'Improve continuously with AI',
]

const teacherBenefits = [
  'Create and manage courses',
  'Upload content and materials',
  'Generate AI quizzes in seconds',
  'Create manual assessments',
  'Monitor student performance',
  'Advanced analytics & reports',
]

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <Check className="size-3.5" />
          </span>
          <span className="text-sm leading-relaxed text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Solutions() {
  return (
    <section id="solutions" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
      {/* Students */}
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-primary">
              For Students
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              Learn smarter with AI
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-pretty">
              Enroll in courses, generate personalized practice quizzes, and let AI
              guide you to your weakest topics — so every study session counts.
            </p>
            <BenefitList items={studentBenefits} />
            <a
              href="#cta"
              className="group mt-7 inline-flex items-center gap-1.5 font-semibold text-accent"
            >
              Explore student tools
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-secondary to-card p-6 shadow-[0_30px_80px_-40px_rgba(30,58,138,0.4)]">
              <Image
                src="/images/student-experience.png"
                alt="Student using Arivu AI on a laptop"
                width={560}
                height={480}
                className="mx-auto h-auto w-full max-w-md object-contain"
              />
            </div>
            <div className="glass absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl border border-border/70 p-3 shadow-xl">
              <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
                <Flame className="size-5" />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-foreground">14 Day Streak</p>
                <p className="text-muted-foreground">On fire!</p>
              </div>
            </div>
            <div className="glass absolute -top-4 right-4 flex items-center gap-2 rounded-2xl border border-border/70 p-3 shadow-xl">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="size-5" />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Quiz Score 88%</p>
                <p className="text-muted-foreground">Improving</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Teachers */}
      <div className="mt-24 grid items-center gap-10 lg:mt-32 lg:grid-cols-2">
        <Reveal className="lg:order-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-primary">
              For Teachers
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              Teach smarter with AI
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-pretty">
              Build courses, upload materials, and generate assessments in seconds —
              while Arivu AI tracks every student and surfaces who needs help.
            </p>
            <BenefitList items={teacherBenefits} />
            <a
              href="#cta"
              className="group mt-7 inline-flex items-center gap-1.5 font-semibold text-accent"
            >
              Explore teacher tools
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={1} className="lg:order-1">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-secondary to-card p-6 shadow-[0_30px_80px_-40px_rgba(30,58,138,0.4)]">
              <Image
                src="/images/teacher-experience.png"
                alt="Teacher using Arivu AI on a laptop"
                width={560}
                height={480}
                className="mx-auto h-auto w-full max-w-md object-contain"
              />
            </div>
            <div className="glass absolute -top-4 left-4 flex items-center gap-3 rounded-2xl border border-border/70 p-3 shadow-xl">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="font-serif text-lg font-bold text-primary">352</p>
                  <p className="text-muted-foreground">Students</p>
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-accent">18</p>
                  <p className="text-muted-foreground">Courses</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}


