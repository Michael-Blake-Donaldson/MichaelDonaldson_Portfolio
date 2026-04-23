import { useEffect, useRef } from 'react'
import cursorImg from '../../assets/cursor/Astronaut Hand & Helmet--cursor--SweezyCursors.png'

const SIZE = 64
// Finger tip sits near the right/top edge of this artwork.
const HOTSPOT_X = Math.round(SIZE * 0.92)
const HOTSPOT_Y = Math.round(SIZE * 0.14)

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let pointerX = -200
    let pointerY = -200
    let currentX = -200
    let currentY = -200
    let pressed = false
    let hoveringInteractive = false
    let rafId = 0

    const render = () => {
      currentX += (pointerX - currentX) * 0.28
      currentY += (pointerY - currentY) * 0.28
      const scale = pressed ? 0.9 : hoveringInteractive ? 1.06 : 1
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale})`
      cursor.style.filter = hoveringInteractive
        ? 'drop-shadow(0 0 8px rgba(88,246,210,0.7)) brightness(1.12)'
        : 'none'
      rafId = window.requestAnimationFrame(render)
    }

    const onMove = (e: MouseEvent) => {
      const x = clamp(e.clientX - HOTSPOT_X, 0, window.innerWidth - SIZE)
      const y = clamp(e.clientY - HOTSPOT_Y, 0, window.innerHeight - SIZE)
      pointerX = x
      pointerY = y
    }

    const onDown = () => {
      pressed = true
    }

    const onUp = () => {
      pressed = false
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null
      hoveringInteractive = !!target?.closest('a,button,[role="button"],input,textarea,select,summary,label,[tabindex]:not([tabindex="-1"])')
    }

    const onResize = () => {
      pointerX = clamp(pointerX, 0, window.innerWidth - SIZE)
      pointerY = clamp(pointerY, 0, window.innerHeight - SIZE)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('resize', onResize)

    rafId = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('resize', onResize)
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <img
      ref={cursorRef}
      src={cursorImg}
      alt=""
      aria-hidden
      className="custom-cursor pointer-events-none fixed left-0 top-0 z-[9999] block select-none"
      style={{
        width: SIZE,
        height: SIZE,
        objectFit: 'contain',
        transformOrigin: `${HOTSPOT_X}px ${HOTSPOT_Y}px`,
        willChange: 'transform, filter',
        transition: 'filter 0.15s ease',
        transform: `translate3d(-200px,-200px,0)`,
      }}
      draggable={false}
    />
  )
}
