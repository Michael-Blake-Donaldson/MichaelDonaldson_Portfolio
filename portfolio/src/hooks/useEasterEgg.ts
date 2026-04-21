import { useEffect, useState } from 'react'

const SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
]

export function useEasterEgg() {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    let progress = 0

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === SEQUENCE[progress]) {
        progress += 1
      } else {
        progress = key === SEQUENCE[0] ? 1 : 0
      }

      if (progress === SEQUENCE.length) {
        setUnlocked(true)
        progress = 0
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { unlocked, reset: () => setUnlocked(false) }
}
