import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

interface Props {
  onMountSkills: () => void
  onComplete: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
}

interface TraceLine {
  x1: number
  y1: number
  x2: number
  y2: number
  progress: number
  alpha: number
  color: string
  speed: number
}

export function SystemBreachTransition({ onMountSkills, onComplete }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext('2d')!

    const W = (canvas.width = window.innerWidth)
    const H = (canvas.height = window.innerHeight)
    const cx = W / 2
    const cy = H / 2

    // ── Particle system ─────────────────────────────────────
    const COLORS = ['#58F6D2', '#6AA6FF', '#A78BFA', '#58F6D2']
    const particles: Particle[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.45 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const traceLines: TraceLine[] = []

    // ── Animation state ─────────────────────────────────────
    let accel = 1
    let showTrace = false
    let lockOnT = 0
    let showLockOn = false
    let pulseR = 0
    let showPulse = false
    let flashA = 0
    let showFlash = false
    let alive = true
    let rafId = 0

    // ── Helpers ──────────────────────────────────────────────
    function hexAlpha(hex: string, a: number): string {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${a})`
    }

    // ── Render loop ──────────────────────────────────────────
    function render() {
      if (!alive) return
      ctx.clearRect(0, 0, W, H)

      // Particles
      for (const p of particles) {
        if (showPulse) {
          const dx = cx - p.x
          const dy = cy - p.y
          const dist = Math.sqrt(dx * dx + dy * dy) + 1
          p.vx += (dx / dist) * 0.08
          p.vy += (dy / dist) * 0.08
        } else if (accel > 2) {
          const dx = cx - p.x
          const dy = cy - p.y
          const dist = Math.sqrt(dx * dx + dy * dy) + 1
          p.vx += (dx / dist) * 0.015 * (accel - 1)
          p.vy += (dy / dist) * 0.015 * (accel - 1)
        }
        p.vx *= 0.97
        p.vy *= 0.97
        p.x += p.vx * accel
        p.y += p.vy * accel

        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = hexAlpha(p.color, p.alpha)
        ctx.fill()
      }

      // Trace lines
      if (showTrace) {
        for (const line of traceLines) {
          if (line.alpha <= 0.01) continue
          line.progress = Math.min(1, line.progress + line.speed)
          const px = line.x1 + (line.x2 - line.x1) * line.progress
          const py = line.y1 + (line.y2 - line.y1) * line.progress
          ctx.beginPath()
          ctx.moveTo(line.x1, line.y1)
          ctx.lineTo(px, py)
          ctx.strokeStyle = hexAlpha(line.color, line.alpha * line.progress)
          ctx.lineWidth = 0.7
          ctx.stroke()
          line.alpha -= 0.006
        }
      }

      // Lock-on rings
      if (showLockOn) {
        lockOnT = Math.min(1, lockOnT + 0.016)
        const t = lockOnT
        for (let i = 0; i < 3; i++) {
          const r = (150 - i * 38) * (1 - t * 0.35)
          if (r <= 0) continue
          const a = t * (1.0 - i * 0.28)

          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(88,246,210,${a * 0.7})`
          ctx.lineWidth = 0.7 + i * 0.1
          ctx.stroke()

          // Rotating dashes (simulate targeting scan)
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(lockOnT * (i % 2 === 0 ? 1.2 : -0.8))
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 0.4)
          ctx.strokeStyle = `rgba(88,246,210,${a})`
          ctx.lineWidth = 1.2
          ctx.stroke()
          ctx.restore()

          // Corner brackets
          const cs = r * 0.32
          ctx.strokeStyle = `rgba(88,246,210,${a})`
          ctx.lineWidth = 1.8
          const corners = [
            [cx - r, cy - r, 1, 1],
            [cx + r, cy - r, -1, 1],
            [cx - r, cy + r, 1, -1],
            [cx + r, cy + r, -1, -1],
          ] as const
          for (const [bx, by, sx, sy] of corners) {
            ctx.beginPath()
            ctx.moveTo(bx + sx * cs, by)
            ctx.lineTo(bx, by)
            ctx.lineTo(bx, by + sy * cs)
            ctx.stroke()
          }
        }

        // Crosshair lines toward center
        ctx.strokeStyle = `rgba(88,246,210,${t * 0.4})`
        ctx.lineWidth = 0.5
        ctx.setLineDash([4, 8])
        ctx.beginPath()
        ctx.moveTo(cx - 200, cy)
        ctx.lineTo(cx + 200, cy)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx, cy - 200)
        ctx.lineTo(cx, cy + 200)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Pulse expansion
      if (showPulse) {
        pulseR += 24
        const maxR = Math.sqrt(W * W + H * H)
        const ta = Math.max(0, 1 - (pulseR / maxR) * 2.2)

        for (let i = 0; i < 5; i++) {
          const r = pulseR - i * 55
          if (r <= 0) continue
          const ringA = ta * (1 - i * 0.18)
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(88,246,210,${ringA})`
          ctx.lineWidth = 2.5 - i * 0.4
          ctx.stroke()
        }

        // Core bloom
        if (pulseR < 160) {
          const bloom = 1 - pulseR / 160
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160)
          grad.addColorStop(0, `rgba(200,255,240,${bloom * 0.95})`)
          grad.addColorStop(0.3, `rgba(88,246,210,${bloom * 0.6})`)
          grad.addColorStop(0.7, `rgba(88,246,210,${bloom * 0.15})`)
          grad.addColorStop(1, 'transparent')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, cy, 160, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Glitch flash
      if (showFlash && flashA > 0) {
        // Chromatic aberration bands
        if (flashA > 0.25) {
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          ctx.fillStyle = `rgba(255,0,60,${flashA * 0.22})`
          ctx.fillRect(-14, 0, W, H)
          ctx.fillStyle = `rgba(0,80,255,${flashA * 0.22})`
          ctx.fillRect(14, 0, W, H)
          ctx.restore()
        }

        // White bloom
        ctx.fillStyle = `rgba(255,255,255,${flashA * 0.88})`
        ctx.fillRect(0, 0, W, H)

        // Scan lines
        if (flashA > 0.12) {
          for (let scanY = 0; scanY < H; scanY += 3) {
            ctx.fillStyle = `rgba(0,0,0,${flashA * 0.22})`
            ctx.fillRect(0, scanY, W, 1.5)
          }
        }

        // Horizontal tearing
        if (flashA > 0.5 && Math.random() > 0.6) {
          const tearY = Math.random() * H
          ctx.fillStyle = `rgba(88,246,210,${flashA * 0.35})`
          ctx.fillRect(Math.random() * 80, tearY, W * (0.5 + Math.random() * 0.5), 1)
        }

        flashA = Math.max(0, flashA - 0.035)
      }

      rafId = requestAnimationFrame(render)
    }

    render()

    // ── GSAP master timeline ─────────────────────────────────
    const tl = gsap.timeline()

    // 0s: dark overlay fades in — dims current page
    tl.to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.in' }, 0)

    // 0.5s: particles begin accelerating toward center
    tl.call(() => { accel = 2.5 }, [], 0.5)
    tl.call(() => { accel = 6 }, [], 0.85)

    // 0.9s: trace lines sweep
    tl.call(() => {
      showTrace = true
      // Horizontal sweeps left-to-right and right-to-left
      for (let i = 0; i < 12; i++) {
        const fromRight = Math.random() > 0.5
        traceLines.push({
          x1: fromRight ? W + 10 : -10,
          y1: (H / 12) * i + Math.random() * (H / 14),
          x2: fromRight ? -10 : W + 10,
          y2: (H / 12) * i + Math.random() * (H / 14),
          progress: 0,
          alpha: 0.45 + Math.random() * 0.35,
          color: '#58F6D2',
          speed: 0.025 + Math.random() * 0.025,
        })
      }
      // Diagonal lines converging toward center
      for (let i = 0; i < 8; i++) {
        traceLines.push({
          x1: Math.random() * W,
          y1: Math.random() > 0.5 ? -10 : H + 10,
          x2: cx + (Math.random() - 0.5) * 120,
          y2: cy + (Math.random() - 0.5) * 120,
          progress: 0,
          alpha: 0.4,
          color: '#6AA6FF',
          speed: 0.035 + Math.random() * 0.025,
        })
      }
    }, [], 0.9)

    // 1.4s: lock-on rings converge
    tl.call(() => { showLockOn = true }, [], 1.4)

    // 1.9s: pulse forms and expands
    tl.call(() => { showPulse = true }, [], 1.9)

    // 2.25s: glitch flash
    tl.call(() => {
      showFlash = true
      flashA = 1.0
    }, [], 2.25)

    // 2.35s: mount skills world underneath (flash covers the swap)
    tl.call(() => {
      if (mountedRef.current) onMountSkills()
    }, [], 2.35)

    // 2.4s: overlay fades out revealing the new cinematic world
    tl.to(overlay, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 2.4)

    // 3.0s: done — let App.tsx unmount this component
    tl.call(() => {
      alive = false
      cancelAnimationFrame(rafId)
      if (mountedRef.current) onComplete()
    }, [], 3.05)

    return () => {
      alive = false
      cancelAnimationFrame(rafId)
      tl.kill()
    }
  }, [onMountSkills, onComplete])

  return createPortal(
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ opacity: 0, background: 'rgba(7,10,19,0.93)' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>,
    document.body,
  )
}
