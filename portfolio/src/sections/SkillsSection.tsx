import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pause, Play, RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, Bug } from 'lucide-react'
import { powerGridConnections, powerGridProjects, powerGridSkills } from '../data/siteData'
import type { PowerGridConnection, PowerGridSkill } from '../types'
import { usePowerGridStore } from '../stores/usePowerGridStore'

gsap.registerPlugin(ScrollTrigger)

type ThreatType = {
  name: string
  hue: number
  severity: number
}

type Threat = {
  id: string
  type: ThreatType
  x: number
  y: number
  targetSkillId: string
  health: number
  speed: number
}

type Burst = {
  id: string
  x: number
  y: number
  radius: number
  power: number
  ttl: number
}

const categoryGlow: Record<PowerGridSkill['category'], string> = {
  frontend: 'rgba(34,211,238,0.88)',
  backend: 'rgba(74,222,128,0.88)',
  system: 'rgba(250,204,21,0.9)',
  platform: 'rgba(196,181,253,0.9)',
  data: 'rgba(96,165,250,0.88)',
  quality: 'rgba(251,191,36,0.88)',
}

const categoryClass: Record<PowerGridSkill['category'], string> = {
  frontend: 'text-cyan-300',
  backend: 'text-emerald-300',
  system: 'text-yellow-300',
  platform: 'text-violet-300',
  data: 'text-blue-300',
  quality: 'text-amber-300',
}

const threatCatalog: ThreatType[] = [
  { name: 'Lag Spike', hue: 6, severity: 1.1 },
  { name: 'API Timeout', hue: 20, severity: 1.25 },
  { name: 'State Drift', hue: 350, severity: 1.35 },
  { name: 'Memory Leak', hue: 14, severity: 1.5 },
  { name: 'Auth Breach', hue: 28, severity: 1.6 },
  { name: 'Render Crash', hue: 0, severity: 1.45 },
  { name: 'Sync Failure', hue: 338, severity: 1.28 },
]

const gameplayRole: Record<string, { role: string, effect: string, why: string }> = {
  react: {
    role: 'UI stabilization matrix',
    effect: 'Restores render stability and visual integrity.',
    why: 'Powers interactive product surfaces under stress.',
  },
  typescript: {
    role: 'Type safety shield',
    effect: 'Reduces instability spikes and error propagation.',
    why: 'Keeps complex systems predictable at scale.',
  },
  python: {
    role: 'Backend logic engine',
    effect: 'Boosts processing throughput for critical routes.',
    why: 'Supports high-complexity decision and simulation paths.',
  },
  apis: {
    role: 'Request routing module',
    effect: 'Reconnects disrupted channels and packets.',
    why: 'Ensures resilient service-to-service flow.',
  },
  databases: {
    role: 'Persistence core',
    effect: 'Protects storage integrity and recovers data coherence.',
    why: 'Anchors reliability for production workloads.',
  },
  websockets: {
    role: 'Realtime sync relay',
    effect: 'Restores live updates and rapid signal transfer.',
    why: 'Maintains synchronized user and system state.',
  },
  testing: {
    role: 'Bug suppression field',
    effect: 'Dampens repeated failure impact from threats.',
    why: 'Prevents regressions and supports safe iteration.',
  },
  'system-design': {
    role: 'Master amplifier',
    effect: 'Strengthens nearby nodes and raises defense efficiency.',
    why: 'Coordinates architecture under scale and pressure.',
  },
  devops: {
    role: 'Runtime operations gate',
    effect: 'Stabilizes deployment fault turbulence.',
    why: 'Sustains reliable delivery loops.',
  },
}

function buildAdjacency(connections: PowerGridConnection[]) {
  const map = new Map<string, Array<{ target: string, weight: number }>>()
  for (const connection of connections) {
    if (!map.has(connection.sourceSkillId)) map.set(connection.sourceSkillId, [])
    if (!map.has(connection.targetSkillId)) map.set(connection.targetSkillId, [])
    map.get(connection.sourceSkillId)?.push({ target: connection.targetSkillId, weight: connection.weight })
    map.get(connection.targetSkillId)?.push({ target: connection.sourceSkillId, weight: connection.weight })
  }
  return map
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export default function SkillsSection() {
  const rootRef = useRef<HTMLElement | null>(null)
  const arenaRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 })
  const [ambientPhase, setAmbientPhase] = useState(0)
  const [displayThreats, setDisplayThreats] = useState<Threat[]>([])
  const [displayBursts, setDisplayBursts] = useState<Burst[]>([])
  const [nodeIntegrity, setNodeIntegrity] = useState<Record<string, number>>({})
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [projectBoost, setProjectBoost] = useState<{ projectId: string | null, until: number }>({ projectId: null, until: 0 })

  const threatsRef = useRef<Threat[]>([])
  const burstsRef = useRef<Burst[]>([])
  const nodeIntegrityRef = useRef<Record<string, number>>({})
  const cooldownsRef = useRef<Record<string, number>>({})
  const lastFrameRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const waveStartRef = useRef(0)
  const waveThreatsClearedRef = useRef(0)
  const scoreRef = useRef(0)
  const healthRef = useRef(100)
  const comboRef = useRef(0)
  const containedRef = useRef(0)

  const {
    gameStarted,
    gamePaused,
    currentWave,
    systemHealth,
    gridStability,
    score,
    combo,
    threatsContained,
    audioEnabled,
    gamePhase,
    unlockedSkillIds,
    activeProjectId,
    hoveredSkillId,
    selectedSkillId,
    setGameStarted,
    setGamePaused,
    setCurrentWave,
    setSystemHealth,
    setGridStability,
    setScore,
    setCombo,
    setThreatsContained,
    setAudioEnabled,
    setGamePhase,
    setUnlockedSkillIds,
    setActiveProjectId,
    setHoveredSkillId,
    setSelectedSkillId,
    resetGame,
  } = usePowerGridStore()

  const adjacency = useMemo(() => buildAdjacency(powerGridConnections), [])
  const skillMap = useMemo(
    () => Object.fromEntries(powerGridSkills.map((skill) => [skill.id, skill])) as Record<string, PowerGridSkill>,
    [],
  )

  const nodePoints = useMemo(() => {
    const map = new Map<string, { x: number, y: number }>()
    for (const skill of powerGridSkills) {
      map.set(skill.id, {
        x: (skill.x / 100) * arenaSize.width,
        y: (skill.y / 100) * arenaSize.height,
      })
    }
    return map
  }, [arenaSize])

  useEffect(() => {
    const arena = arenaRef.current
    if (!arena) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setArenaSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(arena)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.skills-game-shell',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 72%',
            end: 'top 36%',
            scrub: 0.3,
          },
        },
      )

      gsap.to('.skills-game-ambient', {
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

  useEffect(() => {
    if (Object.keys(nodeIntegrityRef.current).length > 0) return
    const initialIntegrity = Object.fromEntries(powerGridSkills.map((skill) => [skill.id, 100]))
    nodeIntegrityRef.current = initialIntegrity
    setNodeIntegrity(initialIntegrity)
    const initialCooldowns = Object.fromEntries(powerGridSkills.map((skill) => [skill.id, 0]))
    cooldownsRef.current = initialCooldowns
    setCooldowns(initialCooldowns)
  }, [])

  useEffect(() => {
    let rafId = 0
    const pulse = (time: number) => {
      setAmbientPhase(time * 0.001)
      rafId = window.requestAnimationFrame(pulse)
    }
    rafId = window.requestAnimationFrame(pulse)
    return () => window.cancelAnimationFrame(rafId)
  }, [])

  const startGame = () => {
    const baseUnlock = powerGridSkills.slice(0, 6).map((skill) => skill.id)
    setUnlockedSkillIds(baseUnlock)
    setGameStarted(true)
    setGamePaused(false)
    setGamePhase('running')
    setCurrentWave(1)
    setSystemHealth(100)
    setGridStability(100)
    setScore(0)
    setCombo(0)
    setThreatsContained(0)
    setActiveProjectId(null)
    setHoveredSkillId(null)
    setSelectedSkillId(baseUnlock[0] ?? null)

    const baseIntegrity = Object.fromEntries(powerGridSkills.map((skill) => [skill.id, 100]))
    nodeIntegrityRef.current = baseIntegrity
    setNodeIntegrity(baseIntegrity)
    const baseCooldowns = Object.fromEntries(powerGridSkills.map((skill) => [skill.id, 0]))
    cooldownsRef.current = baseCooldowns
    setCooldowns(baseCooldowns)

    threatsRef.current = []
    burstsRef.current = []
    setDisplayThreats([])
    setDisplayBursts([])

    scoreRef.current = 0
    healthRef.current = 100
    comboRef.current = 0
    containedRef.current = 0
    waveThreatsClearedRef.current = 0
    lastSpawnRef.current = performance.now()
    waveStartRef.current = performance.now()
    lastFrameRef.current = performance.now()
    setProjectBoost({ projectId: null, until: 0 })
  }

  const createThreat = (now: number) => {
    const unlocked = unlockedSkillIds.length > 0 ? unlockedSkillIds : powerGridSkills.slice(0, 6).map((skill) => skill.id)
    const targetSkillId = unlocked[Math.floor(Math.random() * unlocked.length)]
    const threatType = threatCatalog[(Math.floor(now / 100) + Math.floor(Math.random() * 999)) % threatCatalog.length]

    const edge = Math.floor(Math.random() * 4)
    let x = 0
    let y = 0
    if (edge === 0) {
      x = -24
      y = Math.random() * arenaSize.height
    } else if (edge === 1) {
      x = arenaSize.width + 24
      y = Math.random() * arenaSize.height
    } else if (edge === 2) {
      x = Math.random() * arenaSize.width
      y = -24
    } else {
      x = Math.random() * arenaSize.width
      y = arenaSize.height + 24
    }

    const speed = 24 + currentWave * 5 + Math.random() * 24

    threatsRef.current.push({
      id: `threat-${now}-${Math.random().toString(36).slice(2, 7)}`,
      type: threatType,
      x,
      y,
      targetSkillId,
      health: 100 + currentWave * 12,
      speed,
    })
  }

  const activateSkill = (skillId: string) => {
    if (gamePhase !== 'running' || gamePaused) return
    if (!unlockedSkillIds.includes(skillId)) return

    const cooldown = cooldownsRef.current[skillId] ?? 0
    if (cooldown > 0) return

    const point = nodePoints.get(skillId)
    if (!point) return
    const skill = skillMap[skillId]
    const power = skill.strength / 100

    burstsRef.current.push({
      id: `burst-${skillId}-${Date.now()}`,
      x: point.x,
      y: point.y,
      radius: 95 + skill.strength * 0.45,
      power,
      ttl: 1300,
    })

    const nextCooldown = { ...cooldownsRef.current }
    nextCooldown[skillId] = 1600 + (100 - skill.strength) * 16
    cooldownsRef.current = nextCooldown
    setCooldowns(nextCooldown)

    const nextIntegrity = { ...nodeIntegrityRef.current }
    nextIntegrity[skillId] = clamp((nextIntegrity[skillId] ?? 100) + 8, 0, 100)
    nodeIntegrityRef.current = nextIntegrity
    setNodeIntegrity(nextIntegrity)

    setSelectedSkillId(skillId)
  }

  const activateProjectBoost = (projectId: string) => {
    setProjectBoost({ projectId, until: Date.now() + 6200 })
    setActiveProjectId(projectId)

    const project = powerGridProjects.find((item) => item.id === projectId)
    if (!project) return
    for (const skillId of project.connectedSkills) {
      const point = nodePoints.get(skillId)
      const skill = skillMap[skillId]
      if (!point || !skill) continue
      burstsRef.current.push({
        id: `reactor-${skillId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: point.x,
        y: point.y,
        radius: 140,
        power: 0.95 + skill.strength / 200,
        ttl: 1800,
      })
    }
  }

  useEffect(() => {
    if (!gameStarted || gamePhase !== 'running' || arenaSize.width <= 0 || arenaSize.height <= 0) return

    let rafId = 0
    let uiSyncAt = 0

    const frame = (now: number) => {
      const prev = lastFrameRef.current || now
      const dtMs = Math.min(34, now - prev)
      const dt = dtMs / 1000
      lastFrameRef.current = now

      if (!gamePaused) {
        const spawnInterval = Math.max(520, 1900 - currentWave * 120)
        if (now - lastSpawnRef.current >= spawnInterval) {
          createThreat(now)
          lastSpawnRef.current = now
        }

        const burstList = burstsRef.current
        for (let i = burstList.length - 1; i >= 0; i -= 1) {
          burstList[i].ttl -= dtMs
          if (burstList[i].ttl <= 0) burstList.splice(i, 1)
        }

        const nextCooldowns = { ...cooldownsRef.current }
        let cooldownChanged = false
        for (const skill of powerGridSkills) {
          const left = nextCooldowns[skill.id] ?? 0
          if (left > 0) {
            nextCooldowns[skill.id] = Math.max(0, left - dtMs)
            cooldownChanged = true
          }
        }
        if (cooldownChanged) {
          cooldownsRef.current = nextCooldowns
        }

        const nextIntegrity = { ...nodeIntegrityRef.current }
        for (const skill of powerGridSkills) {
          nextIntegrity[skill.id] = clamp((nextIntegrity[skill.id] ?? 100) + dt * 1.5, 22, 100)
        }

        const threats = threatsRef.current
        for (let i = threats.length - 1; i >= 0; i -= 1) {
          const threat = threats[i]
          const target = nodePoints.get(threat.targetSkillId)
          if (!target) continue

          const dx = target.x - threat.x
          const dy = target.y - threat.y
          const distance = Math.hypot(dx, dy) || 1

          const ux = dx / distance
          const uy = dy / distance

          threat.x += ux * threat.speed * dt
          threat.y += uy * threat.speed * dt

          const projectMultiplier =
            projectBoost.projectId && Date.now() < projectBoost.until
              ? powerGridProjects.find((project) => project.id === projectBoost.projectId)?.connectedSkills.includes(threat.targetSkillId)
                ? 1.22
                : 1
              : 1

          let incoming = 0
          for (const burst of burstList) {
            const bx = burst.x - threat.x
            const by = burst.y - threat.y
            const bDist = Math.hypot(bx, by)
            if (bDist > burst.radius) continue
            const radialGain = 1 - bDist / burst.radius
            incoming += radialGain * burst.power * projectMultiplier
          }

          const passiveDefense = (skillMap[threat.targetSkillId].strength / 100) * 0.42 + (nextIntegrity[threat.targetSkillId] ?? 100) / 360
          threat.health -= (incoming + passiveDefense * 0.28) * dtMs * 3.2

          if (threat.health <= 0) {
            threats.splice(i, 1)
            scoreRef.current += Math.round(90 + threat.type.severity * 30 + comboRef.current * 7)
            comboRef.current = clamp(comboRef.current + 1, 0, 999)
            containedRef.current += 1
            waveThreatsClearedRef.current += 1
            continue
          }

          if (distance < 16) {
            threats.splice(i, 1)
            const hit = threat.type.severity * (6.8 + currentWave * 0.5)
            healthRef.current = clamp(healthRef.current - hit, 0, 100)
            nextIntegrity[threat.targetSkillId] = clamp((nextIntegrity[threat.targetSkillId] ?? 100) - hit * 1.6, 0, 100)
            comboRef.current = 0
            continue
          }
        }

        nodeIntegrityRef.current = nextIntegrity

        const avgIntegrity = Object.values(nextIntegrity).reduce((sum, v) => sum + v, 0) / powerGridSkills.length
        const stability = clamp(Math.round((avgIntegrity * 0.56 + healthRef.current * 0.44)), 0, 100)

        if (healthRef.current <= 0) {
          setGamePhase('summary')
          setGamePaused(true)
          setSystemHealth(0)
          setGridStability(stability)
        } else {
          const waveDuration = now - waveStartRef.current
          if (waveDuration > 24000 && waveThreatsClearedRef.current >= Math.max(4, currentWave + 2)) {
            const nextWave = currentWave + 1
            setCurrentWave(nextWave)
            waveStartRef.current = now
            waveThreatsClearedRef.current = 0
            const unlockCount = clamp(6 + (nextWave - 1) * 2, 0, powerGridSkills.length)
            setUnlockedSkillIds(powerGridSkills.slice(0, unlockCount).map((skill) => skill.id))
          }
        }

        if (uiSyncAt <= 0 || now - uiSyncAt > 120) {
          uiSyncAt = now
          setDisplayThreats([...threatsRef.current])
          setDisplayBursts([...burstsRef.current])
          setCooldowns({ ...cooldownsRef.current })
          setNodeIntegrity({ ...nodeIntegrityRef.current })
          setSystemHealth(Math.round(healthRef.current))
          setGridStability(clamp(Math.round((Object.values(nodeIntegrityRef.current).reduce((sum, v) => sum + v, 0) / powerGridSkills.length) * 0.56 + healthRef.current * 0.44), 0, 100))
          setScore(scoreRef.current)
          setCombo(comboRef.current)
          setThreatsContained(containedRef.current)
        }
      }

      rafId = window.requestAnimationFrame(frame)
    }

    rafId = window.requestAnimationFrame(frame)
    return () => window.cancelAnimationFrame(rafId)
  }, [
    gameStarted,
    gamePhase,
    gamePaused,
    arenaSize,
    currentWave,
    setCombo,
    setCurrentWave,
    setGamePaused,
    setGamePhase,
    setGridStability,
    setScore,
    setSystemHealth,
    setThreatsContained,
    setUnlockedSkillIds,
    skillMap,
    unlockedSkillIds,
    nodePoints,
    projectBoost,
  ])

  useEffect(() => {
    if (!projectBoost.projectId) return
    if (Date.now() < projectBoost.until) return
    setProjectBoost({ projectId: null, until: 0 })
    setActiveProjectId(null)
  }, [ambientPhase, projectBoost, setActiveProjectId])

  const sourceMap = useMemo(() => {
    const source: Record<string, number> = {}

    if (activeProjectId) {
      const project = powerGridProjects.find((item) => item.id === activeProjectId)
      if (project) {
        for (const skillId of project.connectedSkills) {
          source[skillId] = Math.max(source[skillId] ?? 0, project.powerOutput / 100)
        }
      }
    }

    if (hoveredSkillId) source[hoveredSkillId] = Math.max(source[hoveredSkillId] ?? 0, skillMap[hoveredSkillId].strength / 100)
    if (selectedSkillId) source[selectedSkillId] = Math.max(source[selectedSkillId] ?? 0, skillMap[selectedSkillId].strength / 95)

    for (const burst of displayBursts) {
      const nearest = powerGridSkills.reduce(
        (best, skill) => {
          const point = nodePoints.get(skill.id)
          if (!point) return best
          const dist = Math.hypot(point.x - burst.x, point.y - burst.y)
          if (dist < best.dist) return { id: skill.id, dist }
          return best
        },
        { id: '', dist: Number.POSITIVE_INFINITY },
      )
      if (nearest.id) {
        source[nearest.id] = Math.max(source[nearest.id] ?? 0, 0.45 + burst.power * 0.5)
      }
    }

    if (Object.keys(source).length === 0) {
      for (const skillId of unlockedSkillIds) {
        source[skillId] = 0.08 + (Math.sin(ambientPhase + (skillMap[skillId].x + skillMap[skillId].y) * 0.04) + 1) * 0.03
      }
    }

    return source
  }, [activeProjectId, hoveredSkillId, selectedSkillId, displayBursts, ambientPhase, unlockedSkillIds, skillMap, nodePoints])

  const energyBySkill = useMemo(() => {
    const base = Object.fromEntries(powerGridSkills.map((skill) => [skill.id, (nodeIntegrity[skill.id] ?? 100) / 900])) as Record<string, number>
    const queue: Array<{ id: string, energy: number, depth: number }> = []

    for (const [id, energy] of Object.entries(sourceMap)) {
      base[id] = Math.max(base[id], energy)
      queue.push({ id, energy, depth: 0 })
    }

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current || current.depth > 4) continue
      const neighbors = adjacency.get(current.id) ?? []
      for (const neighbor of neighbors) {
        const transfer = current.energy * neighbor.weight * 0.72
        if (transfer < 0.045) continue
        if (transfer <= (base[neighbor.target] ?? 0) + 0.014) continue
        base[neighbor.target] = transfer
        queue.push({ id: neighbor.target, energy: transfer, depth: current.depth + 1 })
      }
    }

    return base
  }, [sourceMap, adjacency, nodeIntegrity])

  const activeSkillSet = useMemo(
    () => new Set(Object.entries(energyBySkill).filter(([, energy]) => energy > 0.14).map(([id]) => id)),
    [energyBySkill],
  )

  const strongestSkill = useMemo(() => {
    const ranked = [...powerGridSkills].sort((a, b) => (energyBySkill[b.id] ?? 0) - (energyBySkill[a.id] ?? 0))
    return ranked[0]
  }, [energyBySkill])

  const focusedSkill = useMemo(() => {
    if (selectedSkillId) return skillMap[selectedSkillId]
    if (hoveredSkillId) return skillMap[hoveredSkillId]
    return strongestSkill ?? powerGridSkills[0]
  }, [selectedSkillId, hoveredSkillId, strongestSkill, skillMap])

  const defenseEfficiency = useMemo(() => {
    const activeLinks = powerGridConnections.filter((edge) => {
      const source = energyBySkill[edge.sourceSkillId] ?? 0
      const target = energyBySkill[edge.targetSkillId] ?? 0
      return (source + target) / 2 > 0.16
    }).length
    return clamp(Math.round((activeLinks / powerGridConnections.length) * 100 + combo * 1.6), 0, 100)
  }, [energyBySkill, combo])

  const connectionCanvasNeeds = gameStarted && arenaSize.width > 0 && arenaSize.height > 0

  useEffect(() => {
    if (!connectionCanvasNeeds) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(arenaSize.width * dpr)
    canvas.height = Math.floor(arenaSize.height * dpr)
    canvas.style.width = `${arenaSize.width}px`
    canvas.style.height = `${arenaSize.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let rafId = 0
    const render = (time: number) => {
      ctx.clearRect(0, 0, arenaSize.width, arenaSize.height)

      for (let i = 0; i < powerGridConnections.length; i += 1) {
        const connection = powerGridConnections[i]
        const sourcePoint = nodePoints.get(connection.sourceSkillId)
        const targetPoint = nodePoints.get(connection.targetSkillId)
        if (!sourcePoint || !targetPoint) continue

        const sourceEnergy = energyBySkill[connection.sourceSkillId] ?? 0
        const targetEnergy = energyBySkill[connection.targetSkillId] ?? 0
        const avg = (sourceEnergy + targetEnergy) / 2
        const active = avg > 0.12
        const hue = connection.type === 'strong' ? 174 : connection.type === 'indirect' ? 204 : 38

        ctx.beginPath()
        ctx.moveTo(sourcePoint.x, sourcePoint.y)
        ctx.lineTo(targetPoint.x, targetPoint.y)
        ctx.lineWidth = 0.8 + connection.weight * (active ? 2.9 : 1.25)
        ctx.strokeStyle = `hsla(${hue}, 96%, ${active ? 72 : 60}%, ${active ? 0.2 + avg * 0.82 : 0.09})`
        ctx.shadowBlur = active ? 16 : 0
        ctx.shadowColor = `hsla(${hue}, 96%, 70%, ${active ? 0.28 : 0})`
        ctx.stroke()
        ctx.shadowBlur = 0

        const particles = active ? (connection.type === 'strong' ? 3 : 2) : 1
        for (let p = 0; p < particles; p += 1) {
          const speed = 0.00006 + connection.weight * 0.00015
          const t = (time * speed + i * 0.17 + p * 0.27) % 1
          const x = sourcePoint.x + (targetPoint.x - sourcePoint.x) * t
          const y = sourcePoint.y + (targetPoint.y - sourcePoint.y) * t

          ctx.beginPath()
          ctx.arc(x, y, active ? 1.5 + connection.weight * 1.4 : 1, 0, Math.PI * 2)
          const flicker = connection.type === 'weak' ? 0.55 + Math.sin(time * 0.012 + i) * 0.45 : 1
          ctx.fillStyle = `hsla(${hue}, 100%, 76%, ${(0.25 + avg * 0.72) * flicker})`
          ctx.fill()
        }
      }

      for (const burst of displayBursts) {
        const life = clamp(burst.ttl / 1800, 0, 1)
        ctx.beginPath()
        ctx.arc(burst.x, burst.y, burst.radius * (1 - life * 0.42), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(88,246,210,${0.04 + life * 0.2})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      rafId = window.requestAnimationFrame(render)
    }

    rafId = window.requestAnimationFrame(render)
    return () => window.cancelAnimationFrame(rafId)
  }, [connectionCanvasNeeds, arenaSize, nodePoints, energyBySkill, displayBursts])

  const topProject = useMemo(() => {
    const projectScores = powerGridProjects.map((project) => {
      const value = project.connectedSkills.reduce((sum, id) => sum + (energyBySkill[id] ?? 0), 0)
      return { project, value }
    })
    projectScores.sort((a, b) => b.value - a.value)
    return projectScores[0]?.project ?? powerGridProjects[0]
  }, [energyBySkill])

  const highScore = useMemo(() => {
    const value = Number(localStorage.getItem('skills-grid-high-score') ?? '0')
    return Number.isFinite(value) ? value : 0
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase !== 'summary') return
    const prev = Number(localStorage.getItem('skills-grid-high-score') ?? '0')
    if (score > prev) localStorage.setItem('skills-grid-high-score', String(score))
  }, [gamePhase, score])

  return (
    <section ref={rootRef} className="relative min-h-[90vh] overflow-hidden px-4 pb-24 pt-16 md:px-10 lg:px-14">
      <div className="skills-game-ambient pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(196,90,255,0.18),transparent_42%),radial-gradient(circle_at_52%_80%,rgba(45,255,177,0.16),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.12)_0.55px,transparent_0.8px)] [background-size:18px_18px] opacity-35" />

      <motion.div className="mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-[0.28em] text-neon/85">Core Systems Defense</p>
        <h2 className="mt-3 max-w-4xl font-display text-3xl text-white md:text-5xl">
          Defend the network. Activate skills. Keep the system online.
        </h2>
      </motion.div>

      <div className="skills-game-shell rounded-[2rem] border border-white/15 bg-black/35 p-3 backdrop-blur-2xl md:p-4">
        <header className="mb-3 grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-3 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neon/80">Mission HUD</p>
            <p className="mt-1 text-sm text-white/70">
              Wave {currentWave} • {gamePhase === 'running' ? 'Threat detection online' : gamePhase === 'summary' ? 'System compromised' : 'Awaiting initialization'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="font-mono uppercase tracking-[0.14em] text-white/45">Health</p>
              <p className="mt-1 font-display text-2xl text-white">{systemHealth}%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="font-mono uppercase tracking-[0.14em] text-white/45">Stability</p>
              <p className="mt-1 font-display text-2xl text-neon">{gridStability}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="rounded-lg border border-white/20 bg-white/5 p-2 text-white/75 hover:border-white/35"
              aria-label="toggle sound"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setGamePaused(!gamePaused)}
              disabled={!gameStarted || gamePhase !== 'running'}
              className="rounded-lg border border-white/20 bg-white/5 p-2 text-white/75 hover:border-white/35 disabled:opacity-40"
              aria-label="pause or resume"
            >
              {gamePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                resetGame()
                startGame()
              }}
              className="rounded-lg border border-white/20 bg-white/5 p-2 text-white/75 hover:border-white/35"
              aria-label="reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid gap-3 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          <aside className="rounded-2xl border border-white/10 bg-black/35 p-3 xl:p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Project Reactors</p>
            <p className="mt-2 text-sm text-white/60">Hover to energize, click to supercharge connected skills.</p>
            <div className="mt-4 space-y-3">
              {powerGridProjects.map((project) => {
                const focused = activeProjectId === project.id
                const boosted = projectBoost.projectId === project.id && Date.now() < projectBoost.until
                return (
                  <button
                    key={project.id}
                    type="button"
                    onMouseEnter={() => setActiveProjectId(project.id)}
                    onMouseLeave={() => setActiveProjectId(null)}
                    onClick={() => activateProjectBoost(project.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${focused ? 'border-white/35 bg-white/12' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-lg text-white">{project.name}</p>
                      {boosted ? <Zap className="h-4 w-4 text-neon" /> : <span className="font-mono text-xs text-white/60">{project.powerOutput}%</span>}
                    </div>
                    <p className="mt-1 text-xs text-white/65">{project.description}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: project.color }}
                        animate={{ width: `${project.powerOutput}%` }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              <p className="font-mono uppercase tracking-[0.15em] text-neon/80">Quick Play</p>
              <p className="mt-1">1. Click skill nodes to deploy defenses.</p>
              <p>2. Hover/click projects for chain boosts.</p>
              <p>3. Survive waves to unlock more skills.</p>
            </div>
          </aside>

          <div className="rounded-2xl border border-white/10 bg-[#041023]/80 p-2 md:p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Game Arena</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Threats: {displayThreats.length}</p>
            </div>

            <div
              ref={arenaRef}
              className="relative h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#020916] md:h-[640px] xl:h-[700px]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_60%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

              {powerGridSkills.map((skill, index) => {
                const point = nodePoints.get(skill.id)
                if (!point) return null
                const unlocked = unlockedSkillIds.includes(skill.id)
                const energy = energyBySkill[skill.id] ?? 0
                const integrity = nodeIntegrity[skill.id] ?? 100
                const cooldown = cooldowns[skill.id] ?? 0
                const active = activeSkillSet.has(skill.id)
                const isSelected = selectedSkillId === skill.id
                const dimmed = (activeProjectId || hoveredSkillId) && !active
                const baseScale = unlocked ? 0.82 + skill.strength / 260 : 0.7

                return (
                  <motion.button
                    key={skill.id}
                    type="button"
                    onMouseEnter={() => setHoveredSkillId(skill.id)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                    onClick={() => activateSkill(skill.id)}
                    disabled={!unlocked || gamePhase !== 'running'}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-2.5 py-1.5 text-center backdrop-blur-md transition md:px-3 md:py-2 ${isSelected ? 'border-white/70 bg-white/18' : 'border-white/20 bg-black/45'} ${dimmed ? 'opacity-30' : unlocked ? 'opacity-100' : 'opacity-35'} disabled:cursor-not-allowed`}
                    style={{ left: `${skill.x}%`, top: `${skill.y}%` }}
                    animate={{
                      scale: [baseScale, baseScale + Math.min(0.18, energy * 0.24), baseScale],
                      y: [0, Math.sin(ambientPhase + index * 0.56) * 3, 0],
                      boxShadow: [
                        `0 0 10px ${categoryGlow[skill.category].replace('0.88', `${0.1 + energy * 0.15}`)}`,
                        `0 0 ${18 + energy * 42}px ${categoryGlow[skill.category].replace('0.88', `${0.18 + energy * 0.32}`)}`,
                        `0 0 10px ${categoryGlow[skill.category].replace('0.88', `${0.1 + energy * 0.15}`)}`,
                      ],
                    }}
                    transition={{ duration: 2.2 + index * 0.06, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: baseScale + 0.14 }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/55">{skill.category}</p>
                    <p className="font-display text-[15px] leading-tight text-white md:text-lg">{skill.name}</p>
                    <p className="font-mono text-[10px] text-neon/90 md:text-[11px]">{Math.round(integrity)}%</p>
                    {cooldown > 0 ? (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-white/45" style={{ width: `${clamp((cooldown / 3000) * 100, 3, 100)}%` }} />
                      </div>
                    ) : null}
                  </motion.button>
                )
              })}

              {displayThreats.map((threat) => (
                <motion.div
                  key={threat.id}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: threat.x, top: threat.y }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                >
                  <div
                    className="rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em]"
                    style={{
                      borderColor: `hsla(${threat.type.hue}, 94%, 62%, 0.65)`,
                      color: `hsla(${threat.type.hue}, 96%, 72%, 0.95)`,
                      backgroundColor: `hsla(${threat.type.hue}, 95%, 18%, 0.45)`,
                      boxShadow: `0 0 16px hsla(${threat.type.hue}, 94%, 58%, 0.35)`,
                    }}
                  >
                    {threat.type.name}
                  </div>
                </motion.div>
              ))}

              {displayBursts.map((burst) => {
                const opacity = clamp(burst.ttl / 1500, 0, 1)
                return (
                  <motion.div
                    key={burst.id}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/45"
                    style={{
                      left: burst.x,
                      top: burst.y,
                      width: burst.radius * 2,
                      height: burst.radius * 2,
                      opacity,
                    }}
                    animate={{ scale: [0.82, 1.03, 1.08], opacity: [opacity, opacity * 0.7, 0] }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                )
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neon/80">Skill Inspector</p>
            <h3 className="mt-3 font-display text-3xl text-white">{focusedSkill.name}</h3>
            <p className={`mt-1 text-xs uppercase tracking-[0.16em] ${categoryClass[focusedSkill.category]}`}>
              {focusedSkill.category} module
            </p>
            <p className="mt-3 text-sm text-white/72">{focusedSkill.description}</p>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Role In Defense</p>
              <p className="mt-2 text-sm text-white">{gameplayRole[focusedSkill.id]?.role ?? 'Adaptive network module'}</p>
              <p className="mt-2 text-xs text-white/70">{gameplayRole[focusedSkill.id]?.effect ?? 'Stabilizes connected graph paths.'}</p>
              <p className="mt-1 text-xs text-white/55">{gameplayRole[focusedSkill.id]?.why ?? 'Improves overall resilience and recoverability.'}</p>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Linked Projects</p>
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
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Influence</p>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, index) => {
                  const active = index < Math.round((focusedSkill.strength / 100) * 16)
                  return (
                    <div
                      key={`${focusedSkill.id}-mini-${index}`}
                      className={`h-6 rounded border ${active ? 'border-neon/60 bg-neon/20' : 'border-white/10 bg-white/5'}`}
                    />
                  )
                })}
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-black/50 p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Score</p>
            <p className="mt-1 font-display text-2xl text-neon">{score}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Combo</p>
            <p className="mt-1 font-display text-2xl text-arc">x{combo}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Threats Contained</p>
            <p className="mt-1 font-display text-2xl text-plasma">{threatsContained}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Energy Output</p>
            <p className="mt-1 font-display text-2xl text-cyan-300">{Math.round(Object.values(energyBySkill).reduce((sum, v) => sum + v, 0) * 8)}%</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Defense Efficiency</p>
            <p className="mt-1 font-display text-2xl text-emerald-300">{defenseEfficiency}%</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Active Skills</p>
            <p className="mt-1 font-display text-2xl text-violet-300">{activeSkillSet.size}/{powerGridSkills.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Strongest Node</p>
            <p className="mt-1 font-display text-base text-yellow-200">{strongestSkill?.name ?? 'N/A'}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Top Reactor</p>
            <p className="mt-1 font-display text-base text-white">{topProject.name}</p>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {gamePhase === 'intro' ? (
          <motion.div
            className="fixed inset-0 z-[92] flex items-center justify-center bg-[#030812]/90 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[min(680px,95vw)] rounded-3xl border border-white/20 bg-black/65 p-8 text-center backdrop-blur-2xl"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-neon/85">Initializing Grid</p>
              <h3 className="mt-3 font-display text-4xl text-white">Core Systems Defense</h3>
              <p className="mt-4 text-white/70">
                Threat signatures are entering the network. Activate skills, route energy, and keep system health above zero.
              </p>
              <div className="mx-auto mt-5 w-[min(420px,80vw)] space-y-2 text-left text-xs text-white/65">
                <p>• Click skill nodes to deploy stabilization bursts.</p>
                <p>• Hover/click project reactors to supercharge clusters.</p>
                <p>• Survive waves to unlock advanced skill modules.</p>
              </div>
              <div className="mt-7 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={startGame}
                  className="rounded-xl border border-neon/50 bg-neon/12 px-5 py-2 text-xs uppercase tracking-[0.18em] text-neon hover:bg-neon/20"
                >
                  Start Defense
                </button>
                <button
                  type="button"
                  onClick={startGame}
                  className="rounded-xl border border-white/25 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.18em] text-white/75 hover:bg-white/10"
                >
                  Skip Intro
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {gamePhase === 'summary' ? (
          <motion.div
            className="fixed inset-0 z-[93] flex items-center justify-center bg-black/78 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[min(720px,95vw)] rounded-3xl border border-white/20 bg-[#070f1e]/92 p-8"
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-neon/85">Run Summary</p>
              <h3 className="mt-3 font-display text-4xl text-white">System Recovery Report</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/45">Final Score</p>
                  <p className="mt-2 font-display text-4xl text-neon">{score}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/45">Threats Contained</p>
                  <p className="mt-2 font-display text-4xl text-arc">{threatsContained}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/45">Highest Wave</p>
                  <p className="mt-2 font-display text-4xl text-plasma">{currentWave}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/45">High Score</p>
                  <p className="mt-2 font-display text-4xl text-emerald-300">{Math.max(highScore, score)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="flex items-center gap-2 text-white"><ShieldAlert className="h-4 w-4 text-neon" /> Strongest skill cluster: {strongestSkill?.name ?? 'N/A'}</p>
                <p className="mt-2 flex items-center gap-2"><Bug className="h-4 w-4 text-amber-300" /> Top contributing reactor: {topProject.name}</p>
                <p className="mt-2">System reached {gridStability}% stability before collapse. Replay to unlock full-grid mastery.</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={startGame} className="rounded-xl border border-neon/50 bg-neon/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-neon hover:bg-neon/20">Replay Defense</button>
                <button type="button" onClick={() => setGamePhase('running')} className="rounded-xl border border-white/25 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/75 hover:bg-white/10">Continue Arena</button>
                <button type="button" onClick={() => setGamePhase('intro')} className="rounded-xl border border-white/25 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/75 hover:bg-white/10">Return To Intro</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
