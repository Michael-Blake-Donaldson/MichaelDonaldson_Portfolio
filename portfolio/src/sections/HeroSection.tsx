import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useTypingEffect } from '../hooks/useTypingEffect'
import { MagneticButton } from '../components/ui/MagneticButton'

type HeroSectionProps = {
  onNavigateProjects: () => void
  onNavigateTimeline: () => void
  pointer: { x: number; y: number }
  soundFx: {
    playHover: () => void
    playClick: () => void
  }
}

export default function HeroSection({
  onNavigateProjects,
  onNavigateTimeline,
  pointer,
  soundFx,
}: HeroSectionProps) {
  const typed = useTypingEffect([
    'Computer Science student at SNHU focused on software engineering.',
    'Building practical full-stack projects with modern frontend tooling.',
    'Seeking internship and junior SWE opportunities to grow fast.',
  ])

  const glareStyle = useMemo(() => {
    const x = (pointer.x / Math.max(window.innerWidth, 1)) * 100
    const y = (pointer.y / Math.max(window.innerHeight, 1)) * 100
    return {
      background: `radial-gradient(420px circle at ${x}% ${y}%, rgba(88, 246, 210, 0.22), transparent 55%)`,
    }
  }, [pointer.x, pointer.y])

  return (
    <section className="relative flex min-h-[84vh] flex-col justify-center overflow-hidden px-6 pb-24 pt-16 md:px-14">
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={glareStyle}
        animate={{ opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.p
        className="mb-4 text-xs uppercase tracking-[0.34em] text-neon/85"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Neural Interface: Online
      </motion.p>

      <motion.h1
        className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-white md:text-7xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        Michael Donaldson
        <span className="block bg-gradient-to-r from-neon via-white to-plasma bg-clip-text text-transparent">
          SNHU Student and Aspiring Software Engineer
        </span>
      </motion.h1>

      <motion.p
        className="mt-6 min-h-14 max-w-2xl font-mono text-sm text-white/70 md:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {typed}
        <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-neon align-middle" />
      </motion.p>

      <motion.div
        className="mt-10 flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <MagneticButton
          onClick={onNavigateProjects}
          onHoverSound={soundFx.playHover}
          onClickSound={soundFx.playClick}
        >
          Explore Projects
        </MagneticButton>
        <MagneticButton
          tone="ghost"
          onClick={onNavigateTimeline}
          onHoverSound={soundFx.playHover}
          onClickSound={soundFx.playClick}
        >
          View Resume Snapshot
        </MagneticButton>
      </motion.div>

      <motion.div
        className="mt-14 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Status</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
          <span className="rounded-full border border-neon/25 bg-neon/10 px-3 py-1">SNHU Computer Science Student</span>
          <span className="rounded-full border border-arc/30 bg-arc/10 px-3 py-1">Open to internships and junior roles</span>
          <span className="rounded-full border border-plasma/30 bg-plasma/10 px-3 py-1">Focused on frontend and full-stack growth</span>
        </div>
      </motion.div>
    </section>
  )
}
