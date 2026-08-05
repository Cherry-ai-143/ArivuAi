import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'

export function Cta() {
  return (
    <section id="cta" className="scroll-mt-24 px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
            {/* ambient glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 size-72 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -bottom-24 right-1/3 size-72 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-serif text-4xl font-bold tracking-tight text-balance text-primary-foreground sm:text-5xl">
                  Ready to Learn Smarter?
                </h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-primary-foreground/80 text-pretty">
                  Join thousands of learners and educators using Arivu AI to
                  accelerate learning and achieve faster.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[0_14px_40px_-12px_rgba(249,115,22,0.8)] transition-all hover:brightness-105"
                  >
                    Get Started Free
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-white/10"
                  >
                    Sign In
                  </a>
                </div>
              </div>

              <div className="relative">
                <Image
                  src="/images/cta-education-3d.png"
                  alt="3D graduation cap and book illustration"
                  width={520}
                  height={420}
                  className="mx-auto h-auto w-full max-w-sm object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}


