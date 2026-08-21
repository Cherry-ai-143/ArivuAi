'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  ArrowLeft,
  Loader2,
  Target,
  FileText,
  RotateCcw,
  Star,
  Calendar,
  BarChart2,
  Trophy,
} from 'lucide-react'
import { getCourseById, Course } from '@/lib/services/course.service'
import { getPublishedAssessmentForLesson } from '@/lib/services/assessment.service'
import type { PublishedAssessment } from '@/types/assessment'

// ==========================================
// 1. ATMOSPHERIC DEEP PURPLE BACKGROUND & STARLIGHT
// ==========================================
function AtmosphericLavenderBackground() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Base Luminous Deep Purple-Indigo Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2E1065] via-[#4338CA] to-[#1E1B4B]" />

      {/* Radial Center Light Bloom */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#818CF8]/30 via-[#6366F1]/15 to-transparent" />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-purple-400/20 via-indigo-500/10 to-transparent blur-3xl" />

      {/* Ambient Sparkle Stars */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0">
          {[
            { id: 1, top: '8%', left: '10%', size: 3, delay: 0 },
            { id: 2, top: '18%', left: '86%', size: 4, delay: 0.8 },
            { id: 3, top: '72%', left: '6%', size: 3, delay: 1.6 },
            { id: 4, top: '82%', left: '90%', size: 4, delay: 0.4 },
            { id: 5, top: '35%', left: '92%', size: 3, delay: 1.2 },
            { id: 6, top: '88%', left: '48%', size: 3, delay: 2.0 },
          ].map((star) => (
            <motion.div
              key={star.id}
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: star.delay }}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
              }}
              className="absolute rounded-full bg-white shadow-[0_0_10px_#ffffff]"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 2. ROTATING RADIAL LIGHT RAYS BEHIND EMBLEM
// ==========================================
function RadialLightRays() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center select-none">
      <motion.div
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="w-[850px] h-[850px] opacity-30"
      >
        <svg viewBox="0 0 800 800" className="w-full h-full">
          <defs>
            <linearGradient id="rayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A5B4FC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 16 }).map((_, i) => (
            <polygon
              key={i}
              points="400,400 375,0 425,0"
              fill="url(#rayGrad)"
              transform={`rotate(${i * 22.5} 400 400)`}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  )
}

// ==========================================
// 3. WARM GOLDEN CIRCULAR GLOW & AMBIENT AURA
// ==========================================
function CentralAtmosphericGlow() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center select-none">
      {/* Outer Purple-Blue Aura */}
      <div className="w-[700px] h-[700px] rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl" />

      {/* Inner Warm Golden Halo */}
      <motion.div
        animate={shouldReduceMotion ? {} : { scale: [0.95, 1.08, 0.95], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full bg-gradient-to-r from-amber-300/40 via-yellow-200/50 to-amber-400/40 blur-2xl"
      />
    </div>
  )
}

// ==========================================
// 4. RICH BOTANICAL FLORA & DECORATIVE CORNER CLUSTERS
// ==========================================
function RichBotanicalClusters() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 select-none">
      {/* BOTTOM-LEFT BOTANICAL & CELEBRATION CLUSTER */}
      <motion.div
        initial={shouldReduceMotion ? {} : { y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
        className="absolute bottom-0 left-0 w-[240px] sm:w-[360px] md:w-[400px] h-[240px] sm:h-[360px] md:h-[400px] transform -translate-x-10 translate-y-10"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
          <defs>
            <linearGradient id="botanicalOrange" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="botanicalMagenta" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
            <linearGradient id="botanicalPurple" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          {/* Layer 1: Large Indigo Back Leaves */}
          <path d="M-20 420 C 60 220, 160 140, 260 260 C 180 340, 80 420, -20 420 Z" fill="url(#botanicalPurple)" />
          {/* Layer 2: Magenta Leaves */}
          <path d="M-40 420 C 40 160, 200 120, 310 290 C 220 370, 100 420, -40 420 Z" fill="url(#botanicalMagenta)" opacity="0.9" />
          {/* Layer 3: Vibrant Golden Orange Leaves */}
          <path d="M-10 420 C 80 240, 240 200, 350 340 C 260 400, 140 420, -10 420 Z" fill="url(#botanicalOrange)" opacity="0.95" />
          {/* Flower Bud Accents */}
          <circle cx="160" cy="240" r="14" fill="#FDE047" opacity="0.9" />
          <circle cx="220" cy="200" r="10" fill="#F43F5E" opacity="0.95" />
        </svg>
      </motion.div>

      {/* BOTTOM-RIGHT BOTANICAL & CELEBRATION CLUSTER */}
      <motion.div
        initial={shouldReduceMotion ? {} : { y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
        className="absolute bottom-0 right-0 w-[240px] sm:w-[360px] md:w-[400px] h-[240px] sm:h-[360px] md:h-[400px] transform translate-x-10 translate-y-10 scale-x-[-1]"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
          <defs>
            <linearGradient id="rightPurple" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="rightMagenta" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BE185D" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
            <linearGradient id="rightCyan" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0E7490" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          {/* Layer 1: Indigo Back Leaves */}
          <path d="M-20 420 C 60 220, 160 140, 260 260 C 180 340, 80 420, -20 420 Z" fill="url(#rightCyan)" opacity="0.8" />
          {/* Layer 2: Pink/Magenta Leaves */}
          <path d="M-40 420 C 40 160, 200 120, 310 290 C 220 370, 100 420, -40 420 Z" fill="url(#rightMagenta)" opacity="0.9" />
          {/* Layer 3: Vibrant Purple Front Leaves */}
          <path d="M-10 420 C 80 240, 240 200, 350 340 C 260 400, 140 420, -10 420 Z" fill="url(#rightPurple)" opacity="0.95" />
          {/* Flower Bud Accents */}
          <circle cx="170" cy="230" r="12" fill="#F43F5E" opacity="0.9" />
          <circle cx="230" cy="190" r="14" fill="#FBBF24" opacity="0.95" />
        </svg>
      </motion.div>

      {/* Floating Petals Drifting Upward */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0">
          {[
            { id: 1, startX: '10%', startY: '88%', endX: '24%', endY: '40%', color: '#F97316', delay: 0.8 },
            { id: 2, startX: '16%', startY: '92%', endX: '30%', endY: '30%', color: '#EC4899', delay: 1.4 },
            { id: 3, startX: '84%', startY: '88%', endX: '70%', endY: '38%', color: '#8B5CF6', delay: 1.0 },
            { id: 4, startX: '90%', startY: '92%', endX: '76%', endY: '28%', color: '#F59E0B', delay: 1.6 },
            { id: 5, startX: '22%', startY: '94%', endX: '34%', endY: '48%', color: '#38BDF8', delay: 1.8 },
            { id: 6, startX: '78%', startY: '94%', endX: '66%', endY: '46%', color: '#F43F5E', delay: 1.2 },
          ].map((petal) => (
            <motion.div
              key={petal.id}
              initial={{ x: petal.startX, y: petal.startY, opacity: 0, scale: 0.6, rotate: 0 }}
              animate={{
                x: [petal.startX, petal.endX],
                y: [petal.startY, petal.endY],
                opacity: [0, 0.95, 0],
                scale: [0.6, 1.1, 0.5],
                rotate: [0, 240],
              }}
              transition={{ duration: 4.2, repeat: Infinity, delay: petal.delay, ease: 'easeOut' }}
              className="absolute"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={petal.color}>
                <path d="M12 2C17 8 17 16 12 22C7 16 7 8 12 2Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. ANIMATED CONFETTI TRAJECTORY BLAST & SPARK FIREWORKS
// ==========================================
const CELEBRATION_COLORS = ['#F97316', '#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#FDE047']

function LayeredConfettiAndFireworks({ trigger }: { trigger: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  // Confetti particles launched from Left & Right Cannons
  const confettiParticles = useMemo(() => {
    const list: any[] = []
    let id = 0

    // Left Cannon Burst (Bottom-Left -> Diagonally Upward & Inward)
    for (let i = 0; i < 35; i++) {
      const angle = -75 + Math.random() * 55
      const rad = (angle * Math.PI) / 180
      const dist = 320 + Math.random() * 320
      list.push({
        id: id++,
        side: 'left',
        xEnd: Math.cos(rad) * dist,
        yEnd: Math.sin(rad) * dist,
        rotate: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        type: i % 5 === 0 ? 'star' : i % 4 === 0 ? 'petal' : i % 3 === 0 ? 'strip' : 'rect',
        delay: 0.4 + Math.random() * 0.45,
        duration: 2.2 + Math.random() * 0.9,
      })
    }

    // Right Cannon Burst (Bottom-Right -> Diagonally Upward & Inward)
    for (let i = 0; i < 35; i++) {
      const angle = -105 - Math.random() * 55
      const rad = (angle * Math.PI) / 180
      const dist = 320 + Math.random() * 320
      list.push({
        id: id++,
        side: 'right',
        xEnd: Math.cos(rad) * dist,
        yEnd: Math.sin(rad) * dist,
        rotate: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: CELEBRATION_COLORS[(i + 3) % CELEBRATION_COLORS.length],
        type: i % 5 === 0 ? 'star' : i % 4 === 0 ? 'petal' : i % 3 === 0 ? 'strip' : 'rect',
        delay: 0.4 + Math.random() * 0.45,
        duration: 2.2 + Math.random() * 0.9,
      })
    }

    return list
  }, [])

  if (shouldReduceMotion || !trigger) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 select-none">
      {/* 6 Sequential Spark Bursts / Firecrackers */}
      {[
        { id: 1, left: '16%', top: '20%', color: '#F59E0B', delay: 0.6 },
        { id: 2, right: '16%', top: '22%', color: '#8B5CF6', delay: 0.8 },
        { id: 3, left: '50%', top: '10%', color: '#FDE047', delay: 0.5 },
        { id: 4, left: '22%', top: '65%', color: '#10B981', delay: 1.0 },
        { id: 5, right: '22%', top: '62%', color: '#F43F5E', delay: 1.1 },
        { id: 6, left: '78%', top: '15%', color: '#38BDF8', delay: 1.3 },
      ].map((fw) => (
        <motion.div
          key={fw.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 2.2], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: fw.delay, repeat: Infinity, repeatDelay: 3 }}
          style={{ left: fw.left, right: fw.right, top: fw.top }}
          className="absolute size-14 flex items-center justify-center pointer-events-none"
        >
          <div className="size-full rounded-full border-2 border-dashed" style={{ borderColor: fw.color }} />
          <span className="absolute size-3 rounded-full shadow-lg" style={{ backgroundColor: fw.color }} />
        </motion.div>
      ))}

      {/* Bottom-Left Cannon Trajectory Blast */}
      <div className="absolute bottom-4 left-6">
        {confettiParticles
          .filter((p) => p.side === 'left')
          .map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                x: [0, p.xEnd * 0.5, p.xEnd],
                y: [0, p.yEnd, p.yEnd + 60],
                opacity: [0, 1, 1, 0],
                scale: [0, p.scale, p.scale * 0.7, 0],
                rotate: [0, p.rotate],
              }}
              transition={{ duration: p.duration, ease: [0.16, 1, 0.3, 1], delay: p.delay }}
              className="absolute"
            >
              {p.type === 'star' ? (
                <Star className="size-3.5 fill-current" style={{ color: p.color }} />
              ) : p.type === 'strip' ? (
                <div className="w-4 h-1.5 rounded-xs" style={{ backgroundColor: p.color, transform: 'rotate(25deg)' }} />
              ) : p.type === 'petal' ? (
                <svg width={14 * p.scale} height={14 * p.scale} viewBox="0 0 24 24" fill={p.color}>
                  <path d="M12 2C17 8 17 16 12 22C7 16 7 8 12 2Z" />
                </svg>
              ) : (
                <div className="size-2.5 rounded-xs" style={{ backgroundColor: p.color }} />
              )}
            </motion.div>
          ))}
      </div>

      {/* Bottom-Right Cannon Trajectory Blast */}
      <div className="absolute bottom-4 right-6">
        {confettiParticles
          .filter((p) => p.side === 'right')
          .map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                x: [0, p.xEnd * 0.5, p.xEnd],
                y: [0, p.yEnd, p.yEnd + 60],
                opacity: [0, 1, 1, 0],
                scale: [0, p.scale, p.scale * 0.7, 0],
                rotate: [0, p.rotate],
              }}
              transition={{ duration: p.duration, ease: [0.16, 1, 0.3, 1], delay: p.delay }}
              className="absolute"
            >
              {p.type === 'star' ? (
                <Star className="size-3.5 fill-current" style={{ color: p.color }} />
              ) : p.type === 'strip' ? (
                <div className="w-4 h-1.5 rounded-xs" style={{ backgroundColor: p.color, transform: 'rotate(-25deg)' }} />
              ) : p.type === 'petal' ? (
                <svg width={14 * p.scale} height={14 * p.scale} viewBox="0 0 24 24" fill={p.color}>
                  <path d="M12 2C17 8 17 16 12 22C7 16 7 8 12 2Z" />
                </svg>
              ) : (
                <div className="size-2.5 rounded-xs" style={{ backgroundColor: p.color }} />
              )}
            </motion.div>
          ))}
      </div>
    </div>
  )
}

// ==========================================
// 6. GOLDEN GRADUATION CELEBRATION EMBLEM (REFERENCE 2)
// ==========================================
function GoldenGraduationMedal() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto flex items-center justify-center size-24 sm:size-28 md:size-32 z-30 select-none flex-shrink-0">
      {/* Outer Soft Golden Halo Glow */}
      {!shouldReduceMotion && (
        <motion.div
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300/50 via-yellow-200/60 to-amber-400/50 blur-xl pointer-events-none"
        />
      )}

      {/* Decorative Fireworks Spark Streaks radiating from behind Medal */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <motion.div
              key={deg}
              animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              style={{ transform: `rotate(${deg}deg) translateY(-54px)` }}
              className="absolute w-1 h-3.5 bg-gradient-to-t from-amber-300 to-transparent rounded-full shadow-[0_0_8px_#FDE047]"
            />
          ))}
        </div>
      )}

      {/* Outer 3D Golden Medal Ring Frame */}
      <motion.div
        initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.75, opacity: 0 }}
        animate={{ scale: [0.75, 1.05, 1] }}
        transition={{ duration: 0.65, ease: 'backOut', delay: 0.25 }}
        className="relative flex items-center justify-center size-24 sm:size-28 md:size-32 rounded-full p-1.5 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 shadow-[0_0_40px_rgba(251,191,36,0.6)] border-2 border-amber-100"
      >
        {/* Inner Dark Navy Disc */}
        <div className="relative flex items-center justify-center size-full rounded-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-2 border-amber-300/80 shadow-inner">
          <GraduationCap className="size-12 sm:size-14 text-amber-300 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.7)]" />
        </div>

        {/* 3D Golden Star Badge at Bottom Center Rim */}
        <div className="absolute -bottom-2 flex items-center justify-center size-8 sm:size-9 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-950 shadow-lg border-2 border-white">
          <Star className="size-5 fill-amber-950 text-amber-950" />
        </div>
      </motion.div>
    </div>
  )
}

// ==========================================
// 7. GLOWING STACK OF BOOKS ILLUSTRATION
// ==========================================
function GlowingBookStack() {
  return (
    <div className="relative flex items-center justify-center size-20 sm:size-24 select-none flex-shrink-0">
      <div className="absolute inset-0 bg-purple-500/25 blur-lg rounded-full" />
      <div className="relative space-y-1 transform hover:scale-105 transition-transform duration-300">
        <div className="w-18 sm:w-20 h-3.5 rounded-md bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 shadow-md border-b-2 border-purple-900 transform -rotate-2" />
        <div className="w-16 sm:w-18 h-3.5 rounded-md bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-700 shadow-md border-b-2 border-indigo-950 transform rotate-1" />
        <div className="w-14 sm:w-16 h-3.5 rounded-md bg-gradient-to-r from-purple-500 via-indigo-500 to-accent shadow-lg border-b-2 border-indigo-900 transform -rotate-1 relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Star className="size-5 fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Animated Score Count-up
function AnimatedScore({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1200
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return <span>{displayValue}%</span>
}

function DoneWithLearningContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params.courseId as string
  const lessonId = searchParams.get('lessonId')

  const [course, setCourse] = useState<Course | null>(null)
  const [assessment, setAssessment] = useState<PublishedAssessment | null>(null)
  const [assessmentLoading, setAssessmentLoading] = useState<boolean>(true)
  const [, setIsLoading] = useState<boolean>(true)
  const [startCelebration, setStartCelebration] = useState<boolean>(false)

  useEffect(() => {
    setStartCelebration(true)
  }, [])

  useEffect(() => {
    const numericId = parseInt(courseId, 10)
    if (isNaN(numericId)) return

    const loadCourseData = async () => {
      try {
        setIsLoading(true)
        const res = await getCourseById(numericId)
        if (res) setCourse(res)
      } catch (err) {
        console.error('Failed to load course details for Done page:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [courseId])

  useEffect(() => {
    const loadAssessment = async () => {
      if (!lessonId) {
        setAssessmentLoading(false)
        return
      }
      try {
        setAssessmentLoading(true)
        const res = await getPublishedAssessmentForLesson(parseInt(lessonId, 10))
        setAssessment(res)
      } catch (err) {
        console.error('Failed to load published assessment:', err)
        setAssessment(null)
      } finally {
        setAssessmentLoading(false)
      }
    }
    loadAssessment()
  }, [lessonId])

  const handleStartAssessment = () => {
    if (assessment) {
      router.push(`/dashboard/assessments/${assessment.id}/take`)
    } else {
      router.push(`/dashboard/assessments?courseId=${courseId}`)
    }
  }

  const todayFormatted = useMemo(() => {
    const date = new Date()
    return `Today, ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
  }, [])

  return (
    <div className="relative h-dvh max-h-dvh w-full overflow-hidden text-foreground flex flex-col justify-center items-center p-3 sm:p-4 select-none">
      {/* 1. LAYER 1: ATMOSPHERIC LAVENDER & DEEP PURPLE BACKGROUND */}
      <AtmosphericLavenderBackground />

      {/* 2. LAYER 2: ROTATING RADIAL LIGHT RAYS */}
      <RadialLightRays />

      {/* 3. LAYER 3: CENTRAL WARM GOLDEN ATMOSPHERIC GLOW */}
      <CentralAtmosphericGlow />

      {/* 4. LAYER 4: RICH BOTANICAL & CELEBRATION CORNER CLUSTERS */}
      <RichBotanicalClusters />

      {/* 5. LAYER 5: ANIMATED CONFETTI TRAJECTORY BLAST & SPARK FIREWORKS */}
      <LayeredConfettiAndFireworks trigger={startCelebration} />

      {/* 6. LAYER 6: MAIN INTEGRATED COMPLETION CARD (Z-30, LOCKED TO VIEWPORT) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative z-30 w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col justify-between rounded-[28px] sm:rounded-[36px] border border-purple-200/60 bg-white/95 dark:bg-card/95 backdrop-blur-md p-4 sm:p-6 md:p-7 shadow-2xl shadow-indigo-900/30 text-center space-y-3 sm:space-y-4 my-auto overflow-hidden"
      >
        {/* Golden 3D Graduation Medal Header (Reference 2) */}
        <GoldenGraduationMedal />

        {/* Title & Subtitle Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="space-y-1.5 relative z-40"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl">🎉</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif tracking-tight">
              Lesson Complete!
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-medium">
            Amazing work! You've successfully completed all learning materials.
          </p>
        </motion.div>

        {/* Course Title Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="space-y-1 relative z-40"
        >
          <div className="inline-block rounded-full bg-purple-500/10 border border-purple-500/20 px-5 py-1.5 shadow-xs">
            <span className="text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-indigo-300">
              {course ? `Complete ${course.title}` : 'Complete Mathematics — Form 1–4'}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
            Your dedication is building a stronger you every day! 🚀
          </p>
        </motion.div>

        {/* Course Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative z-40 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.35 }}
            className="rounded-2xl border border-border bg-slate-50/70 dark:bg-muted/20 p-2.5 sm:p-3 flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Calendar className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                COURSE COMPLETED
              </span>
              <span className="text-xs font-bold text-foreground truncate block mt-0.5">
                {todayFormatted}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.35 }}
            className="rounded-2xl border border-border bg-slate-50/70 dark:bg-muted/20 p-2.5 sm:p-3 flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <BarChart2 className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                DIFFICULTY LEVEL
              </span>
              <span className="text-xs font-extrabold text-indigo-600 uppercase truncate block mt-0.5">
                {course?.level || 'BEGINNER'}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.76, duration: 0.35 }}
            className="rounded-2xl border border-border bg-slate-50/70 dark:bg-muted/20 p-2.5 sm:p-3 flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                LESSON SCORE
              </span>
              <span className="text-xs font-extrabold text-emerald-600 truncate block mt-0.5">
                <AnimatedScore value={95} />
              </span>
            </div>
          </motion.div>
        </div>

        {/* Assessment Ready Section Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
          className="rounded-2xl sm:rounded-3xl border-2 border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-slate-50/80 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 p-3.5 sm:p-4.5 space-y-2.5 text-left relative z-40 shadow-inner"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  🚀 ASSESSMENT READY
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-indigo-950 dark:text-indigo-200 uppercase tracking-tight">
                {course?.title || 'MATHEMATICS'}
              </h3>

              {assessmentLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Loading assessment metrics...</span>
                </div>
              ) : assessment ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <FileText className="size-3 text-indigo-500" />
                      <span>Questions</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">
                      {assessment.question_count}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Clock className="size-3 text-purple-500" />
                      <span>Duration</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">
                      {assessment.duration_minutes} min
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Target className="size-3 text-emerald-500" />
                      <span>Pass Score</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">
                      {assessment.passing_score}%
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <RotateCcw className="size-3 text-amber-500" />
                      <span>Attempts</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">
                      {`${assessment.attempts_used ?? (assessment.max_attempts - assessment.attempts_remaining)}/${assessment.max_attempts}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <FileText className="size-3 text-indigo-500" />
                      <span>Questions</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">34</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Clock className="size-3 text-purple-500" />
                      <span>Duration</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">20 min</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Target className="size-3 text-emerald-500" />
                      <span>Pass Score</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">35%</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-white/90 dark:bg-card/60 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <RotateCcw className="size-3 text-amber-500" />
                      <span>Attempts</span>
                    </div>
                    <p className="mt-0.5 text-xs font-extrabold text-foreground">0/3</p>
                  </div>
                </div>
              )}
            </div>

            <GlowingBookStack />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.35 }}
          className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-40"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white dark:bg-card px-6 py-2.5 sm:py-3 text-xs font-extrabold text-foreground shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <ArrowLeft className="size-4 text-muted-foreground" /> Return to Dashboard
          </button>

          <button
            onClick={handleStartAssessment}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 px-8 py-2.5 sm:py-3 text-xs font-extrabold text-white shadow-lg shadow-purple-500/30 hover:brightness-110 hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          >
            <Sparkles className="size-4 text-amber-300" /> Start Assessment <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function DoneWithLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh flex items-center justify-center bg-indigo-950 text-white">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <DoneWithLearningContent />
    </Suspense>
  )
}