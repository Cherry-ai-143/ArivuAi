import {
  Brain,
  Sparkles,
  Lightbulb,
  BarChart3,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const features = [
  {
    icon: Brain,
    title: 'AI Quiz Generation',
    desc: 'Generate smart, high-quality quizzes instantly from any lesson or uploaded content.',
  },
  {
    icon: Sparkles,
    title: 'Adaptive Learning',
    desc: 'Personalized learning paths that automatically adapt to each student’s pace and performance.',
  },
  {
    icon: Lightbulb,
    title: 'Personalized Recommendations',
    desc: 'AI recommends exactly what to learn next for maximum improvement and retention.',
  },
  {
    icon: BarChart3,
    title: 'Learning Analytics',
    desc: 'Deep insights into performance, progress, and evolving learning patterns.',
  },
  {
    icon: BookOpen,
    title: 'Course Management',
    desc: 'Create, organize, and manage courses and learning materials with ease.',
  },
  {
    icon: LayoutDashboard,
    title: 'Teacher Dashboard',
    desc: 'Powerful tools to monitor, evaluate, and support every student in one place.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading
        eyebrow="Powerful Features"
        title="Everything you need to learn and teach better with AI"
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i % 3}>
            <article className="group h-full rounded-3xl border border-border bg-card p-7 shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_24px_60px_-30px_rgba(30,58,138,0.35)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <f.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2.5 leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}


