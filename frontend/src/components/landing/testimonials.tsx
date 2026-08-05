import { Star } from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const testimonials = [
  {
    quote:
      'Arivu AI changed the way I study. The AI quizzes and personalized recommendations helped me improve my scores from 60% to 92%.',
    name: 'Ananya R.',
    role: 'Engineering Student',
    initials: 'AR',
  },
  {
    quote:
      'As a teacher, Arivu AI saves me hours of work. Generating quizzes and tracking students has never been this easy.',
    name: 'Rahul Sharma',
    role: 'High School Teacher',
    initials: 'RS',
  },
  {
    quote:
      'The analytics and insights help me understand my weak topics instantly. It’s like having a personal AI tutor 24/7.',
    name: 'Vikram S.',
    role: 'NEET Aspirant',
    initials: 'VS',
  },
]

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28"
    >
      <SectionHeading
        eyebrow="What Our Users Say"
        title="Loved by learners and educators worldwide"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i}>
            <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-30px_rgba(30,58,138,0.35)]">
              <div className="flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-4 fill-accent" />
                ))}
              </div>
              <blockquote className="mt-4 grow leading-relaxed text-foreground text-pretty">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid size-11 place-items-center rounded-full bg-primary font-serif text-sm font-bold text-primary-foreground">
                  {t.initials}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}


