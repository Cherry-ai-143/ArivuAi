import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'

import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { AuthGuardClient } from './auth-guard-client'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Arivu AI — Learn Smarter. Achieve Faster.',
  description:
    'Arivu AI is an AI-powered personalized learning platform that helps students and teachers learn faster with AI-generated quizzes, adaptive assessments, intelligent recommendations, and analytics.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e3a8a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} bg-background`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <AuthGuardClient>{children}</AuthGuardClient>
          </AuthProvider>
        </QueryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
