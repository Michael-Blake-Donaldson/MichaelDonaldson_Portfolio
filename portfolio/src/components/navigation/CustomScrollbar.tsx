import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { SectionId } from '../../types'

const MIN_THUMB = 56

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

interface CustomScrollbarProps {
  activeSection: SectionId
}

export function CustomScrollbar({ activeSection }: CustomScrollbarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef({ active: false, pointerOffset: 0 })
  const [enabled, setEnabled] = useState(false)
  const [scrollable, setScrollable] = useState(false)
  const [progress, setProgress] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(0)

  const maxThumbTop = useMemo(() => {
    const track = trackRef.current
    if (!track) return 0
    return Math.max(track.clientHeight - thumbHeight, 0)
  }, [thumbHeight])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)')
    const apply = () => setEnabled(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const sync = () => {
      const doc = document.documentElement
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 0)
      const current = maxScroll > 0 ? window.scrollY / maxScroll : 0
      setProgress(current)
      setScrollable(maxScroll > 2)

      const track = trackRef.current
      if (!track) return
      const ratio = window.innerHeight / Math.max(doc.scrollHeight, 1)
      setThumbHeight(clamp(track.clientHeight * ratio, MIN_THUMB, track.clientHeight))
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)

    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [enabled, activeSection])

  useEffect(() => {
    if (!enabled) return

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return
      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const top = clamp(e.clientY - rect.top - dragRef.current.pointerOffset, 0, Math.max(rect.height - thumbHeight, 0))
      const ratio = rect.height - thumbHeight > 0 ? top / (rect.height - thumbHeight) : 0
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      window.scrollTo({ top: ratio * maxScroll, behavior: 'auto' })
    }

    const onPointerUp = () => {
      dragRef.current.active = false
      document.body.classList.remove('custom-scroll-dragging')
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.classList.remove('custom-scroll-dragging')
    }
  }, [enabled, thumbHeight])

  const hideForSection = activeSection === 'skills'
  if (!enabled || hideForSection || !scrollable) return null

  const handleTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()

    const thumbTop = progress * Math.max(rect.height - thumbHeight, 0)
    const clickY = e.clientY - rect.top

    // If clicking outside the thumb, jump so the thumb centers around click.
    if (clickY < thumbTop || clickY > thumbTop + thumbHeight) {
      const centeredTop = clamp(clickY - thumbHeight / 2, 0, Math.max(rect.height - thumbHeight, 0))
      const ratio = rect.height - thumbHeight > 0 ? centeredTop / (rect.height - thumbHeight) : 0
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      window.scrollTo({ top: ratio * maxScroll, behavior: 'auto' })
    }
  }

  const handleThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const thumbTop = progress * Math.max(rect.height - thumbHeight, 0)

    dragRef.current.active = true
    dragRef.current.pointerOffset = e.clientY - (rect.top + thumbTop)
    document.body.classList.add('custom-scroll-dragging')
  }

  const hide = maxThumbTop <= 0
  const thumbTop = hide ? 0 : progress * maxThumbTop

  return (
    <div
      className="pointer-events-none fixed inset-y-0 z-[82] hidden w-12 md:block"
      style={{ right: 'clamp(0.75rem, 2.2vw, 2rem)' }}
    >
      <div
        ref={trackRef}
        className="pointer-events-auto absolute bottom-6 right-3 top-6 w-3 rounded-full border border-neon/20 bg-black/50 shadow-[0_0_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        onPointerDown={handleTrackPointerDown}
        aria-hidden
      >
        <div
          className="absolute left-[2px] right-[2px] rounded-full border border-neon/40 bg-gradient-to-b from-neon/95 to-arc/85 shadow-[0_0_18px_rgba(88,246,210,0.45)]"
          style={{
            height: `${Math.max(thumbHeight, MIN_THUMB)}px`,
            transform: `translateY(${thumbTop}px)`,
            opacity: hide ? 0 : 1,
            transition: dragRef.current.active ? 'none' : 'opacity 140ms ease, transform 140ms ease',
          }}
          onPointerDown={handleThumbPointerDown}
          aria-hidden
        />
      </div>
    </div>
  )
}
