import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BootSequence } from './components/effects/BootSequence'
import { CustomCursor } from './components/effects/CustomCursor'
import { ParticleField } from './components/effects/ParticleField'
import { CommandPalette } from './components/navigation/CommandPalette'
import { FloatingDock } from './components/navigation/FloatingDock'
import { navItems, projects } from './data/siteData'
import { useEasterEgg } from './hooks/useEasterEgg'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useSoundFx } from './hooks/useSoundFx'
import type { SectionId } from './types'

const HeroSection = lazy(() => import('./sections/HeroSection'))
const ProjectsSection = lazy(() => import('./sections/ProjectsSection'))
const CommandCenterSection = lazy(() => import('./sections/CommandCenterSection'))
const TimelineSection = lazy(() => import('./sections/TimelineSection'))
const SkillsSection = lazy(() => import('./sections/SkillsSection'))

const sectionOrder: SectionId[] = [
  'hero',
  'projects',
  'command-center',
  'timeline',
  'skills',
]

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [bootDone, setBootDone] = useState(false)
  const [pendingProjectId, setPendingProjectId] = useState<string | undefined>()
  const [pointer, setPointer] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
  const { unlocked, reset } = useEasterEgg()
  const soundFx = useSoundFx(false)

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setBootDone(true), 2800)
    return () => window.clearTimeout(bootTimer)
  }, [])

  useEffect(() => {
    let rafId = 0
    const onMove = (event: MouseEvent) => {
      window.cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(() => {
        setPointer({ x: event.clientX, y: event.clientY })
      })
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  const shortcuts = useMemo(
    () => ({
      'ctrl+k': () => setPaletteOpen((prev) => !prev),
      'meta+k': () => setPaletteOpen((prev) => !prev),
      'escape': () => setPaletteOpen(false),
      '1': () => setActiveSection('hero'),
      '2': () => setActiveSection('projects'),
      '3': () => setActiveSection('command-center'),
      '4': () => setActiveSection('timeline'),
      '5': () => setActiveSection('skills'),
      m: () => soundFx.toggle(),
      arrowright: () => {
        setActiveSection((prev) => {
          const current = sectionOrder.indexOf(prev)
          return sectionOrder[(current + 1) % sectionOrder.length]
        })
      },
      arrowleft: () => {
        setActiveSection((prev) => {
          const current = sectionOrder.indexOf(prev)
          return sectionOrder[(current - 1 + sectionOrder.length) % sectionOrder.length]
        })
      },
    }),
    [soundFx],
  )

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-abyss text-white">
      <ParticleField />
      <CustomCursor />

      <div className="pointer-events-none fixed inset-0 z-0 bg-noise opacity-90" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,90,191,0.15),transparent_60%)]" />

      <main className="relative z-10 mx-auto w-full max-w-[1280px] px-2 pb-28 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense
              fallback={
                <div className="flex min-h-[70vh] items-center justify-center font-mono text-xs uppercase tracking-[0.22em] text-white/50">
                  loading viewport...
                </div>
              }
            >
              {activeSection === 'hero' ? (
                <HeroSection
                  onNavigateProjects={() => setActiveSection('projects')}
                  pointer={pointer}
                  soundFx={soundFx}
                />
              ) : null}
              {activeSection === 'projects' ? (
                <ProjectsSection
                  initialProjectId={pendingProjectId}
                  clearInitialProject={() => setPendingProjectId(undefined)}
                  soundFx={soundFx}
                />
              ) : null}
              {activeSection === 'command-center' ? <CommandCenterSection /> : null}
              {activeSection === 'timeline' ? <TimelineSection /> : null}
              {activeSection === 'skills' ? <SkillsSection /> : null}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <FloatingDock
        items={navItems}
        active={activeSection}
        onSelect={setActiveSection}
        onPalette={() => setPaletteOpen(true)}
        soundEnabled={soundFx.enabled}
        onToggleSound={soundFx.toggle}
        onUiHover={soundFx.playHover}
        onUiClick={soundFx.playClick}
      />

      <CommandPalette
        open={paletteOpen}
        navItems={navItems}
        projects={projects}
        onOpenChange={setPaletteOpen}
        onNavigate={setActiveSection}
        onProjectOpen={(id) => {
          soundFx.playClick()
          setPendingProjectId(id)
          setActiveSection('projects')
        }}
      />

      <AnimatePresence>
        {unlocked ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[min(560px,94vw)] rounded-3xl border border-neon/35 bg-[#091223] p-8 text-center"
              initial={{ scale: 0.8, y: 28 }}
              animate={{ scale: 1, y: 0 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-neon/75">
                Hidden Protocol Unlocked
              </p>
              <h3 className="mt-3 font-display text-3xl text-white">Nova Mode</h3>
              <p className="mt-4 text-sm text-white/70">
                You found the Konami sequence. Press Ctrl+K and run through the
                vault for a faster navigation loop.
              </p>
              <button
                onClick={reset}
                className="mt-6 rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:border-neon/60 hover:text-neon"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>{!bootDone ? <BootSequence ready={false} /> : null}</AnimatePresence>
    </div>
  )
}

export default App
