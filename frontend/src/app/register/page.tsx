import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { AuthLeftPanel } from '@/components/auth/auth-left-panel'

export const metadata: Metadata = {
  title: 'Sign Up — Arivu AI',
  description: 'Create your Arivu AI account and start learning smarter today.',
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* Left Panel */}
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </div>
  )
}


