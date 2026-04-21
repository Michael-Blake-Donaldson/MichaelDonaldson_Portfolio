import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { LoaderCircle, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/siteData'
import type { ProjectItem } from '../types'

gsap.registerPlugin(ScrollTrigger)

type ProjectsSectionProps = {
  initialProjectId?: string
  clearInitialProject: () => void
  soundFx: {
    playHover: () => void
    playClick: () => void
  }
}

export default function ProjectsSection({
  initialProjectId,
  clearInitialProject,
  soundFx,
}: ProjectsSectionProps) {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [hoverProjectId, setHoverProjectId] = useState(projects[0].id)
  const [incidentMode, setIncidentMode] = useState(false)
  const rootRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.to('.project-atlas', {
        yPercent: -16,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!initialProjectId) return
    const found = projects.find((item) => item.id === initialProjectId)
    if (!found) return

    setLoading(true)
    const timer = window.setTimeout(() => {
      setActiveProject(found)
      setLoading(false)
      clearInitialProject()
    }, 420)

    return () => window.clearTimeout(timer)
  }, [initialProjectId, clearInitialProject])

  const projectPreview = useMemo(
    () =>
      projects.map((project) => (
        <motion.button
          key={project.id}
          layoutId={`project-${project.id}`}
          onClick={() => {
              soundFx.playClick()
            setLoading(true)
            window.setTimeout(() => {
              setActiveProject(project)
              setLoading(false)
            }, 300)
          }}
            onMouseEnter={() => {
              soundFx.playHover()
              setHoverProjectId(project.id)
            }}
          className="group relative w-full overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(120deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-3 text-left backdrop-blur-md transition hover:border-neon/40 hover:bg-neon/10"
        >
          <span className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neon via-arc to-plasma opacity-55" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {project.tags.join(' / ')}
          </p>
          <h3 className="mt-1 font-display text-xl text-white">{project.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neon/70">System Overview</p>
          <p className="mt-1 text-sm text-white/80">{project.overview}</p>
          <p className="mt-1 text-sm text-white/65">{project.headline}</p>
        </motion.button>
      )),
    [soundFx],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'd') return
      setIncidentMode((prev) => !prev)
      soundFx.playClick()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [soundFx])

  const previewProject = projects.find((item) => item.id === hoverProjectId) ?? projects[0]

  return (
    <section ref={rootRef} className="relative min-h-[84vh] overflow-hidden px-6 pb-24 pt-16 md:px-14">
      <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Project Vault</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
        Four production-style case studies with system architecture, tradeoffs, and engineering depth.
      </h2>

      <div className="project-atlas pointer-events-none absolute right-8 top-24 hidden w-[360px] rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl lg:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon/75">Live Preview</p>
        <h3 className="mt-2 font-display text-2xl text-white">{previewProject.name}</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neon/60">Overview</p>
        <p className="mt-1 text-sm text-white/80">{previewProject.overview}</p>
        <p className="mt-2 text-sm text-white/65">{previewProject.summary}</p>
        <div className="mt-5 rounded-2xl border border-white/15 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-white/45">
            <span>interactive demo</span>
            <span>{incidentMode ? 'incident mode' : 'stable mode'}</span>
          </div>
          <motion.div
            className="h-24 rounded-xl bg-gradient-to-r from-neon/20 via-arc/15 to-plasma/20"
            animate={{ backgroundPositionX: incidentMode ? ['0%', '120%'] : ['0%', '60%'] }}
            transition={{ duration: incidentMode ? 0.7 : 2.2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </div>

      <LayoutGroup>
        <div className="mt-8 grid gap-3 pr-0 md:grid-cols-3 lg:pr-[390px]">{projectPreview}</div>

        <AnimatePresence>
          {loading ? (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoaderCircle className="h-9 w-9 animate-spin text-neon" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {activeProject ? (
            <motion.article
              layoutId={`project-${activeProject.id}`}
              className="fixed inset-0 z-50 overflow-y-auto bg-[#060912]/95 p-6 backdrop-blur-xl md:p-12"
              initial={{ borderRadius: 24 }}
              animate={{ borderRadius: 0 }}
              exit={{ opacity: 0.2, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            >
              <button
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-neon/60 hover:text-neon"
                onClick={() => {
                  soundFx.playClick()
                  setActiveProject(null)
                }}
                onMouseEnter={soundFx.playHover}
              >
                <X className="h-4 w-4" />
                close
              </button>

              <div
                className={`rounded-[2rem] border border-white/10 bg-gradient-to-br ${activeProject.accent} p-8`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/70">
                  {activeProject.tags.join(' • ')}
                </p>
                <h3 className="mt-3 max-w-4xl font-display text-3xl text-white md:text-6xl">
                  {activeProject.headline}
                </h3>
                <p className="mt-4 max-w-4xl text-base text-white/90">{activeProject.overview}</p>
                <p className="mt-5 max-w-3xl text-white/75">{activeProject.summary}</p>

                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  {activeProject.metrics.map((metric) => (
                    <div
                      key={metric}
                      className="rounded-xl border border-white/15 bg-black/25 p-3 font-mono text-sm text-neon"
                    >
                      {metric}
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  {activeProject.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-white/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-plasma/85">
                  {activeProject.demoHint}
                </p>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Core Features</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {activeProject.coreFeatures.map((feature) => (
                        <li key={feature} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-neon/75">System Flow</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/80">
                      {activeProject.systemFlow.map((step, idx) => (
                        <div key={step} className="contents">
                          <span className="rounded-full border border-arc/40 bg-arc/10 px-3 py-1">{step}</span>
                          {idx < activeProject.systemFlow.length - 1 ? (
                            <span className="text-plasma/70">→</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Tech Stack</p>
                    <div className="mt-3 space-y-3 text-sm text-white/80">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Backend</p>
                        <p>{activeProject.techStack.backend.join(' • ')}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Frontend</p>
                        <p>{activeProject.techStack.frontend.join(' • ')}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Database</p>
                        <p>{activeProject.techStack.database.join(' • ')}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Other</p>
                        <p>{activeProject.techStack.other.join(' • ')}</p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Architecture and Engineering Highlights</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {activeProject.architectureHighlights.map((item) => (
                        <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Challenges Solved</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {activeProject.challengesSolved.map((item) => (
                        <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-white/15 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Why It Is Impressive</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {activeProject.whyImpressive.map((item) => (
                        <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="mt-6 rounded-xl border border-neon/25 bg-neon/10 p-3 text-xs uppercase tracking-[0.18em] text-neon">
                  Press D to toggle incident simulation overlay.
                </div>
              </div>

              <AnimatePresence>
                {incidentMode ? (
                  <motion.div
                    className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,90,191,0.1),transparent_60%)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : null}
              </AnimatePresence>
            </motion.article>
          ) : null}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  )
}
