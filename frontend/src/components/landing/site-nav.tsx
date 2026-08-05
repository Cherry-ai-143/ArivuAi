'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6',
          scrolled
            ? 'glass my-3 rounded-2xl border border-border/70 py-2.5 shadow-[0_10px_40px_-15px_rgba(30,58,138,0.25)]'
            : 'my-0 border border-transparent py-4',
        )}
      >
        <a href="#top" className="flex items-center" aria-label="Arivu AI home">
          <BrandLogo priority imgClassName="h-11 w-auto" />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Login
          </a>
          <a
            href="/register"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(249,115,22,0.6)] transition-all hover:brightness-105"
          >
            Get Started
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-4 mt-2 rounded-2xl border border-border bg-card p-4 shadow-xl lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold"
            >
              Login
            </a>
            <a
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}


