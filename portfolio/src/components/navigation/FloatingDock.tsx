import { Command, Sparkles, Volume2, VolumeX, Wind, Accessibility } from 'lucide-react'
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
    <div className="fixed bottom-5 left-1/2 z-40 w-[min(760px,94vw)] -translate-x-1/2 rounded-2xl border border-white/20 bg-white/5 p-2 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <button
          aria-label="Open command palette"
          onClick={() => {
            onUiClick()
            onPalette()
          }}
          onMouseEnter={onUiHover}
          className="inline-flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-neon transition hover:bg-neon/20"
        >
          <Command className="h-4 w-4" />
          Command
        </button>
        <div className="flex flex-1 items-center justify-end gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onUiClick()
                onSelect(item.id)
              }}
              onMouseEnter={onUiHover}
              className={clsx(
                'rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition',
                active === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:bg-white/10 hover:text-white/85',
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
            onClick={() => {
              onToggleSound()
              onUiClick()
            }}
            onMouseEnter={onUiHover}
            className="ml-1 inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-2 text-[10px] uppercase tracking-[0.16em] text-white/65 hover:border-neon/60 hover:text-neon"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? 'Audio On' : 'Audio Off'}
          </button>
          <button
            aria-label={particlesEnabled ? 'Disable particle field' : 'Enable particle field'}
            onClick={() => {
              onToggleParticles()
              onUiClick()
            }}
            onMouseEnter={onUiHover}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-2 text-[10px] uppercase tracking-[0.16em] text-white/65 hover:border-neon/60 hover:text-neon"
          >
            <Wind className="h-4 w-4" />
            {particlesEnabled ? 'Particles On' : 'Particles Off'}
          </button>
          <button
            aria-label={reducedMotionEnabled ? 'Enable full motion' : 'Enable reduced motion'}
            onClick={() => {
              onToggleReducedMotion()
              onUiClick()
            }}
            onMouseEnter={onUiHover}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-2 text-[10px] uppercase tracking-[0.16em] text-white/65 hover:border-neon/60 hover:text-neon"
          >
            <Accessibility className="h-4 w-4" />
            {reducedMotionEnabled ? 'Reduced Motion' : 'Full Motion'}
          </button>
        </div>
        <Sparkles className="hidden h-4 w-4 text-plasma/80 md:block" />
      </div>
    </div>
  )
}
