import { ArrowRight, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { Reveal } from './reveal'

const weakTopics = [
  { name: 'Trigonometry', value: 52 },
  { name: 'Vectors', value: 45 },
  { name: 'Limits', value: 38 },
  { name: 'Probability', value: 32 },
]

const strongTopics = [
  { name: 'Algebra', value: 92 },
  { name: 'Calculus', value: 88 },
  { name: 'Geometry', value: 85 },
  { name: 'Statistics', value: 80 },
]

const trend = [28, 34, 30, 46, 42, 58, 54, 68, 74]

function LineChart() {
  const w = 320
  const h = 130
  const max = 80
  const stepX = w / (trend.length - 1)
  const points = trend.map((v, i) => [i * stepX, h - (v / max) * h])
  const line = points.map((p) => `${p[0]},${p[1]}`).join(' ')
  const area = `0,${h} ${line} ${w},${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={i === points.length - 1 ? 4 : 2.5}
          fill={i === points.length - 1 ? '#f97316' : '#1e3a8a'}
        />
      ))}
    </svg>
  )
}

function TopicBar({
  name,
  value,
  tone,
}: {
  name: string
  value: number
  tone: 'weak' | 'strong'
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{name}</span>
        <span
          className={
            tone === 'weak' ? 'font-semibold text-accent' : 'font-semibold text-emerald-600'
          }
        >
          {value}%
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${tone === 'weak' ? 'bg-accent' : 'bg-emerald-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function Analytics() {
  return (
    <section className="border-y border-border bg-secondary/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
          <Reveal>
            <div>
              <span className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">
                AI-Powered Analytics
              </span>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
                Understand. Improve. Achieve.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                Get detailed insights into learning patterns and performance. Arivu
                AI pinpoints weak topics, celebrates strengths, and turns every
                data point into a smarter next step.
              </p>
              <a
                href="#cta"
                className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-accent"
              >
                View analytics
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Performance */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Performance Over Time
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp className="size-3.5" /> +24%
                  </span>
                </div>
                <LineChart />
              </div>

              {/* Weak topics */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">Weak Topics</p>
                <div className="mt-4 space-y-3">
                  {weakTopics.map((t) => (
                    <TopicBar key={t.name} {...t} tone="weak" />
                  ))}
                </div>
              </div>

              {/* Strong topics */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">Strong Topics</p>
                <div className="mt-4 space-y-3">
                  {strongTopics.map((t) => (
                    <TopicBar key={t.name} {...t} tone="strong" />
                  ))}
                </div>
              </div>

              {/* Study time donut */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">Study Time</p>
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className="relative grid size-24 shrink-0 place-items-center rounded-full"
                    style={{
                      background:
                        'conic-gradient(#f97316 0deg 140deg, #1e3a8a 140deg 250deg, #10b981 250deg 360deg)',
                    }}
                  >
                    <div className="grid size-16 place-items-center rounded-full bg-card">
                      <span className="font-serif text-sm font-bold text-primary">
                        24h
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm bg-accent" /> Lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm bg-primary" /> Practice
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm bg-emerald-500" /> Assessments
                    </li>
                  </ul>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> 24h 35m this week
                </p>
              </div>

              {/* Recommendation */}
              <div className="flex flex-col justify-between rounded-3xl border border-primary/15 bg-primary p-5 text-primary-foreground shadow-sm">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
                    <Sparkles className="size-3.5 text-accent" /> AI Recommendation
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
                    Focus more on{' '}
                    <span className="font-semibold text-white">Trigonometry</span> and
                    generate practice quizzes to lift your score.
                  </p>
                </div>
                <a
                  href="#cta"
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
                >
                  View details
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}


