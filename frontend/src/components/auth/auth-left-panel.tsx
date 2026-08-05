'use client'

import { motion } from 'motion/react'
import {
  Brain,
  Zap,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Personalized learning adapted to your pace',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Real-time analysis and recommendations',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'See improvement with detailed analytics',
  },
]

export function AuthLeftPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-blue-900 to-primary/90 p-8 lg:flex lg:flex-col lg:justify-between">
      {/* Premium background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Blurred gradient circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 via-accent to-transparent blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-accent via-blue-400 to-transparent blur-3xl opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl opacity-10" />
        
        {/* Soft glowing accents */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-accent/20 blur-2xl opacity-30" />
        <div className="absolute bottom-32 left-32 w-40 h-40 rounded-full bg-blue-400/10 blur-2xl opacity-20" />
        
        {/* AI grid pattern - very subtle */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top section with logo and brand */}
      <div>
        {/* Logo and brand text - Premium styling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-12"
        >
          {/* Logo in rounded container */}
          <div className="flex-shrink-0 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 shadow-lg">
            <Image
              src="/logos/arivu-logo.png"
              alt="Arivu AI"
              width={200}
              height={200}
              className="h-16 w-auto object-contain brightness-0 invert"
              priority
            />
          </div>

          {/* Brand text next to logo */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-white leading-tight">
              Arivu AI
            </h1>
            <p className="text-sm text-white/90 font-medium mt-0.5">
              Learn Smarter. Achieve Faster.
            </p>
          </div>
        </motion.div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="font-serif text-4xl font-bold text-white text-balance lg:text-5xl leading-tight">
            Unlock Your Learning Potential
          </h2>

          <p className="mt-4 text-lg text-white/80 text-pretty leading-relaxed">
            Experience personalized AI-powered learning that adapts to your unique style and pace.
          </p>
        </motion.div>

        {/* Premium feature items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 space-y-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                className="group flex items-start gap-4 cursor-default"
              >
                {/* Premium glass icon */}
                <div className="mt-1 flex-shrink-0 relative">
                  {/* Glowing background */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent to-accent/50 opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300" />
                  
                  {/* Icon container */}
                  <div className="relative flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-accent group-hover:bg-white/25 group-hover:border-white/40 transition-all duration-300 shadow-lg">
                    <Icon className="size-5.5" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Feature text */}
                <div className="pt-1 flex-1">
                  <h3 className="font-semibold text-white text-base">{feature.title}</h3>
                  <p className="mt-1 text-sm text-white/70 group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Bottom accent - subtle AI element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center gap-2 pt-8 border-t border-white/10"
      >
        <Sparkles className="size-4 text-accent" />
        <span className="text-sm text-white/70">
          Powered by advanced AI technology
        </span>
      </motion.div>
    </div>
  )
}


