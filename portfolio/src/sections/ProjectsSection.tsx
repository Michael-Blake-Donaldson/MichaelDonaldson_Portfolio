import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { LoaderCircle, X } from 'lucide-react'
import { projects } from '../data/siteData'
import type { ProjectItem } from '../types'

type ProjectsSectionProps = {
  initialProjectId?: string
  clearInitialProject: () => void
}

export default function ProjectsSection({
  initialProjectId,
  clearInitialProject,
}: ProjectsSectionProps) {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null)
  const [loading, setLoading] = useState(false)

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
            setLoading(true)
            window.setTimeout(() => {
              setActiveProject(project)
              setLoading(false)
            }, 300)
          }}
          className="w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left backdrop-blur-md transition hover:border-neon/40 hover:bg-neon/10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {project.tags.join(' / ')}
          </p>
          <h3 className="mt-1 font-display text-xl text-white">{project.name}</h3>
          <p className="mt-1 text-sm text-white/65">{project.headline}</p>
        </motion.button>
      )),
    [],
  )

  return (
    <section className="relative min-h-[84vh] overflow-hidden px-6 pb-24 pt-16 md:px-14">
      <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Project Vault</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
        Tap a project signature to unfold a full-screen product experience.
      </h2>

      <LayoutGroup>
        <div className="mt-8 grid gap-3 md:grid-cols-3">{projectPreview}</div>

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
                onClick={() => setActiveProject(null)}
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
              </div>
            </motion.article>
          ) : null}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  )
}
