import { useEffect, useRef } from 'react'
import cursorImg from '../../assets/cursor/Astronaut Hand & Helmet--cursor--SweezyCursors.png'

// Cursor image size rendered on screen (px)
const SIZE = 72
// Hotspot offset: fingertip is near top-right of the image.
// Shift left by ~55% of width and up by ~5% of height so the tip aligns with the click point.
const OFFSET_X = Math.round(SIZE * 0.55)
const OFFSET_Y = Math.round(SIZE * 0.05)

export function CustomCursor() {
  const cursorRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onMove = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX - OFFSET_X}px, ${e.clientY - OFFSET_Y}px, 0)`
    }

    const onDown = () => { cursor.style.transform += ' scale(0.88)' }
    const onUp   = () => {} // scale resets on next mousemove

    const onEnterClickable = () => { cursor.style.filter = 'drop-shadow(0 0 8px rgba(88,246,210,0.75)) brightness(1.15)' }
    const onLeaveClickable = () => { cursor.style.filter = '' }

    // Observe pointer-cursor elements for hover effect
    const observer = new MutationObserver(() => {})

    const attachHover = () => {
      document.querySelectorAll<HTMLElement>('a,button,[role="button"],[tabindex]').forEach(el => {
        el.addEventListener('mouseenter', onEnterClickable)
        el.addEventListener('mouseleave', onLeaveClickable)
      })
    }
    attachHover()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      observer.disconnect()
    }
  }, [])

  return (
    <img
      ref={cursorRef}
      src={cursorImg}
      alt=""
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden select-none md:block"
      style={{
        width: SIZE,
        height: SIZE,
        objectFit: 'contain',
        willChange: 'transform',
        transition: 'filter 0.15s ease',
        // start off-screen
        transform: `translate3d(-200px,-200px,0)`,
      }}
      draggable={false}
    />
  )
}
