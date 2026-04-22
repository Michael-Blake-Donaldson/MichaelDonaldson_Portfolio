import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { powerGridConnections, powerGridProjects, powerGridSkills } from '../data/siteData'
import type { PowerGridConnection, PowerGridSkill } from '../types'
import { usePowerGridStore } from '../stores/usePowerGridStore'

gsap.registerPlugin(ScrollTrigger)

const categoryColor: Record<PowerGridSkill['category'], string> = {
  frontend: 'text-cyan-300',
  backend: 'text-emerald-300',
  system: 'text-yellow-300',
  platform: 'text-purple-300',
  data: 'text-blue-300',
  quality: 'text-amber-300',
}

function buildAdjacency(connections: PowerGridConnection[]) {
  const adjacency = new Map<string, Array<{ target: string, weight: number }>>()
  for (const edge of connections) {
    if (!adjacency.has(edge.sourceSkillId)) adjacency.set(edge.sourceSkillId, [])
    if (!adjacency.has(edge.targetSkillId)) adjacency.set(edge.targetSkillId, [])
    adjacency.get(edge.sourceSkillId)?.push({ target: edge.targetSkillId, weight: edge.weight })
    adjacency.get(edge.targetSkillId)?.push({ target: edge.sourceSkillId, weight: edge.weight })
  }
  return adjacency
}

function propagateEnergy(
  sources: Record<string, number>,
  adjacency: Map<string, Array<{ target: string, weight: number }>>,
  skills: PowerGridSkill[],
) {
  const energies = Object.fromEntries(skills.map((skill) => [skill.id, skill.strength / 780])) as Record<string, number>
  const queue: Array<{ id: string, energy: number, depth: number }> = []

  for (const [id, energy] of Object.entries(sources)) {
    energies[id] = Math.max(energies[id] ?? 0, energy)
    queue.push({ id, energy, depth: 0 })
  }

  const decay = 0.74
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue
    if (current.depth > 4) continue
    const neighbors = adjacency.get(current.id) ?? []

    for (const neighbor of neighbors) {
      const transfer = current.energy * neighbor.weight * decay
      if (transfer < 0.045) continue
      if (transfer <= (energies[neighbor.target] ?? 0) + 0.015) continue
      energies[neighbor.target] = transfer
      queue.push({ id: neighbor.target, energy: transfer, depth: current.depth + 1 })
    }
  }

  return energies
}

export default function SkillsSection() {
  const rootRef = useRef<HTMLElement | null>(null)
  const graphRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [ambientPhase, setAmbientPhase] = useState(0)

  const {
    activeProjectId,
    hoveredSkillId,
    selectedSkillId,
    setActiveProjectId,
    setHoveredSkillId,
    setSelectedSkillId,
  } = usePowerGridStore()

  const skillMap = useMemo(
    () => Object.fromEntries(powerGridSkills.map((skill) => [skill.id, skill])) as Record<string, PowerGridSkill>,
    [],
  )

  const adjacency = useMemo(() => buildAdjacency(powerGridConnections), [])

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(graph)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let rafId = 0
    let last = 0

    const tick = (time: number) => {
      if (time - last > 140) {
        setAmbientPhase((phase) => phase + 0.12)
        last = time
      }
      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.power-grid-shell',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 68%',
            end: 'top 35%',
            scrub: 0.35,
          },
        },
      )

      gsap.to('.grid-ambient-layer', {
        yPercent: 12,
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

  const sourceMap = useMemo(() => {
    if (activeProjectId) {
      const project = powerGridProjects.find((item) => item.id === activeProjectId)
      if (!project) return {}
      const source = (project.powerOutput / 100) * 0.98
      return Object.fromEntries(project.connectedSkills.map((skillId) => [skillId, source]))
    }

    if (hoveredSkillId) {
      const skill = skillMap[hoveredSkillId]
      if (!skill) return {}
      return { [hoveredSkillId]: skill.strength / 100 }
    }

    if (selectedSkillId) {
      const skill = skillMap[selectedSkillId]
      if (!skill) return {}
      return { [selectedSkillId]: Math.max(0.7, skill.strength / 100) }
    }

    return {}
  }, [activeProjectId, hoveredSkillId, selectedSkillId, skillMap])

  const energyBySkill = useMemo(() => {
    const base = propagateEnergy(sourceMap, adjacency, powerGridSkills)

    if (Object.keys(sourceMap).length === 0) {
      for (const skill of powerGridSkills) {
        const ambientPulse = 0.045 + (Math.sin(ambientPhase + skill.x * 0.09 + skill.y * 0.06) + 1) * 0.022
        base[skill.id] = Math.max(base[skill.id] ?? 0, ambientPulse)
      }
    }

    return base
  }, [sourceMap, adjacency, ambientPhase])

  const focusedSkill = useMemo(() => {
    const selected = selectedSkillId ? skillMap[selectedSkillId] : null
    if (selected) return selected
    const hovered = hoveredSkillId ? skillMap[hoveredSkillId] : null
    if (hovered) return hovered

    const [best] = Object.entries(energyBySkill)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
    return skillMap[best] ?? powerGridSkills[0]
  }, [selectedSkillId, hoveredSkillId, energyBySkill, skillMap])

  const activeSkillSet = useMemo(
    () => new Set(Object.entries(energyBySkill).filter(([, energy]) => energy > 0.16).map(([id]) => id)),
    [energyBySkill],
  )

  const metrics = useMemo(() => {
    const energyValues = powerGridSkills.map((skill) => energyBySkill[skill.id] ?? 0)
    const totalOutput = Math.min(100, Math.round((energyValues.reduce((sum, value) => sum + value, 0) / energyValues.length) * 128))
    const weighted = powerGridSkills.reduce((sum, skill) => sum + (energyBySkill[skill.id] ?? 0) * skill.strength, 0)
    const weightCap = powerGridSkills.reduce((sum, skill) => sum + skill.strength, 0)
    const efficiency = Math.min(100, Math.round((weighted / weightCap) * 124))
    const activeSkills = energyValues.filter((value) => value > 0.2).length

    const strongConnections = powerGridConnections.filter((edge) => {
      const source = energyBySkill[edge.sourceSkillId] ?? 0
      const target = energyBySkill[edge.targetSkillId] ?? 0
      return edge.type === 'strong' && (source + target) / 2 > 0.2
    }).length

    const weakLinks = powerGridConnections.filter((edge) => {
      const source = energyBySkill[edge.sourceSkillId] ?? 0
      const target = energyBySkill[edge.targetSkillId] ?? 0
      return edge.type === 'weak' && (source + target) / 2 < 0.27
    }).length

    return { totalOutput, efficiency, activeSkills, strongConnections, weakLinks }
  }, [energyBySkill])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.width <= 0 || size.height <= 0) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(size.width * dpr)
    canvas.height = Math.floor(size.height * dpr)
    canvas.style.width = `${size.width}px`
    canvas.style.height = `${size.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const getPoint = (skillId: string) => {
      const node = skillMap[skillId]
      return {
        x: (node.x / 100) * size.width,
        y: (node.y / 100) * size.height,
      }
    }

    let rafId = 0
    const draw = (time: number) => {
      ctx.clearRect(0, 0, size.width, size.height)

      for (let index = 0; index < powerGridConnections.length; index += 1) {
        const edge = powerGridConnections[index]
        const sourcePoint = getPoint(edge.sourceSkillId)
        const targetPoint = getPoint(edge.targetSkillId)
        const sourceEnergy = energyBySkill[edge.sourceSkillId] ?? 0
        const targetEnergy = energyBySkill[edge.targetSkillId] ?? 0
        const energyLevel = (sourceEnergy + targetEnergy) / 2
        const isActive = energyLevel > 0.14

        const thickness = 0.8 + edge.weight * (isActive ? 3.1 : 1.8)
        const alpha = isActive ? 0.16 + energyLevel * 0.8 : 0.08
        const hue = edge.type === 'strong' ? 176 : edge.type === 'indirect' ? 202 : 42

        ctx.beginPath()
        ctx.moveTo(sourcePoint.x, sourcePoint.y)
        ctx.lineTo(targetPoint.x, targetPoint.y)
        ctx.lineWidth = thickness
        ctx.strokeStyle = `hsla(${hue}, 92%, ${isActive ? 72 : 62}%, ${alpha})`
        ctx.shadowBlur = isActive ? 18 : 0
        ctx.shadowColor = `hsla(${hue}, 92%, 68%, ${alpha})`
        ctx.stroke()
        ctx.shadowBlur = 0

        const particleCount = isActive ? (edge.type === 'strong' ? 3 : 2) : 1
        for (let p = 0; p < particleCount; p += 1) {
          const baseSpeed = 0.00008 + edge.weight * 0.00014
          const progress = (time * baseSpeed + index * 0.13 + p * 0.37) % 1
          const x = sourcePoint.x + (targetPoint.x - sourcePoint.x) * progress
          const y = sourcePoint.y + (targetPoint.y - sourcePoint.y) * progress
          const flicker = edge.type === 'weak' ? 0.55 + Math.sin(time * 0.011 + index) * 0.45 : 1

          ctx.beginPath()
          ctx.arc(x, y, isActive ? 1.2 + edge.weight * 2.4 : 1.1, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${hue}, 100%, 74%, ${(0.22 + energyLevel * 0.75) * flicker})`
          ctx.fill()
        }
      }

      rafId = window.requestAnimationFrame(draw)
    }

    rafId = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(rafId)
  }, [size, energyBySkill, skillMap])

  const focusedEnergy = energyBySkill[focusedSkill.id] ?? 0

  return (
    <section ref={rootRef} className="relative min-h-[84vh] overflow-hidden px-6 pb-24 pt-16 md:px-14">
      <div className="grid-ambient-layer pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_15%,rgba(55,220,255,0.17),transparent_34%),radial-gradient(circle_at_80%_25%,rgba(180,60,255,0.16),transparent_40%),radial-gradient(circle_at_48%_80%,rgba(82,255,182,0.14),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.1)_0.65px,transparent_0.8px)] [background-size:18px_18px] opacity-30" />

      <motion.div className="mb-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-[0.28em] text-neon/85">Skill Grid</p>
        <h2 className="mt-3 max-w-4xl font-display text-3xl text-white md:text-5xl">
          Skills as a Power Grid: projects emit energy, skills route it, systems come alive.
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-white/70 md:text-base">
          Hover a power plant to inject energy into the network. Hover or select a node to inspect how capability
          propagates across architecture, performance, and delivery outcomes.
        </p>
      </motion.div>

      <div className="power-grid-shell rounded-[2rem] border border-white/15 bg-black/35 p-3 backdrop-blur-2xl md:p-4">
        <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <aside className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon/80">Power Plants</p>
            <p className="mt-2 text-sm text-white/60">Projects generate flow through the skills they depend on.</p>
            <div className="mt-4 space-y-3">
              {powerGridProjects.map((project) => {
                const isFocused = activeProjectId === project.id
                return (
                  <button
                    key={project.id}
                    type="button"
                    onMouseEnter={() => setActiveProjectId(project.id)}
                    onMouseLeave={() => setActiveProjectId(null)}
                    onFocus={() => setActiveProjectId(project.id)}
                    onBlur={() => setActiveProjectId(null)}
                    className={`w-full rounded-xl border p-3 text-left transition ${isFocused ? 'border-white/40 bg-white/12' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-lg text-white">{project.name}</p>
                      <span className="font-mono text-xs text-white/70">{project.powerOutput}%</span>
                    </div>
                    <p className="mt-1 text-xs text-white/65">{project.description}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: project.color }}
                        animate={{ width: `${project.powerOutput}%` }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="rounded-2xl border border-white/10 bg-[#050d1b]/70 p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Skill Grid</p>
                <p className="text-xs text-white/55">Strong links transfer energy farther. Weak links flicker.</p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                Grid Online
              </span>
            </div>

            <div ref={graphRef} className="relative h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#030913]">
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

              {powerGridSkills.map((skill, index) => {
                const energy = energyBySkill[skill.id] ?? 0
                const isActive = activeSkillSet.has(skill.id)
                const isSelected = selectedSkillId === skill.id
                const dimmed = (activeProjectId || hoveredSkillId) && !isActive
                const baseScale = 0.88 + skill.strength / 260

                return (
                  <motion.button
                    key={skill.id}
                    type="button"
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-center backdrop-blur-md transition ${isSelected ? 'border-white/70 bg-white/18' : 'border-white/25 bg-black/45'} ${dimmed ? 'opacity-35' : 'opacity-100'}`}
                    style={{ left: `${skill.x}%`, top: `${skill.y}%` }}
                    onMouseEnter={() => setHoveredSkillId(skill.id)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                    onFocus={() => setHoveredSkillId(skill.id)}
                    onBlur={() => setHoveredSkillId(null)}
                    onClick={() => setSelectedSkillId(skill.id)}
                    animate={{
                      scale: [baseScale, baseScale + 0.06 + Math.min(0.22, energy * 0.28), baseScale],
                      boxShadow: [
                        `0 0 10px rgba(88,246,210,${0.12 + energy * 0.12})`,
                        `0 0 ${18 + energy * 42}px rgba(88,246,210,${0.22 + energy * 0.35})`,
                        `0 0 10px rgba(88,246,210,${0.12 + energy * 0.12})`,
                      ],
                    }}
                    transition={{
                      duration: 2.6 + index * 0.08,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    whileHover={{ scale: baseScale + 0.16, transition: { duration: 0.18 } }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/55">{skill.category}</p>
                    <p className="font-display text-base leading-tight text-white">{skill.name}</p>
                    <p className="font-mono text-[11px] text-neon/90">{skill.strength}%</p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon/80">Skill Inspector</p>
            <h3 className="mt-3 font-display text-2xl text-white">{focusedSkill.name}</h3>
            <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${categoryColor[focusedSkill.category]}`}>
              {focusedSkill.category} core strength
            </p>

            <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/55">Mastery</span>
                <span className="font-mono text-xs text-white">{Math.round(Math.max(focusedSkill.strength, focusedEnergy * 100))}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neon via-arc to-plasma"
                  animate={{ width: `${Math.max(10, Math.round(focusedEnergy * 100))}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-white/70">{focusedSkill.description}</p>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Used In Projects</p>
              <div className="mt-2 space-y-2">
                {focusedSkill.relatedProjects.map((projectId) => {
                  const project = powerGridProjects.find((item) => item.id === projectId)
                  if (!project) return null
                  return (
                    <div key={project.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                      {project.name}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Impact Metrics</p>
              <div className="mt-2 space-y-2.5 text-xs text-white/75">
                {Object.entries(focusedSkill.impact).map(([label, value]) => (
                  <div key={`${focusedSkill.id}-${label}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="capitalize">{label}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-arc to-neon"
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Total System Output</p>
            <p className="mt-1 font-display text-3xl text-neon">{metrics.totalOutput}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Grid Efficiency</p>
            <p className="mt-1 font-display text-3xl text-arc">{metrics.efficiency}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Active Skills</p>
            <p className="mt-1 font-display text-3xl text-plasma">{metrics.activeSkills} / {powerGridSkills.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Strong Connections</p>
            <p className="mt-1 font-display text-3xl text-emerald-300">{metrics.strongConnections}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Weak Links</p>
            <p className="mt-1 font-display text-3xl text-amber-300">{metrics.weakLinks}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
