import { SiteNav } from '@/components/landing/site-nav'
import { Hero } from '@/components/landing/hero'
import { TrustedTech } from '@/components/landing/trusted-tech'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Solutions } from '@/components/landing/solutions'
import { Analytics } from '@/components/landing/analytics'
import { Testimonials } from '@/components/landing/testimonials'
import { Faq } from '@/components/landing/faq'
import { Cta } from '@/components/landing/cta'
import { SiteFooter } from '@/components/landing/site-footer'

export default function Page() {
  return (
    <main className="relative">
      <SiteNav />
      <Hero />
      <TrustedTech />
      <Features />
      <HowItWorks />
      <Solutions />
      <Analytics />
      <Testimonials />
      <Faq />
      <Cta />
      <SiteFooter />
    </main>
  )
}


