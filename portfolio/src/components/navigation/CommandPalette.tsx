import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TerminalSquare, Volume2, Wind, Accessibility } from 'lucide-react'
import type { NavItem, ProjectItem, SectionId } from '../../types'

type CommandPaletteProps = {
  open: boolean
  navItems: NavItem[]
  projects: ProjectItem[]
  onOpenChange: (open: boolean) => void
  onNavigate: (section: SectionId) => void
  onProjectOpen: (id: string) => void
  soundEnabled: boolean
  particlesEnabled: boolean
  reducedMotionEnabled: boolean
  onToggleSound: () => void
  onToggleParticles: () => void
  onToggleReducedMotion: () => void
}

export function CommandPalette({
  open,
  navItems,
  projects,
  onOpenChange,
  onNavigate,
  onProjectOpen,
  soundEnabled,
  particlesEnabled,
  reducedMotionEnabled,
  onToggleSound,
  onToggleParticles,
  onToggleReducedMotion,
}: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="mx-auto mt-20 w-[min(680px,92vw)] overflow-hidden rounded-2xl border border-white/15 bg-[#070b18]/95 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Command className="w-full">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-4 w-4 text-neon/70" />
                <Command.Input
                  autoFocus
                  aria-label="Search commands"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  placeholder="Jump to section, open project, run action..."
                />
              </div>
              <Command.List className="max-h-[56vh] overflow-y-auto p-3">
                <Command.Empty className="px-2 py-6 text-sm text-white/45">
                  No command found.
                </Command.Empty>
                <Command.Group heading="Navigation" className="text-white/50">
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      onSelect={() => {
                        onNavigate(item.id)
                        onOpenChange(false)
                      }}
                      className="mt-1 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-white/75 outline-none data-[selected=true]:bg-white/10 data-[selected=true]:text-neon"
                    >
                      <span>{item.label}</span>
                      <kbd className="rounded border border-white/15 px-2 py-0.5 text-[10px] uppercase text-white/60">
                        {item.shortcut}
                      </kbd>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading="Projects" className="mt-4 text-white/50">
                  {projects.map((project) => (
                    <Command.Item
                      key={project.id}
                      onSelect={() => {
                        onNavigate('projects')
                        onProjectOpen(project.id)
                        onOpenChange(false)
                      }}
                      className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 outline-none data-[selected=true]:bg-white/10 data-[selected=true]:text-neon"
                    >
                      <TerminalSquare className="h-4 w-4 text-arc/80" />
                      <span>{project.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading="Actions" className="mt-4 text-white/50">
                  <Command.Item
                    onSelect={() => {
                      onToggleSound()
                      onOpenChange(false)
                    }}
                    className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 outline-none data-[selected=true]:bg-white/10 data-[selected=true]:text-neon"
                  >
                    <Volume2 className="h-4 w-4 text-neon/80" />
                    <span>{soundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      onToggleParticles()
                      onOpenChange(false)
                    }}
                    className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 outline-none data-[selected=true]:bg-white/10 data-[selected=true]:text-neon"
                  >
                    <Wind className="h-4 w-4 text-arc/80" />
                    <span>{particlesEnabled ? 'Disable Particle Field' : 'Enable Particle Field'}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      onToggleReducedMotion()
                      onOpenChange(false)
                    }}
                    className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 outline-none data-[selected=true]:bg-white/10 data-[selected=true]:text-neon"
                  >
                    <Accessibility className="h-4 w-4 text-plasma/80" />
                    <span>{reducedMotionEnabled ? 'Switch to Full Motion' : 'Enable Reduced Motion'}</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
