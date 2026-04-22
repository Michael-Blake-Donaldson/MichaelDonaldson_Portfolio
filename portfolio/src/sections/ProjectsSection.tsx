import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function ArchitectureFlowDiagram({ project }: { project: ProjectItem }) {
  const flow = project.systemFlow
  const width = 640
  const height = 170
  const step = flow.length > 1 ? (width - 120) / (flow.length - 1) : 1

  const points = flow.map((_, index) => {
    const x = 60 + index * step
    const y = index % 2 === 0 ? 65 : 105
    return { x, y }
  })

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Architecture Flow Diagram</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#07101f]/70 p-3">
        <motion.svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[170px] w-full"
          initial={{ opacity: 0.4 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          <motion.path
            d={pathD}
            fill="none"
            stroke="rgba(88,246,210,0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
          {points.map((point, index) => (
            <motion.g
              key={`${project.id}-node-${index}`}
              initial={{ scale: 0.65, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{ delay: 0.12 + index * 0.08, duration: 0.35 }}
            >
              <circle cx={point.x} cy={point.y} r={13} fill="rgba(106,166,255,0.2)" stroke="rgba(106,166,255,0.75)" strokeWidth="2" />
              <text
                x={point.x}
                y={point.y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.95)"
                fontFamily="JetBrains Mono, monospace"
              >
                {index + 1}
              </text>
            </motion.g>
          ))}
        </motion.svg>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {flow.map((stepLabel, index) => (
          <div
            key={`${project.id}-legend-${stepLabel}`}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
          >
            <span className="mr-2 font-mono text-neon/80">{index + 1}.</span>
            {stepLabel}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ProjectsSection({
  initialProjectId,
  clearInitialProject,
  soundFx,
}: ProjectsSectionProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const chapterRefs = useRef<Record<string, HTMLElement | null>>({})
  const progressRailRef = useRef<HTMLDivElement | null>(null)
  const [progressById, setProgressById] = useState<Record<string, number>>({})
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id ?? '')

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.project-parallax').forEach((node) => {
        gsap.fromTo(
          node,
          { yPercent: -8 },
          {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.project-chapter').forEach((node) => {
        gsap.fromTo(
          node.querySelectorAll('.project-detail'),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 72%',
              end: 'top 45%',
              scrub: 0.5,
            },
          },
        )
      })

      if (progressRailRef.current) {
        ScrollTrigger.create({
          trigger: root,
          start: 'top top+=96',
          end: () => `+=${Math.max(root.scrollHeight - window.innerHeight - 120, 300)}`,
          pin: progressRailRef.current,
          pinSpacing: true,
          pinReparent: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        })
      }
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!initialProjectId) return
    const node = chapterRefs.current[initialProjectId]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    clearInitialProject()
  }, [initialProjectId, clearInitialProject])

  useEffect(() => {
    let rafId = 0

    const updateProgress = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        const nextProgress: Record<string, number> = {}
        let nearestId = projects[0]?.id ?? ''
        let nearestDistance = Number.POSITIVE_INFINITY

        for (const project of projects) {
          const node = chapterRefs.current[project.id]
          if (!node) continue

          const rect = node.getBoundingClientRect()
          const rawProgress = (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
          nextProgress[project.id] = clamp(rawProgress, 0, 1)

          const chapterCenter = rect.top + rect.height / 2
          const distanceToFocusLine = Math.abs(chapterCenter - window.innerHeight * 0.45)
          if (rect.bottom > 0 && rect.top < window.innerHeight && distanceToFocusLine < nearestDistance) {
            nearestDistance = distanceToFocusLine
            nearestId = project.id
          }
        }

        setProgressById(nextProgress)
        setActiveProjectId(nearestId)
        rafId = 0
      })
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section ref={rootRef} className="relative min-h-[84vh] overflow-visible px-6 pb-24 pt-16 md:px-14">
      <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Project Vault</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
        Scroll the engineering narrative: three flagship systems, each unpacked as a full product architecture.
      </h2>

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_232px] lg:items-start lg:gap-8">
        <div className="space-y-24">
          {projects.map((project, index) => (
          <motion.article
            key={project.id}
            ref={(node) => {
              chapterRefs.current[project.id] = node
            }}
            onMouseEnter={soundFx.playHover}
            className="project-chapter relative min-h-[110vh] rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 md:p-8"
            initial={{ opacity: 0.8 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              <div className="project-parallax lg:sticky lg:top-24 lg:h-[80vh]">
                <div className="relative h-[60vh] overflow-hidden rounded-[1.5rem] border border-white/15 bg-black/35 lg:h-full">
                  <img
                    src={project.image}
                    alt={`${project.name} screenshot`}
                    className="h-full w-full object-cover opacity-90"
                    loading="lazy"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/45 p-3 backdrop-blur-sm">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon/75">
                      Project {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-white">{project.name}</h3>
                    <p className="mt-1 text-sm text-white/75">{project.headline}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 pb-8">
                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Overview</p>
                  <p className="mt-3 text-white/85">{project.overview}</p>
                  <p className="mt-3 text-sm text-white/70">{project.summary}</p>
                </section>

                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Core Features</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {project.coreFeatures.map((feature) => (
                      <li key={feature} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">System Flow</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/80">
                    {project.systemFlow.map((step, idx) => (
                      <div key={step} className="contents">
                        <span className="rounded-full border border-arc/40 bg-arc/10 px-3 py-1">{step}</span>
                        {idx < project.systemFlow.length - 1 ? <span className="text-plasma/70">→</span> : null}
                      </div>
                    ))}
                  </div>
                </section>

                <ArchitectureFlowDiagram project={project} />

                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Tech Stack</p>
                  <div className="mt-3 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Backend</p>
                      <p>{project.techStack.backend.join(' • ')}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Frontend</p>
                      <p>{project.techStack.frontend.join(' • ')}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Database</p>
                      <p>{project.techStack.database.join(' • ')}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Other</p>
                      <p>{project.techStack.other.join(' • ')}</p>
                    </div>
                  </div>
                </section>

                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Architecture and Engineering Highlights</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {project.architectureHighlights.map((item) => (
                      <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Challenges Solved</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {project.challengesSolved.map((item) => (
                      <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="project-detail rounded-2xl border border-white/15 bg-black/25 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neon/75">Why It Is Impressive</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {project.whyImpressive.map((item) => (
                      <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="project-detail rounded-xl border border-neon/25 bg-neon/10 p-3 text-xs uppercase tracking-[0.18em] text-neon">
                  {project.demoHint}
                </section>
              </div>
            </div>
          </motion.article>
          ))}
        </div>

        <aside className="mt-8 hidden lg:block lg:self-start">
          <div
            ref={progressRailRef}
            className="pointer-events-none w-full overflow-hidden rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-xl"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neon/75">Scroll Progress</p>
            <div className="mt-3 space-y-3">
              {projects.map((project, index) => {
                const progress = progressById[project.id] ?? 0
                const isActive = project.id === activeProjectId
                const displayProgress = Math.max(
                  progress,
                  isActive ? 0.05 : 0.02,
                )
                return (
                  <div key={`hud-${project.id}`} className="pb-0.5">
                    <div
                      className={`truncate text-[11px] uppercase tracking-[0.12em] ${isActive ? 'text-white' : 'text-white/50'}`}
                      title={`${String(index + 1).padStart(2, '0')} ${project.name}`}
                    >
                      {String(index + 1).padStart(2, '0')} {project.name}
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-white/10 bg-white/20">
                      <motion.div
                        className={`h-full ${isActive ? 'bg-gradient-to-r from-neon to-arc' : 'bg-white/35'}`}
                        animate={{ width: `${Math.round(displayProgress * 100)}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
