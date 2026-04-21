import { useEffect, useRef } from 'react'

export function useMagnetic(intensity = 0.2) {
  const ref = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      node.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`
    }

    const reset = () => {
      node.style.transform = 'translate(0px, 0px)'
    }

    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseleave', reset)

    return () => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseleave', reset)
    }
  }, [intensity])

  return ref
}
