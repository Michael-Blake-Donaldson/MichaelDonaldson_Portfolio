import { useEffect, useMemo, useState } from 'react'

type TypingOptions = {
  speed?: number
  eraseSpeed?: number
  pauseMs?: number
}

export function useTypingEffect(words: string[], options: TypingOptions = {}) {
  const { speed = 55, eraseSpeed = 30, pauseMs = 1000 } = options
  const safeWords = useMemo(
    () => words.filter((word) => word.trim().length > 0),
    [words],
  )
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (safeWords.length === 0) return

    const currentWord = safeWords[index % safeWords.length]

    if (!deleting && value === currentWord) {
      const timeout = window.setTimeout(() => setDeleting(true), pauseMs)
      return () => window.clearTimeout(timeout)
    }

    if (deleting && value.length === 0) {
      setDeleting(false)
      setIndex((prev) => (prev + 1) % safeWords.length)
      return
    }

    const timeout = window.setTimeout(
      () => {
        setValue((prev) => {
          if (deleting) return prev.slice(0, -1)
          return currentWord.slice(0, prev.length + 1)
        })
      },
      deleting ? eraseSpeed : speed,
    )

    return () => window.clearTimeout(timeout)
  }, [deleting, eraseSpeed, index, pauseMs, safeWords, speed, value])

  return value
}
