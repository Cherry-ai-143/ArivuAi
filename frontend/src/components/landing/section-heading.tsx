import { Reveal } from './reveal'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <Reveal>
        <span className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={1}>
        <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={2}>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}


