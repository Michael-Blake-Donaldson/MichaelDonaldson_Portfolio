import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { powerGridConnections, powerGridProjects, powerGridSkills } from '../data/siteData'
import type { PowerGridSkill } from '../types'

gsap.registerPlugin(ScrollTrigger)

const categoryLabel: Record<PowerGridSkill['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  system: 'Systems',
  platform: 'Platform',
  data: 'Data',
  quality: 'Quality',
}

const categoryTone: Record<PowerGridSkill['category'], string> = {
  frontend: 'from-cyan-300/35 to-cyan-500/10 text-cyan-200 border-cyan-300/40',
  backend: 'from-emerald-300/35 to-emerald-500/10 text-emerald-200 border-emerald-300/40',
  system: 'from-yellow-300/35 to-yellow-500/10 text-yellow-200 border-yellow-300/40',
  platform: 'from-violet-300/35 to-violet-500/10 text-violet-200 border-violet-300/40',
  data: 'from-blue-300/35 to-blue-500/10 text-blue-200 border-blue-300/40',
  quality: 'from-amber-300/35 to-amber-500/10 text-amber-200 border-amber-300/40',
}

export default function SkillsSection() {
  const rootRef = useRef<HTMLElement | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<PowerGridSkill['category'] | 'all'>('all')
  const [showOnlyProjectLinked, setShowOnlyProjectLinked] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState(powerGridSkills[0]?.id ?? '')

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.skills-intel-shell',
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 70%',
            end: 'top 35%',
            scrub: 0.3,
          },
        },
      )

      gsap.to('.skills-intel-ambient', {
        yPercent: 10,
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

  const skillMap = useMemo(
    () => Object.fromEntries(powerGridSkills.map((skill) => [skill.id, skill])) as Record<string, PowerGridSkill>,
    [],
  )

  const linkedSet = useMemo(() => {
    if (!activeProjectId) return new Set<string>()
    const project = powerGridProjects.find((item) => item.id === activeProjectId)
    if (!project) return new Set<string>()
    return new Set(project.connectedSkills)
  }, [activeProjectId])

  const filteredSkills = useMemo(() => {
    return powerGridSkills.filter((skill) => {
      const categoryOk = activeCategory === 'all' || skill.category === activeCategory
      const projectOk = !showOnlyProjectLinked || !activeProjectId || linkedSet.has(skill.id)
      return categoryOk && projectOk
    })
  }, [activeCategory, showOnlyProjectLinked, activeProjectId, linkedSet])

  useEffect(() => {
    if (filteredSkills.length === 0) return
    if (filteredSkills.some((skill) => skill.id === selectedSkillId)) return
    setSelectedSkillId(filteredSkills[0].id)
  }, [filteredSkills, selectedSkillId])

  const selectedSkill = skillMap[selectedSkillId] ?? filteredSkills[0] ?? powerGridSkills[0]

  const relationSet = useMemo(() => {
    if (!selectedSkill) return new Set<string>()
    return new Set([selectedSkill.id, ...selectedSkill.connections])
  }, [selectedSkill])

  const avgMastery = useMemo(() => {
    if (filteredSkills.length === 0) return 0
    return Math.round(filteredSkills.reduce((sum, skill) => sum + skill.strength, 0) / filteredSkills.length)
  }, [filteredSkills])

  const avgArchitecture = useMemo(() => {
    if (filteredSkills.length === 0) return 0
    return Math.round(filteredSkills.reduce((sum, skill) => sum + skill.impact.architecture, 0) / filteredSkills.length)
  }, [filteredSkills])

  const strongLinkCount = useMemo(() => {
    return powerGridConnections.filter((edge) => edge.type === 'strong').length
  }, [])

  const visibleLinks = useMemo(() => {
    const visibleIds = new Set(filteredSkills.map((skill) => skill.id))
    return powerGridConnections.filter((edge) => visibleIds.has(edge.sourceSkillId) && visibleIds.has(edge.targetSkillId))
  }, [filteredSkills])

  const projectSignal = useMemo(() => {
    if (!activeProjectId) return null
    return powerGridProjects.find((project) => project.id === activeProjectId) ?? null
  }, [activeProjectId])

  return (
    <section ref={rootRef} className="relative min-h-[90vh] overflow-hidden px-4 pb-24 pt-16 md:px-10 lg:px-14">
      <div className="skills-intel-ambient pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_82%_24%,rgba(175,85,255,0.18),transparent_40%),radial-gradient(circle_at_52%_80%,rgba(86,255,184,0.14),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.11)_0.55px,transparent_0.8px)] [background-size:18px_18px] opacity-35" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-[0.28em] text-neon/85">Skill Intelligence</p>
        <h2 className="mt-3 max-w-5xl font-display text-3xl text-white md:text-5xl">
          Capability Router: practical proof of how my skills combine to build production-grade systems.
        </h2>
        <p className="mt-4 max-w-4xl text-sm text-white/70 md:text-base">
          This is an interactive capability map, not a resume list. Filter by domain, energize project evidence, and inspect
          how architecture, performance, and delivery strengths connect across the stack.
        </p>
      </motion.div>

      <div className="skills-intel-shell mt-8 rounded-[2rem] border border-white/15 bg-black/35 p-3 backdrop-blur-2xl md:p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/45 p-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Domain Filter</span>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${activeCategory === 'all' ? 'border-neon/55 bg-neon/15 text-neon' : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'}`}
          >
            All
          </button>
          {(Object.keys(categoryLabel) as Array<PowerGridSkill['category']>).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${activeCategory === category ? 'border-neon/55 bg-neon/15 text-neon' : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'}`}
            >
              {categoryLabel[category]}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowOnlyProjectLinked((prev) => !prev)}
            className={`ml-auto rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${showOnlyProjectLinked ? 'border-arc/60 bg-arc/20 text-arc' : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'}`}
          >
            Project-Locked {showOnlyProjectLinked ? 'On' : 'Off'}
          </button>
        </div>

        <div className="grid gap-3 xl:grid-cols-[264px_minmax(0,1fr)_328px]">
          <aside className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Project Signals</p>
            <p className="mt-2 text-sm text-white/62">Activate a project to see the skills it proves in real systems.</p>
            <div className="mt-4 space-y-3">
              {powerGridProjects.map((project) => {
                const active = activeProjectId === project.id
                return (
                  <button
                    key={project.id}
                    type="button"
                    onMouseEnter={() => setActiveProjectId(project.id)}
                    onMouseLeave={() => setActiveProjectId(null)}
                    onFocus={() => setActiveProjectId(project.id)}
                    onBlur={() => setActiveProjectId(null)}
                    onClick={() => setActiveProjectId((prev) => (prev === project.id ? null : project.id))}
                    className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-white/40 bg-white/12' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-xl text-white">{project.name}</p>
                      <span className="font-mono text-xs text-white/70">{project.powerOutput}%</span>
                    </div>
                    <p className="mt-1 text-xs text-white/65">{project.description}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: project.color }}
                        animate={{ width: `${project.powerOutput}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[#031021]/82 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Topology View</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
                  {filteredSkills.length} skills | {visibleLinks.length} links
                </p>
              </div>

              <div className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#010913] md:h-[520px]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:40px_40px] opacity-25" />
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  {visibleLinks.map((edge, index) => {
                    const from = skillMap[edge.sourceSkillId]
                    const to = skillMap[edge.targetSkillId]
                    if (!from || !to) return null

                    const selectedPath = selectedSkill && (edge.sourceSkillId === selectedSkill.id || edge.targetSkillId === selectedSkill.id)
                    const related = relationSet.has(edge.sourceSkillId) && relationSet.has(edge.targetSkillId)
                    const projectLinked = activeProjectId && linkedSet.has(edge.sourceSkillId) && linkedSet.has(edge.targetSkillId)

                    const brightness = selectedPath ? 0.9 : related ? 0.75 : projectLinked ? 0.7 : 0.28
                    const thickness = 0.35 + edge.weight * (selectedPath ? 0.5 : 0.35)
                    const hue = edge.type === 'strong' ? 174 : edge.type === 'indirect' ? 206 : 38
                    const midX = (from.x + to.x) / 2
                    const bend = Math.sin(index * 1.7) * 4
                    const path = `M ${from.x} ${from.y} Q ${midX} ${((from.y + to.y) / 2) + bend} ${to.x} ${to.y}`

                    return (
                      <motion.path
                        key={`${edge.sourceSkillId}-${edge.targetSkillId}`}
                        d={path}
                        fill="none"
                        stroke={`hsla(${hue}, 96%, 70%, ${brightness})`}
                        strokeWidth={thickness}
                        initial={{ pathLength: 0.2, opacity: 0.2 }}
                        animate={{ pathLength: [0.2, 1, 1], opacity: [0.2, brightness, brightness] }}
                        transition={{ duration: 1.5 + edge.weight, ease: 'easeInOut' }}
                      />
                    )
                  })}
                </svg>

                {filteredSkills.map((skill, index) => {
                  const selected = selectedSkill?.id === skill.id
                  const related = relationSet.has(skill.id)
                  const projectHit = activeProjectId ? linkedSet.has(skill.id) : false
                  const emphasis = selected ? 1 : related ? 0.84 : projectHit ? 0.75 : 0.52
                  const glow = categoryTone[skill.category]

                  return (
                    <motion.button
                      key={skill.id}
                      type="button"
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-black/60 px-2.5 py-1.5 text-center backdrop-blur-md transition ${selected ? 'border-white/65' : 'border-white/22 hover:border-white/40'}`}
                      style={{ left: `${skill.x}%`, top: `${skill.y}%`, opacity: emphasis }}
                      animate={{
                        y: [0, Math.sin(index * 0.55 + Date.now() * 0.0003) * 2.4, 0],
                        boxShadow: [
                          `0 0 10px rgba(88,246,210,${0.1 + emphasis * 0.15})`,
                          `0 0 ${20 + emphasis * 25}px rgba(88,246,210,${0.16 + emphasis * 0.22})`,
                          `0 0 10px rgba(88,246,210,${0.1 + emphasis * 0.15})`,
                        ],
                      }}
                      transition={{ duration: 2.4 + index * 0.04, repeat: Infinity, ease: 'easeInOut' }}
                      whileHover={{ scale: 1.08 }}
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/52">{categoryLabel[skill.category]}</p>
                      <p className={`font-display text-[15px] leading-tight md:text-lg ${glow.split(' ')[2]}`}>{skill.name}</p>
                      <p className="font-mono text-[10px] text-neon/85">{skill.strength}%</p>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">Execution Ledger</p>
              <div className="mt-2 max-h-[290px] space-y-2 overflow-auto pr-1">
                {filteredSkills
                  .slice()
                  .sort((a, b) => b.strength - a.strength)
                  .map((skill) => {
                    const selected = selectedSkill?.id === skill.id
                    return (
                      <button
                        key={`ledger-${skill.id}`}
                        type="button"
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={`w-full rounded-xl border p-2.5 text-left transition ${selected ? 'border-white/45 bg-white/12' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-display text-white">{skill.name}</span>
                          <span className="font-mono text-white/70">{skill.strength}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-neon via-arc to-plasma" style={{ width: `${skill.strength}%` }} />
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-white/60 sm:grid-cols-4">
                          <span>Scalability {skill.impact.scalability}%</span>
                          <span>Decomposition {skill.impact.decomposition}%</span>
                          <span>Architecture {skill.impact.architecture}%</span>
                          <span>Performance {skill.impact.performance}%</span>
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Skill Briefing</p>
            <h3 className="mt-3 font-display text-3xl text-white">{selectedSkill.name}</h3>
            <p className={`mt-1 text-xs uppercase tracking-[0.16em] ${categoryTone[selectedSkill.category].split(' ')[2]}`}>
              {categoryLabel[selectedSkill.category]} systems capability
            </p>

            <div className="mt-4 rounded-xl border border-white/12 bg-white/6 p-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/55">
                <span>Core Strength</span>
                <span>{selectedSkill.strength}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-neon via-arc to-plasma" animate={{ width: `${selectedSkill.strength}%` }} transition={{ duration: 0.35 }} />
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/75">{selectedSkill.description}</p>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">Connected Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedSkill.connections.map((id) => (
                  <button
                    key={`conn-${id}`}
                    type="button"
                    onClick={() => setSelectedSkillId(id)}
                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/72 hover:border-white/35"
                  >
                    {skillMap[id]?.name ?? id}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">Where It Proves Out</p>
              <div className="mt-2 space-y-2">
                {selectedSkill.relatedProjects.map((projectId) => {
                  const project = powerGridProjects.find((item) => item.id === projectId)
                  if (!project) return null
                  return (
                    <div key={`proof-${project.id}`} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                      <p className="text-sm font-display text-white">{project.name}</p>
                      <p className="mt-1 text-xs text-white/65">{project.description}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-neon/80">Signal: {project.powerOutput}% project output</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              <p className="font-mono uppercase tracking-[0.14em] text-neon/80">Why This Matters</p>
              <p className="mt-1">
                {selectedSkill.name} strengthens delivery quality by combining {selectedSkill.connections.length} direct dependencies,
                architecture score {selectedSkill.impact.architecture}%, and project-backed evidence across real system builds.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Average Mastery</p>
            <p className="mt-1 font-display text-3xl text-neon">{avgMastery}%</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Architecture Index</p>
            <p className="mt-1 font-display text-3xl text-arc">{avgArchitecture}%</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Visible Skills</p>
            <p className="mt-1 font-display text-3xl text-plasma">{filteredSkills.length}/{powerGridSkills.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Strong Links</p>
            <p className="mt-1 font-display text-3xl text-emerald-300">{strongLinkCount}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Active Project</p>
            <p className="mt-1 font-display text-base text-white">{projectSignal?.name ?? 'None (global view)'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
