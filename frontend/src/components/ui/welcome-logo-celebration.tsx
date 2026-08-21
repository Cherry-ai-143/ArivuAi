'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'

// Brand & Festive Palette: Orange, Indigo, Emerald, Rose, Gold, Violet, Teal
const CELEBRATION_COLORS = [
  '#F97316', // Primary Orange
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F43F5E', // Rose Pink
  '#F59E0B', // Gold/Amber
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EC4899', // Hot Pink
]

interface Particle {
  id: number
  xStart: number
  yStart: number
  xEnd: number
  yEnd: number
  rotateEnd: number
  scale: number
  color: string
  shape: 'rect' | 'circle' | 'star' | 'petal' | 'strip'
  delay: number
  duration: number
}

interface MicroFirework {
  id: number
  top: string
  left: string
  color: string
  delay: number
}

// SVG Shapes
function StarShape({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  )
}

function PetalShape({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C17 8 17 16 12 22C7 16 7 8 12 2Z" />
    </svg>
  )
}

function StripShape({ color }: { color: string }) {
  return (
    <div
      style={{
        width: '14px',
        height: '5px',
        backgroundColor: color,
        borderRadius: '2px',
        transform: 'rotate(-25deg)',
      }}
    />
  )
}

export function WelcomeLogoCelebration() {
  const shouldReduceMotion = useReducedMotion()

  // Generate dual-corner burst particles
  const particles = useMemo(() => {
    const list: Particle[] = []
    let id = 0

    // Left Cannon Burst (Bottom-Left -> Upward & Center)
    for (let i = 0; i < 22; i++) {
      const angle = -75 + Math.random() * 55 // -75 deg to -20 deg (up and right)
      const rad = (angle * Math.PI) / 180
      const distance = 260 + Math.random() * 220
      const xEnd = Math.cos(rad) * distance + (Math.random() * 60 - 30)
      const yEnd = Math.sin(rad) * distance - (Math.random() * 40)

      const shapes: Particle['shape'][] = ['rect', 'circle', 'star', 'petal', 'strip']
      list.push({
        id: id++,
        xStart: -240,
        yStart: 220,
        xEnd,
        yEnd,
        rotateEnd: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        shape: shapes[i % shapes.length],
        delay: 0.05 + Math.random() * 0.25,
        duration: 1.6 + Math.random() * 0.6,
      })
    }

    // Right Cannon Burst (Bottom-Right -> Upward & Center)
    for (let i = 0; i < 22; i++) {
      const angle = -105 - Math.random() * 55 // -105 deg to -160 deg (up and left)
      const rad = (angle * Math.PI) / 180
      const distance = 260 + Math.random() * 220
      const xEnd = Math.cos(rad) * distance + (Math.random() * 60 - 30)
      const yEnd = Math.sin(rad) * distance - (Math.random() * 40)

      const shapes: Particle['shape'][] = ['rect', 'circle', 'star', 'petal', 'strip']
      list.push({
        id: id++,
        xStart: 240,
        yStart: 220,
        xEnd,
        yEnd,
        rotateEnd: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: CELEBRATION_COLORS[(i + 3) % CELEBRATION_COLORS.length],
        shape: shapes[(i + 2) % shapes.length],
        delay: 0.08 + Math.random() * 0.25,
        duration: 1.6 + Math.random() * 0.6,
      })
    }

    return list
  }, [])

  // Decorative micro-fireworks around outer sides
  const microFireworks: MicroFirework[] = useMemo(
    () => [
      { id: 1, left: '-120px', top: '-40px', color: '#F97316', delay: 0.2 },
      { id: 2, left: '220px', top: '-30px', color: '#6366F1', delay: 0.35 },
      { id: 3, left: '-140px', top: '120px', color: '#10B981', delay: 0.45 },
      { id: 4, left: '240px', top: '110px', color: '#F43F5E', delay: 0.55 },
    ],
    []
  )

  // Floating Center Logo Sparkles
  const logoSparkles = useMemo(
    () => [
      { id: 1, angle: 45, dist: 58, color: '#F59E0B', delay: 0.2 },
      { id: 2, angle: 135, dist: 62, color: '#6366F1', delay: 0.3 },
      { id: 3, angle: 225, dist: 56, color: '#10B981', delay: 0.4 },
      { id: 4, angle: 315, dist: 60, color: '#F43F5E', delay: 0.25 },
    ],
    []
  )

  return (
    <div className="relative mx-auto flex items-center justify-center size-28 sm:size-32 select-none">
      {/* Decorative Canvas Layer for Bursts (Non-blocking) */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-visible">
          {/* 1. Micro Fireworks on Sides */}
          {microFireworks.map((fw) => (
            <motion.div
              key={fw.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.4, 1.8],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.1,
                ease: 'easeOut',
                delay: fw.delay,
              }}
              style={{ left: fw.left, top: fw.top }}
              className="absolute size-10 flex items-center justify-center"
            >
              <div
                className="size-full rounded-full border-2 border-dashed"
                style={{ borderColor: fw.color }}
              />
              <span
                className="absolute size-2 rounded-full shadow-lg"
                style={{ backgroundColor: fw.color }}
              />
            </motion.div>
          ))}

          {/* 2. Dual Corner Cannons Burst (Bottom-Left & Bottom-Right -> Upward) */}
          {particles.map((p) => {
            return (
              <motion.div
                key={p.id}
                initial={{
                  x: p.xStart,
                  y: p.yStart,
                  opacity: 0,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: [p.xStart, p.xStart + p.xEnd * 0.5, p.xEnd],
                  y: [p.yStart, p.yStart + p.yEnd * 0.8, p.yEnd + 40], // Arc trajectory
                  opacity: [0, 1, 1, 0],
                  scale: [0, p.scale, p.scale * 0.8, 0],
                  rotate: p.rotateEnd,
                }}
                transition={{
                  duration: p.duration,
                  ease: [0.22, 1, 0.36, 1], // Natural spring-like burst
                  delay: p.delay,
                }}
                className="absolute flex items-center justify-center"
              >
                {p.shape === 'star' && <StarShape color={p.color} size={14 * p.scale} />}
                {p.shape === 'petal' && <PetalShape color={p.color} size={16 * p.scale} />}
                {p.shape === 'strip' && <StripShape color={p.color} />}
                {p.shape === 'rect' && (
                  <div
                    style={{
                      width: `${10 * p.scale}px`,
                      height: `${10 * p.scale}px`,
                      backgroundColor: p.color,
                      borderRadius: '2px',
                    }}
                  />
                )}
                {p.shape === 'circle' && (
                  <div
                    style={{
                      width: `${9 * p.scale}px`,
                      height: `${9 * p.scale}px`,
                      backgroundColor: p.color,
                      borderRadius: '50%',
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Radial Glow & Pulse Ring Behind Logo */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.85, 1.3, 1.1],
            opacity: [0.8, 0.3, 0.15],
          }}
          transition={{
            duration: 2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/30 via-primary/20 to-purple-500/30 blur-lg pointer-events-none"
        />
      )}

      {/* Sparkles Floating Near Center Logo */}
      {!shouldReduceMotion &&
        logoSparkles.map((sp) => {
          const rad = (sp.angle * Math.PI) / 180
          const x = Math.cos(rad) * sp.dist
          const y = Math.sin(rad) * sp.dist
          return (
            <motion.div
              key={sp.id}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0.3],
                x: [0, x],
                y: [0, y],
              }}
              transition={{
                duration: 1.4,
                delay: sp.delay,
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
              className="absolute z-20 pointer-events-none"
            >
              <StarShape color={sp.color} size={12} />
            </motion.div>
          )
        })}

      {/* Main Center Logo Badge */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative z-10 flex size-20 sm:size-24 items-center justify-center rounded-full bg-white p-3.5 shadow-2xl ring-4 ring-accent/25 border border-border/80 overflow-hidden"
      >
        <Image
          src="/logos/arivu-logo.png"
          alt="Arivu AI Logo"
          width={80}
          height={80}
          className="object-contain size-full"
          priority
        />
      </motion.div>
    </div>
  )
}
