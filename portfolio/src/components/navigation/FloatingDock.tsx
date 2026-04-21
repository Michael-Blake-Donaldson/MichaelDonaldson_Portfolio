import { Command, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import type { NavItem, SectionId } from '../../types'

type FloatingDockProps = {
  items: NavItem[]
  active: SectionId
  onSelect: (id: SectionId) => void
  onPalette: () => void
}

export function FloatingDock({ items, active, onSelect, onPalette }: FloatingDockProps) {
  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[min(760px,94vw)] -translate-x-1/2 rounded-2xl border border-white/20 bg-white/5 p-2 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onPalette}
          className="inline-flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-neon transition hover:bg-neon/20"
        >
          <Command className="h-4 w-4" />
          Command
        </button>
        <div className="flex flex-1 items-center justify-end gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
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
        </div>
        <Sparkles className="hidden h-4 w-4 text-plasma/80 md:block" />
      </div>
    </div>
  )
}
