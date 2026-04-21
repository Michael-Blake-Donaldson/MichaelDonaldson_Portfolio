import { useEffect } from 'react'

type Shortcuts = Record<string, () => void>

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey ? 'ctrl' : '',
        event.metaKey ? 'meta' : '',
        event.shiftKey ? 'shift' : '',
        event.altKey ? 'alt' : '',
        event.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+')

      const handler = shortcuts[key]
      if (!handler) return

      event.preventDefault()
      handler()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
