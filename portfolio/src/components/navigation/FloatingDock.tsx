import { Command, Volume2, VolumeX, Wind, Accessibility } from 'lucide-react'
import clsx from 'clsx'
import type { NavItem, SectionId } from '../../types'

type FloatingDockProps = {
  items: NavItem[]
  active: SectionId
  onSelect: (id: SectionId) => void
  onPalette: () => void
  soundEnabled: boolean
  particlesEnabled: boolean
  reducedMotionEnabled: boolean
  onToggleSound: () => void
  onToggleParticles: () => void
  onToggleReducedMotion: () => void
  onUiHover: () => void
  onUiClick: () => void
}

export function FloatingDock({
  items,
  active,
  onSelect,
  onPalette,
  soundEnabled,
  particlesEnabled,
  reducedMotionEnabled,
  onToggleSound,
  onToggleParticles,
  onToggleReducedMotion,
  onUiHover,
  onUiClick,
}: FloatingDockProps) {
  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(1120px,calc(100vw-1rem))] -translate-x-1/2 px-1 sm:px-2">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/20 bg-[linear-gradient(120deg,rgba(8,18,36,0.92),rgba(25,10,40,0.9))] p-2 shadow-[0_18px_50px_rgba(3,8,22,0.65)] backdrop-blur-2xl sm:p-3">
        <div className="pointer-events-none absolute -left-14 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-neon/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-12 top-2 h-28 w-28 rounded-full bg-plasma/20 blur-2xl" />

        <div className="relative flex items-center gap-2">
          <button
            aria-label="Open command palette"
            onClick={() => {
              onUiClick()
              onPalette()
            }}
            onMouseEnter={onUiHover}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-neon/40 bg-neon/12 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-neon transition hover:bg-neon/22"
          >
            <Command className="h-4 w-4" />
            Command
          </button>

          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onUiClick()
                  onSelect(item.id)
                }}
                onMouseEnter={onUiHover}
                className={clsx(
                  'whitespace-nowrap rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition',
                  active === item.id
                    ? 'border border-white/20 bg-white/14 text-white'
                    : 'border border-transparent text-white/60 hover:border-white/15 hover:bg-white/10 hover:text-white/90',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2">
          <button
            aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
            onClick={() => {
              onToggleSound()
              onUiClick()
            }}
            onMouseEnter={onUiHover}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/70 transition hover:border-neon/60 hover:text-neon"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {soundEnabled ? 'Audio On' : 'Audio Off'}
          </button>

          <button
            aria-label={particlesEnabled ? 'Disable particle field' : 'Enable particle field'}
            onClick={() => {
              onToggleParticles()
              onUiClick()
            }}
            onMouseEnter={onUiHover}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/70 transition hover:border-neon/60 hover:text-neon"
          >
            <Wind className="h-3.5 w-3.5" />
            {particlesEnabled ? 'Particles On' : 'Particles Off'}
          </button>

          <button
            aria-label={reducedMotionEnabled ? 'Enable full motion' : 'Enable reduced motion'}
            onClick={() => {
              onToggleReducedMotion()
              onUiClick()
            }}
            onMouseEnter={onUiHover}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/70 transition hover:border-neon/60 hover:text-neon"
          >
            <Accessibility className="h-3.5 w-3.5" />
            {reducedMotionEnabled ? 'Reduced Motion' : 'Full Motion'}
          </button>

          <span className="ml-auto hidden text-[9px] uppercase tracking-[0.22em] text-white/45 md:inline">
            command rail
          </span>
        </div>
      </div>
    </div>
  )
}
