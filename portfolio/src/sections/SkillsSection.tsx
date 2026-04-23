import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { powerGridConnections, powerGridProjects, powerGridSkills } from '../data/siteData'
import type { PowerGridSkill } from '../types'

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

type Scene = 'breach' | 'diagnosis' | 'activation' | 'recovery' | 'online'
type NodeState = 'offline' | 'scanning' | 'activating' | 'online' | 'selected' | 'connected'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; alpha: number; color: string
  life: number; lifeSpeed: number
}

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const SCENE_SEQUENCE: Scene[] = ['breach', 'diagnosis', 'activation', 'recovery', 'online']

const SCENE_DURATIONS: Record<Scene, number> = {
  breach: 3200, diagnosis: 4000, activation: 6800, recovery: 4200, online: Infinity,
}

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'javascript':    { x: 12,  y: 30 },
  'typescript':    { x: 48,  y: 17 },
  'python':        { x: 86,  y: 26 },
  'react':         { x: 20,  y: 44 },
  'system-design': { x: 50,  y: 46 },
  'data-modeling': { x: 80,  y: 44 },
  'websockets':    { x: 12,  y: 68 },
  'apis':          { x: 37,  y: 64 },
  'databases':     { x: 63,  y: 64 },
  'ux-design':     { x: 87,  y: 68 },
  'devops':        { x: 28,  y: 74 },
  'testing':       { x: 72,  y: 74 },
}

const CATEGORY_COLORS: Record<string, { hex: string; rgb: string; dim: string }> = {
  frontend: { hex: '#58F6D2', rgb: '88,246,210',  dim: '#1a4a42' },
  backend:  { hex: '#10D981', rgb: '16,217,129',  dim: '#0d3a28' },
  system:   { hex: '#A78BFA', rgb: '167,139,250', dim: '#2d1e5a' },
  platform: { hex: '#FCD34D', rgb: '252,211,77',  dim: '#4a3c0d' },
  data:     { hex: '#6AA6FF', rgb: '106,166,255', dim: '#1a2e4a' },
  quality:  { hex: '#FB923C', rgb: '251,146,60',  dim: '#4a2210' },
}

const SCENE_HEADLINE: Record<Scene, string> = {
  breach:     'System Breach\nDetected.',
  diagnosis:  'Tracing Failure\nPoints.',
  activation: 'Restoring the\nSystems.',
  recovery:   'Architecture\nStabilizing.',
  online:     'System\nOnline.',
}

const SCENE_SUBLINE: Record<Scene, string> = {
  breach:     'Core services destabilizing. Routing integrity compromised.',
  diagnosis:  'Analyzing service degradation across the full stack.',
  activation: 'Initializing core capability modules. Stand by.',
  recovery:   'Critical flows restored. Throughput recovered.',
  online:     'All critical services operational.',
}

const SCENE_STATUS: Record<Scene, string> = {
  breach: 'CRITICAL', diagnosis: 'SCANNING', activation: 'INITIALIZING',
  recovery: 'RECOVERING', online: 'OPERATIONAL',
}

const SCENE_STATUS_COLOR: Record<Scene, string> = {
  breach: '#FF3333', diagnosis: '#FFAA00', activation: '#58F6D2',
  recovery: '#6AA6FF', online: '#58F6D2',
}

const SCENE_BG: Record<Scene, string> = {
  breach:     'radial-gradient(ellipse 80% 70% at 50% 50%,#160404 0%,#0c0101 45%,#070A13 100%)',
  diagnosis:  'radial-gradient(ellipse 80% 70% at 50% 50%,#110a00 0%,#080500 45%,#070A13 100%)',
  activation: 'radial-gradient(ellipse 80% 70% at 50% 50%,#020e09 0%,#010905 45%,#070A13 100%)',
  recovery:   'radial-gradient(ellipse 80% 70% at 50% 50%,#010d16 0%,#010810 45%,#070A13 100%)',
  online:     'radial-gradient(ellipse 80% 70% at 50% 50%,#020e12 0%,#010a0e 45%,#070A13 100%)',
}

const SCENE_PARTICLE_COLORS: Record<Scene, string[]> = {
  breach:     ['#FF3333','#FF6B35','#FF4444','#CC2200'],
  diagnosis:  ['#FFAA00','#FFD700','#FF9900','#FFCC44'],
  activation: ['#58F6D2','#6AA6FF','#A78BFA','#10D981'],
  recovery:   ['#58F6D2','#6AA6FF','#22d3ee','#4ade80'],
  online:     ['#58F6D2','#6AA6FF','#a5f3fc','#bfdbfe'],
}

const ACTIVATION_ORDER = [
  'system-design','react','typescript','javascript','python',
  'apis','databases','data-modeling','websockets','devops','testing','ux-design',
]

const ACTIVATION_MESSAGES: Record<string, string> = {
  'system-design':  'ARCHITECTURE CORE ONLINE',
  'react':          'UI ENGINE RESTORED',
  'typescript':     'TYPE SAFETY LAYER ACTIVE',
  'javascript':     'RUNTIME CORE INITIALIZED',
  'python':         'SIMULATION ENGINE LOADED',
  'apis':           'SERVICE CONTRACTS RESTORED',
  'databases':      'PERSISTENCE LAYER ONLINE',
  'data-modeling':  'DATA DOMAIN RECONSTRUCTED',
  'websockets':     'LIVE SYNC PATHWAYS OPEN',
  'devops':         'DEPLOYMENT PIPELINE ACTIVE',
  'testing':        'VALIDATION FRAMEWORK ONLINE',
  'ux-design':      'INTERFACE INTEGRITY RESTORED',
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

interface Props { reducedMotion?: boolean }

export default function SkillsSection({ reducedMotion = false }: Props) {
  const [scene, setScene]                     = useState<Scene>('breach')
  const [activatedSkills, setActivatedSkills] = useState<Set<string>>(new Set())
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [lastActivated, setLastActivated]     = useState<string | null>(null)
  const [isVisible, setIsVisible]             = useState(false)
  const [sequenceIndex, setSequenceIndex]     = useState(0)
  const [revealedSkills, setRevealedSkills]     = useState<Set<string>>(new Set())

  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number>(0)
  const sceneRef   = useRef<Scene>('breach')

  useEffect(() => { sceneRef.current = scene }, [scene])

  // entrance fade-in
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // scene auto-advance
  useEffect(() => {
    if (reducedMotion) {
      setScene('online')
      setActivatedSkills(new Set(powerGridSkills.map(s => s.id)))
      return
    }
    const timers: number[] = []
    let elapsed = 0
    for (const s of SCENE_SEQUENCE) {
      if (SCENE_DURATIONS[s] === Infinity) break
      elapsed += SCENE_DURATIONS[s]
      const next = SCENE_SEQUENCE[SCENE_SEQUENCE.indexOf(s) + 1]
      if (next) timers.push(window.setTimeout(() => setScene(next), elapsed))
    }
    return () => timers.forEach(clearTimeout)
  }, [reducedMotion])

  // stagger activation in scene 3
  useEffect(() => {
    if (scene !== 'activation') return
    const timers: number[] = []
    ACTIVATION_ORDER.forEach((id, i) => {
      timers.push(window.setTimeout(() => {
        setActivatedSkills(prev => new Set([...prev, id]))
        setLastActivated(id)
      }, i * 480))
    })
    return () => timers.forEach(clearTimeout)
  }, [scene])

  // all online in recovery / online
  useEffect(() => {
    if (scene === 'recovery' || scene === 'online') {
      setActivatedSkills(new Set(powerGridSkills.map(s => s.id)))
    }
  }, [scene])

  // canvas particles + ambient
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const count = reducedMotion ? 28 : 90
    const particles: Particle[] = Array.from({ length: count }, () => {
      const cols = SCENE_PARTICLE_COLORS.breach
      return {
        x: Math.random() * window.innerWidth,  y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,       vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.4 + 0.3,        alpha: Math.random() * 0.35 + 0.05,
        color: cols[Math.floor(Math.random() * cols.length)],
        life: Math.random(),                     lifeSpeed: 0.0025 + Math.random() * 0.004,
      }
    })

    let scanPhase = 0

    function tick() {
      const W = canvas!.width
      const H = canvas!.height
      const cur = sceneRef.current
      const newCols = SCENE_PARTICLE_COLORS[cur]
      ctx.clearRect(0, 0, W, H)

      if (cur === 'breach') {
        const vig = ctx.createRadialGradient(W/2,H/2,H*0.18,W/2,H/2,H*0.9)
        vig.addColorStop(0,'transparent')
        vig.addColorStop(1,'rgba(100,0,0,0.28)')
        ctx.fillStyle = vig; ctx.fillRect(0,0,W,H)
      } else if (cur === 'diagnosis') {
        scanPhase += 0.006
        const by = ((Math.sin(scanPhase)+1)/2)*H
        const bm = ctx.createLinearGradient(0,by-35,0,by+35)
        bm.addColorStop(0,'transparent')
        bm.addColorStop(0.5,'rgba(255,170,0,0.065)')
        bm.addColorStop(1,'transparent')
        ctx.fillStyle = bm; ctx.fillRect(0,by-35,W,70)
      } else if (cur === 'recovery' || cur === 'online') {
        const bl = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,H*0.6)
        bl.addColorStop(0,'rgba(88,246,210,0.025)')
        bl.addColorStop(1,'transparent')
        ctx.fillStyle = bl; ctx.fillRect(0,0,W,H)
      }

      if (cur !== 'breach') {
        ctx.globalAlpha = cur === 'online' ? 0.05 : 0.03
        ctx.fillStyle = '#58F6D2'
        for (let gx=0; gx<W; gx+=90) for (let gy=0; gy<H; gy+=90) {
          ctx.beginPath(); ctx.arc(gx,gy,0.7,0,Math.PI*2); ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      for (const p of particles) {
        p.life += p.lifeSpeed
        if (p.life > 1) {
          p.life = 0; p.x = Math.random()*W; p.y = Math.random()*H
          p.color = newCols[Math.floor(Math.random()*newCols.length)]
          p.vx = (Math.random()-0.5)*0.5; p.vy = (Math.random()-0.5)*0.5
        }
        p.x += p.vx; p.y += p.vy
        if (p.x < -5) p.x = W+5; if (p.x > W+5) p.x = -5
        if (p.y < -5) p.y = H+5; if (p.y > H+5) p.y = -5
        const la = p.life<0.15 ? p.life/0.15 : p.life>0.82 ? (1-p.life)/0.18 : 1
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha*la
        ctx.fill(); ctx.globalAlpha = 1
      }

      if (cur === 'breach' && Math.random()>0.96) {
        ctx.fillStyle = `rgba(255,${Math.floor(Math.random()*60)},0,${Math.random()*0.12})`
        ctx.fillRect(0,Math.random()*H,W,Math.random()*4+1)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize) }
  }, [reducedMotion])

  const skillMap = useMemo(
    () => Object.fromEntries(powerGridSkills.map(s => [s.id,s])) as Record<string,PowerGridSkill>, []
  )
  const sequenceTargetId = sequenceIndex < ACTIVATION_ORDER.length ? ACTIVATION_ORDER[sequenceIndex] : null
  const isSequenceComplete = sequenceIndex >= ACTIVATION_ORDER.length
  const sequenceTargetSkill = sequenceTargetId ? skillMap[sequenceTargetId] : null
  const selectedSkill = selectedSkillId ? skillMap[selectedSkillId] : null

  useEffect(() => {
    if (scene !== 'online') return
    setSequenceIndex(0)
    setRevealedSkills(new Set())
    setSelectedSkillId(null)
  }, [scene])

  const getNodeState = useCallback((id: string): NodeState => {
    // Sequential reveal mode: only revealed nodes + current target are meaningful
    if (scene === 'online' && !isSequenceComplete) {
      if (id === sequenceTargetId) return 'activating'
      if (revealedSkills.has(id)) {
        if (selectedSkillId === id) return 'selected'
        if (selectedSkillId) {
          const sel = skillMap[selectedSkillId]
          if (sel && (sel.connections.includes(id) || skillMap[id]?.connections.includes(selectedSkillId)))
            return 'connected'
        }
        return 'online'
      }
      return 'offline'
    }
    if (selectedSkillId === id) return 'selected'
    if (selectedSkillId) {
      const sel = skillMap[selectedSkillId]
      if (sel && (sel.connections.includes(id) || skillMap[id]?.connections.includes(selectedSkillId)))
        return 'connected'
    }
    if (scene === 'online' || scene === 'recovery') return 'online'
    if (scene === 'activation' && activatedSkills.has(id)) return 'online'
    if (scene === 'diagnosis') return 'scanning'
    return 'offline'
  }, [selectedSkillId, scene, sequenceTargetId, isSequenceComplete, revealedSkills, skillMap, activatedSkills])

  const handleClick = useCallback((id: string) => {
    if (scene === 'breach' || scene === 'diagnosis') return

    // Sequential reveal mode: only the pulsing target is clickable
    if (scene === 'online' && !isSequenceComplete && sequenceTargetId) {
      if (id !== sequenceTargetId) return  // ignore wrong node clicks
      setRevealedSkills(prev => new Set([...prev, id]))
      setSelectedSkillId(id)
      setLastActivated(id)
      setSequenceIndex(prev => prev + 1)
      return
    }

    // Free-inspect mode after sequence is done
    setSelectedSkillId(prev => prev === id ? null : id)
  }, [scene, isSequenceComplete, sequenceTargetId])

  const canInteract = scene !== 'breach' && scene !== 'diagnosis'

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden"
      style={{ background: SCENE_BG[scene] }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Scan-line overlay */}
      <AnimatePresence>
        {(scene === 'breach' || scene === 'diagnosis') && (
          <motion.div
            key="scanlines"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: scene === 'breach' ? 0.75 : 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* Edge vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%,transparent 38%,rgba(7,10,19,0.72) 100%)' }}
      />

      <SVGConnectionLayer
        connections={powerGridConnections}
        activatedSkills={scene === 'online' && !isSequenceComplete ? revealedSkills : activatedSkills}
        selectedSkillId={selectedSkillId}
        skillMap={skillMap}
        scene={scene}
      />

      {powerGridSkills.map(skill => {
        const nodeVisible =
          scene !== 'online' ||
          isSequenceComplete ||
          revealedSkills.has(skill.id) ||
          skill.id === sequenceTargetId
        return (
          <SkillNode
            key={skill.id}
            skill={skill}
            state={getNodeState(skill.id)}
            visible={nodeVisible}
            canInteract={canInteract}
            onClick={handleClick}
          />
        )
      })}

      <AnimatePresence mode="wait">
        <SceneTextBlock
          key={scene}
          scene={scene}
          isSequenceMode={scene === 'online' && !isSequenceComplete}
          sequenceTargetName={sequenceTargetSkill?.name ?? null}
        />
      </AnimatePresence>

      <AnimatePresence>
        {lastActivated && scene === 'activation' && (
          <ActivationFlash
            key={lastActivated + '-f'}
            message={ACTIVATION_MESSAGES[lastActivated] ?? ''}
          />
        )}
      </AnimatePresence>

      <HUDLayer scene={scene} activatedCount={activatedSkills.size} />

      <AnimatePresence>
        {scene === 'online' && (
          <SequenceGuideHUD
            isComplete={isSequenceComplete}
            current={Math.min(sequenceIndex + 1, ACTIVATION_ORDER.length)}
            total={ACTIVATION_ORDER.length}
            nextLabel={sequenceTargetSkill?.name ?? null}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSkill && (
          <SkillInspector
            key={selectedSkill.id}
            skill={selectedSkill}
            skillMap={skillMap}
            onClose={() => setSelectedSkillId(null)}
            onNavigate={setSelectedSkillId}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// SVG CONNECTION LAYER
// ---------------------------------------------------------------------------

interface SVGLayerProps {
  connections: { sourceSkillId: string; targetSkillId: string; weight: number; type: string }[]
  activatedSkills: Set<string>
  selectedSkillId: string | null
  skillMap: Record<string, PowerGridSkill>
  scene: Scene
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const SVGConnectionLayer = memo(function SVGConnectionLayer({
  connections, activatedSkills, selectedSkillId, skillMap, scene,
}: SVGLayerProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="conn-glow">
          <feGaussianBlur stdDeviation="0.35" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {connections.map(conn => {
        const src = skillMap[conn.sourceSkillId]
        const tgt = skillMap[conn.targetSkillId]
        if (!src || !tgt) return null
        const p1 = NODE_POSITIONS[src.id]
        const p2 = NODE_POSITIONS[tgt.id]
        if (!p1 || !p2) return null

        const { x: x1, y: y1 } = p1
        const { x: x2, y: y2 } = p2
        const mx = (x1+x2)/2
        const my = (y1+y2)/2
        const cpx = mx + (y2-y1)*0.09
        const cpy = my - (x2-x1)*0.09
        const d = `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`

        const srcOn = activatedSkills.has(src.id)
        const tgtOn = activatedSkills.has(tgt.id)
        const bothOn = srcOn && tgtOn
        const isLinked = selectedSkillId === src.id || selectedSkillId === tgt.id

        let opacity = 0
        if (scene === 'breach')      opacity = 0.07
        else if (scene === 'diagnosis') opacity = 0.15
        else if (scene === 'activation') opacity = (srcOn || tgtOn) ? 0.32 : 0.09
        else if (scene === 'recovery')   opacity = bothOn ? 0.48 : 0.16
        else                            opacity = bothOn ? 0.58 : 0.18

        if (isLinked) opacity = Math.max(opacity, 0.78)

        const col = isLinked ? '#58F6D2'
          : bothOn ? (CATEGORY_COLORS[src.category]?.hex ?? '#58F6D2')
          : '#6AA6FF'

        const lw = conn.type === 'strong' ? 0.28 : conn.type === 'weak' ? 0.14 : 0.1

        return (
          <g key={`${conn.sourceSkillId}-${conn.targetSkillId}`}>
            <path d={d} stroke={scene==='breach'?'#550000':'#6AA6FF'} strokeWidth={lw*0.6} fill="none" opacity={scene==='breach'?0.2:0.06} />
            <motion.path
              d={d} stroke={col} strokeWidth={lw} fill="none"
              filter={isLinked?'url(#conn-glow)':undefined}
              animate={{ opacity }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {bothOn && !prefersReducedMotion() && (
              <motion.path
                d={d} stroke={col} strokeWidth={lw*1.9} fill="none"
                strokeDasharray="2.5 97.5"
                animate={{ strokeDashoffset: [100,-100] }}
                transition={{ duration: 2.5+Math.random()*1.5, repeat: Infinity, ease: 'linear', delay: Math.random()*2 }}
                opacity={0.7}
              />
            )}
            {isLinked && (
              <motion.path
                d={d} stroke="#58F6D2" strokeWidth={lw*2.8} fill="none"
                strokeDasharray="3 97"
                animate={{ strokeDashoffset: [100,-100] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                opacity={0.85}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
})

// ---------------------------------------------------------------------------
// SKILL NODE
// ---------------------------------------------------------------------------

interface NodeProps {
  skill: PowerGridSkill
  state: NodeState
  visible: boolean
  canInteract: boolean
  onClick: (id: string) => void
}

const SkillNode = memo(function SkillNode({ skill, state, visible, canInteract, onClick }: NodeProps) {
  const pos = NODE_POSITIONS[skill.id]
  if (!pos) return null

  const C = CATEGORY_COLORS[skill.category] ?? CATEGORY_COLORS.frontend
  const isOnline   = state === 'online' || state === 'selected' || state === 'connected' || state === 'activating'
  const isSelected = state === 'selected'
  const isConnected = state === 'connected'
  const isActivating = state === 'activating'
  const isScanning = state === 'scanning'
  const isOffline  = state === 'offline'

  const ringColor = isSelected ? '#58F6D2' : isActivating ? '#58F6D2' : isConnected ? C.hex : isOnline ? C.hex : isScanning ? '#FFAA00' : '#440000'
  const glowPx    = isSelected ? 28 : isActivating ? 24 : isConnected ? 20 : isOnline ? 16 : isScanning ? 10 : 4
  const nodeSize  = isSelected ? 38 : isActivating ? 36 : 32

  return (
    <motion.button
      className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onClick={() => onClick(skill.id)}
      disabled={!canInteract || !visible}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: !visible ? 0 : isOffline ? 0.42 : 1,
        scale: !visible ? 0.1 : 1,
      }}
      transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={canInteract && visible ? { scale: 1.14 } : undefined}
      aria-label={`${skill.name} — ${skill.strength}% mastery`}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: nodeSize+glowPx*2+8, height: nodeSize+glowPx*2+8, background: `radial-gradient(circle,${ringColor}${isSelected?'1e':'12'} 0%,transparent 70%)` }}
        animate={{ opacity: isActivating ? [0.7,1,0.7] : isOnline ? [0.5,1,0.5] : isScanning ? [0.25,0.7,0.25] : 0.35, scale: isSelected || isActivating ? [1,1.09,1] : 1 }}
        transition={isActivating ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : isOnline ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : isScanning ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : {}}
      />

      {isActivating && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/70"
          style={{ width: nodeSize+22, height: nodeSize+22 }}
          animate={{ scale: [0.92, 1.16], opacity: [0.9, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Scanning ring */}
      {isScanning && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/60"
          style={{ width: nodeSize+16, height: nodeSize+16 }}
          animate={{ rotate: 360, opacity:[0.35,0.9,0.35] }}
          transition={{ rotate:{duration:2,repeat:Infinity,ease:'linear'}, opacity:{duration:1,repeat:Infinity} }}
        />
      )}

      {/* Body */}
      <div
        className="relative flex items-center justify-center rounded-full border-2"
        style={{
          width: nodeSize, height: nodeSize,
          borderColor: ringColor,
          background: isOffline ? 'rgba(7,10,19,0.9)' : isScanning ? 'rgba(40,28,0,0.92)' : `rgba(${C.rgb},0.11)`,
          boxShadow: isSelected
            ? `0 0 28px rgba(88,246,210,0.65),inset 0 0 10px rgba(88,246,210,0.18)`
            : isOnline
              ? `0 0 ${glowPx}px rgba(${C.rgb},0.5),inset 0 0 6px rgba(${C.rgb},0.1)`
              : 'none',
        }}
      >
        {/* Strength arc */}
        <svg className="absolute inset-0" viewBox="0 0 36 36" fill="none" style={{ width: nodeSize, height: nodeSize }}>
          <circle
            cx="18" cy="18" r="13.5"
            stroke={ringColor} strokeWidth="1.1"
            strokeOpacity={isOffline ? 0.18 : 0.45}
            fill="none"
            strokeDasharray={`${(skill.strength/100)*84.8} 84.8`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className="relative font-mono text-[8px] font-bold leading-none" style={{ color: isOffline ? '#553333' : ringColor }}>
          {skill.strength}
        </span>
      </div>

      {/* Label */}
      <div className="mt-1.5 text-center">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.18em]"
          style={{
            color: isSelected ? '#58F6D2' : isOnline ? C.hex : isScanning ? '#FFAA00' : '#553333',
            textShadow: isOnline ? `0 0 8px rgba(${C.rgb},0.55)` : 'none',
          }}
        >
          {skill.name}
        </span>
      </div>
    </motion.button>
  )
})

// ---------------------------------------------------------------------------
// SCENE TEXT
// ---------------------------------------------------------------------------

function SceneTextBlock({
  scene,
  isSequenceMode,
  sequenceTargetName,
}: {
  scene: Scene
  isSequenceMode: boolean
  sequenceTargetName: string | null
}) {
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    if (scene !== 'online') { setFaded(false); return }
    const t = setTimeout(() => setFaded(true), 3500)
    return () => clearTimeout(t)
  }, [scene])
  const lines = SCENE_HEADLINE[scene].split('\n')
  const headColor: Record<Scene, string> = {
    breach: '#FF4444', diagnosis: '#FFB300', activation: '#58F6D2',
    recovery: '#6AA6FF', online: '#ffffff',
  }

  return (
    <motion.div
      className="pointer-events-none absolute left-[4.5%] top-[8%]"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: faded ? 0 : 1, x: faded ? -20 : 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: faded ? 0.9 : 0.65, ease: 'easeOut' }}
    >
      <div className="absolute inset-x-[-14px] inset-y-[-12px] -z-10 rounded-lg border border-white/10 bg-black/35 backdrop-blur-sm" />

      {/* Status badge */}
      <motion.div className="mb-3 flex items-center gap-2" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}>
        <motion.div
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: SCENE_STATUS_COLOR[scene] }}
          animate={{ opacity:[1,0.3,1] }}
          transition={{ duration:0.8, repeat:Infinity }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: SCENE_STATUS_COLOR[scene] }}>
          {SCENE_STATUS[scene]}
        </span>
      </motion.div>

      {/* Headline */}
      <div className="mb-4 overflow-hidden">
        {lines.map((line,i) => (
          <motion.h2
            key={line}
            className="block font-display font-black leading-[0.94] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(2.2rem,4.2vw,5rem)',
              color: headColor[scene],
              textShadow: scene==='breach' ? '0 0 40px rgba(255,40,40,0.4)' : scene==='online' ? '0 0 40px rgba(88,246,210,0.3)' : `0 0 28px ${headColor[scene]}2e`,
            }}
            initial={{ opacity:0, y:28 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.1+i*0.13, duration:0.65, ease:[0.16,1,0.3,1] }}
          >
            {line}
          </motion.h2>
        ))}
      </div>

      {/* Subline */}
      <motion.p
        className="font-sans leading-relaxed text-white/42"
        style={{ maxWidth:'26ch', fontSize:'clamp(0.68rem,1.05vw,0.87rem)' }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
      >
        {SCENE_SUBLINE[scene]}
      </motion.p>

      {scene === 'online' && !isSequenceMode && (
        <motion.p
          className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }}
        >
          Click any node to inspect
        </motion.p>
      )}

      {scene === 'online' && isSequenceMode && sequenceTargetName && (
        <motion.p
          className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-neon/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          Target module: {sequenceTargetName}
        </motion.p>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ACTIVATION FLASH
// ---------------------------------------------------------------------------

function ActivationFlash({ message }: { message: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[14%] right-[4%] text-right"
      initial={{ opacity:0, x:20 }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:10 }}
      transition={{ duration:0.3 }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color:'#58F6D2' }}>
        &#9658; {message}
      </span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------

function HUDLayer({ scene, activatedCount }: { scene: Scene; activatedCount: number }) {
  const statusColor = SCENE_STATUS_COLOR[scene]
  const total = powerGridSkills.length

  return (
    <>
      {/* Top-right system stats */}
      <div className="pointer-events-none absolute right-5 top-5 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2 rounded border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-sm">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">Modules</span>
          <span className="font-mono text-[11px] font-bold" style={{ color: statusColor }}>
            {activatedCount}/{total}
          </span>
        </div>
        {scene !== 'breach' && (
          <motion.div
            className="flex items-center gap-2 rounded border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Scene</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: statusColor }}>{scene}</span>
          </motion.div>
        )}
      </div>

      {/* Bottom-left progress dots */}
      <div className="pointer-events-none absolute bottom-[12%] left-5 flex gap-2">
        {SCENE_SEQUENCE.map(s => (
          <motion.div
            key={s}
            className="h-[3px] rounded-full"
            style={{ background: s===scene ? statusColor : 'rgba(255,255,255,0.12)', width: s===scene ? 24 : 8 }}
            animate={{ opacity: s===scene ? 1 : 0.45 }}
            transition={{ duration:0.4 }}
          />
        ))}
      </div>

      {/* Breach warning bar */}
      {scene === 'breach' && (
        <motion.div
          className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
          style={{ background:'linear-gradient(90deg,transparent,#FF3333 30%,#FF3333 70%,transparent)' }}
          animate={{ opacity:[0.4,1,0.4] }}
          transition={{ duration:0.55, repeat:Infinity }}
        />
      )}
    </>
  )
}

function SequenceGuideHUD({
  isComplete,
  current,
  total,
  nextLabel,
}: {
  isComplete: boolean
  current: number
  total: number
  nextLabel: string | null
}) {
  const revealed = current - 1
  const label = isComplete
    ? 'All modules synced — free explore mode'
    : revealed === 0
      ? `Click the pulsing node to begin`
      : `${revealed}/${total} synced — click: ${nextLabel ?? 'module'}`

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-5 z-[5] -translate-x-1/2 rounded-lg border border-neon/30 bg-black/55 px-4 py-2 backdrop-blur-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-neon"
          animate={isComplete ? { opacity: 1 } : { opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.75, repeat: isComplete ? 0 : Infinity }}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neon/85">Guided Sync</span>
        <span className="font-mono text-[10px] text-white/70">{label}</span>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// SKILL INSPECTOR
// ---------------------------------------------------------------------------

interface InspectorProps {
  skill: PowerGridSkill
  skillMap: Record<string, PowerGridSkill>
  onClose: () => void
  onNavigate: (id: string) => void
}

function SkillInspector({ skill, skillMap, onClose, onNavigate }: InspectorProps) {
  const C = CATEGORY_COLORS[skill.category] ?? CATEGORY_COLORS.frontend
  const relatedProjects = powerGridProjects.filter(p => skill.relatedProjects.includes(p.id))

  return (
    <motion.div
      className="absolute right-4 top-1/2 z-10 w-[min(316px,calc(100vw-2rem))] -translate-y-1/2 overflow-hidden rounded-xl border bg-black/72 backdrop-blur-xl"
      style={{ borderColor: `rgba(${C.rgb},0.22)` }}
      initial={{ opacity:0, x:40 }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:40 }}
      transition={{ duration:0.38, ease:[0.16,1,0.3,1] }}
    >
      {/* Header */}
      <div className="relative flex items-start justify-between p-4 pb-3"
        style={{ background: `linear-gradient(135deg,rgba(${C.rgb},0.1) 0%,transparent 100%)` }}>
        <div className="flex-1 pr-3">
          <div className="mb-0.5 flex items-center gap-2">
            <motion.div className="h-2 w-2 rounded-full" style={{ background: C.hex }}
              animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: C.hex }}>
              {skill.category}
            </span>
          </div>
          <h3 className="font-display text-xl font-bold leading-tight text-white">{skill.name}</h3>
        </div>
        <button onClick={onClose} className="shrink-0 rounded p-1 text-white/30 transition hover:text-white/70" aria-label="Close inspector">
          ✕
        </button>
      </div>

      <div className="space-y-4 p-4 pt-0">
        {/* Mastery */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/38">Mastery</span>
            <span className="font-mono text-xs font-bold" style={{ color: C.hex }}>{skill.strength}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg,${C.hex},${C.hex}88)` }}
              initial={{ width:0 }} animate={{ width:`${skill.strength}%` }}
              transition={{ duration:0.7, ease:'easeOut', delay:0.1 }} />
          </div>
        </div>

        {/* Description */}
        <p className="font-sans text-xs leading-relaxed text-white/52">{skill.description}</p>

        {/* Impact metrics */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(skill.impact) as [string,number][]).map(([k,v]) => (
            <div key={k} className="rounded-lg border border-white/6 bg-white/4 px-2.5 py-2">
              <div className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-white/28">{k}</div>
              <div className="font-mono text-xs font-bold" style={{ color: C.hex }}>{v}%</div>
            </div>
          ))}
        </div>

        {/* Connected skills */}
        {skill.connections.length > 0 && (
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/32">Linked Modules</div>
            <div className="flex flex-wrap gap-1.5">
              {skill.connections.map(cId => {
                const cs = skillMap[cId]
                if (!cs) return null
                const cc = CATEGORY_COLORS[cs.category] ?? CATEGORY_COLORS.frontend
                return (
                  <button key={cId} onClick={() => onNavigate(cId)}
                    className="rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] transition hover:opacity-90"
                    style={{ borderColor:`rgba(${cc.rgb},0.28)`, color:cc.hex, background:`rgba(${cc.rgb},0.08)` }}>
                    {cs.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Evidence */}
        {relatedProjects.length > 0 && (
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/32">Evidence</div>
            <div className="space-y-1.5">
              {relatedProjects.map(proj => (
                <div key={proj.id} className="flex items-center gap-2.5 rounded-lg border border-white/7 bg-white/4 px-3 py-2">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: proj.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/78">{proj.name}</div>
                    <div className="font-mono text-[8px] text-white/32">{proj.powerOutput}% utilization</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
