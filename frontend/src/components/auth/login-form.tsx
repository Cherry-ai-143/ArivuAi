'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/api/errors'

export function LoginForm() {
  const router = useRouter()
  const { login: loginWithAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const isFormValid = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid || isLoading) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      await loginWithAuth({ email, password })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-8"
      >
        <span>←</span>
        Back to Home
      </Link>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to your account to continue your learning journey.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errorMessage) {
                setErrorMessage('')
              }
            }}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) {
                  setErrorMessage('')
                }
              }}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent pr-12 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              disabled={isLoading}
              className="size-4 rounded border border-border cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <a
            href="#"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full mt-6 group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(249,115,22,0.6)] transition-all hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="size-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-primary transition-colors hover:text-primary/80">
          Create Account
        </Link>
      </p>
    </motion.div>
  )
}


