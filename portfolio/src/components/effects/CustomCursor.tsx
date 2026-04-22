import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = ringRef.current
    if (!cursor || !ring) return

    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let ringX = pointerX
    let ringY = pointerY

    const onMove = (event: MouseEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
    }

    const animate = () => {
      ringX += (pointerX - ringX) * 0.14
      ringY += (pointerY - ringY) * 0.14
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      window.requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    const raf = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/50 mix-blend-screen md:block" />
      <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon shadow-glow md:block" />
    </>
  )
}
