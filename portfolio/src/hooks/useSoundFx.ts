import { useCallback, useMemo, useRef, useState } from 'react'

type Tone = {
  frequency: number
  duration: number
  type: OscillatorType
  gain: number
}

function playTone(ctx: AudioContext, tone: Tone) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = tone.type
  oscillator.frequency.value = tone.frequency
  gainNode.gain.value = 0.0001

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  const now = ctx.currentTime
  gainNode.gain.exponentialRampToValueAtTime(tone.gain, now + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration)

  oscillator.start(now)
  oscillator.stop(now + tone.duration)
}

export function useSoundFx(initialState = false) {
  const [enabled, setEnabled] = useState(initialState)
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playHover = useCallback(() => {
    if (!enabled) return
    const ctx = getCtx()
    playTone(ctx, { frequency: 540, duration: 0.06, type: 'sine', gain: 0.01 })
  }, [enabled, getCtx])

  const playClick = useCallback(() => {
    if (!enabled) return
    const ctx = getCtx()
    playTone(ctx, { frequency: 220, duration: 0.08, type: 'triangle', gain: 0.02 })
    window.setTimeout(() => {
      playTone(ctx, { frequency: 330, duration: 0.07, type: 'triangle', gain: 0.015 })
    }, 40)
  }, [enabled, getCtx])

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
      toggle: () => setEnabled((prev) => !prev),
      playHover,
      playClick,
    }),
    [enabled, playClick, playHover],
  )

  return value
}
