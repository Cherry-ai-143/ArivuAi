'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { register as registerApi } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import {
  registerSchema,
  type RegisterFormValues,
  getPasswordRequirements,
} from '@/lib/validations/auth'

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      agreeTerms: false,
    },
  })

  const currentRole = watch('role')
  const currentPassword = watch('password') || ''
  const passwordRequirements = useMemo(
    () => getPasswordRequirements(currentPassword),
    [currentPassword]
  )

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await registerApi({
        full_name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      })

      setSuccessMessage('Account created successfully.')
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/login')
    } catch (error) {
      const parsedError = getApiErrorMessage(error)
      if (parsedError.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: parsedError })
      }
      setErrorMessage(parsedError)

      // Scroll to first invalid field or top banner
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleInvalidSubmit = (formErrors: typeof errors) => {
    const errorKeys = Object.keys(formErrors) as (keyof RegisterFormValues)[]
    if (errorKeys.length > 0) {
      const firstErrorField = document.getElementById(errorKeys[0])
      if (firstErrorField) {
        firstErrorField.focus()
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
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
        <h1 className="font-serif text-3xl font-bold text-foreground">Create Your Account</h1>
        <p className="mt-2 text-muted-foreground">
          Join thousands of students and teachers learning smarter with Arivu AI.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-5" noValidate>
        {errorMessage ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}
        {successMessage ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        ) : null}

        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'student', label: 'Student' },
              { value: 'teacher', label: 'Teacher' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('role', option.value as 'student' | 'teacher', { shouldValidate: true })}
                disabled={isSubmitting}
                className={`px-4 py-3 rounded-xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                  currentRole === option.value
                    ? 'bg-primary text-primary-foreground border border-primary'
                    : 'border border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            placeholder="John Doe"
            {...register('full_name')}
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? 'full_name-error' : undefined}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${
              errors.full_name
                ? 'border-destructive focus:ring-destructive/50'
                : 'border-border focus:ring-primary/50 focus:border-transparent'
            }`}
          />
          {errors.full_name ? (
            <p id="full_name-error" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.full_name.message}
            </p>
          ) : null}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${
              errors.email
                ? 'border-destructive focus:ring-destructive/50'
                : 'border-border focus:ring-primary/50 focus:border-transparent'
            }`}
          />
          {errors.email ? (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          ) : null}
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
              {...register('password')}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-requirements password-error"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 pr-12 disabled:cursor-not-allowed disabled:opacity-70 ${
                errors.password
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border focus:ring-primary/50 focus:border-transparent'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          ) : null}

          {/* Live Password Strength Checklist */}
          <div id="password-requirements" className="mt-3 space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
            <p className="font-medium text-muted-foreground mb-1">Password Requirements:</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {passwordRequirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-1.5 transition-colors ${
                    req.isMet ? 'text-emerald-600 font-medium' : 'text-muted-foreground'
                  }`}
                >
                  <Check
                    className={`size-3.5 ${
                      req.isMet ? 'text-emerald-600' : 'text-muted-foreground/40'
                    }`}
                  />
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 pr-12 disabled:cursor-not-allowed disabled:opacity-70 ${
                errors.confirmPassword
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border focus:ring-primary/50 focus:border-transparent'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p id="confirmPassword-error" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        {/* Terms & Privacy */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              id="agreeTerms"
              type="checkbox"
              {...register('agreeTerms')}
              aria-invalid={Boolean(errors.agreeTerms)}
              aria-describedby={errors.agreeTerms ? 'agreeTerms-error' : undefined}
              disabled={isSubmitting}
              className="mt-1 size-4 rounded border border-border cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{' '}
              <a href="#" className="text-primary font-medium hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary font-medium hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeTerms ? (
            <p id="agreeTerms-error" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.agreeTerms.message}
            </p>
          ) : null}
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full mt-6 group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(249,115,22,0.6)] transition-all hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary transition-colors hover:text-primary/80">
          Sign In
        </Link>
      </p>
    </motion.div>
  )
}
