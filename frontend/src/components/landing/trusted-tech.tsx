import { Reveal } from './reveal'

const tech = [
  'Next.js',
  'React',
  'FastAPI',
  'Google Gemini',
  'Tailwind CSS',
  'TypeScript',
  'PostgreSQL',
  'ChromaDB',
]

export function TrustedTech() {
  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal>
          <p className="text-center text-sm font-medium tracking-wide text-muted-foreground">
            Trusted by modern technologies
          </p>
        </Reveal>
        <Reveal delay={1}>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {tech.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 text-base font-semibold text-foreground/70 transition-colors hover:text-primary"
              >
                <span className="size-1.5 rounded-full bg-accent" />
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}


