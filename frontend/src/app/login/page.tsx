import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { AuthLeftPanel } from '@/components/auth/auth-left-panel'

export const metadata: Metadata = {
  title: 'Login — Arivu AI',
  description: 'Sign in to your Arivu AI account and continue learning smarter.',
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* Left Panel */}
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </div>
  )
}


