export const motionTokens = {
  spring: {
    smooth: { type: 'spring', stiffness: 180, damping: 24 },
    snappy: { type: 'spring', stiffness: 260, damping: 28 },
  },
  duration: {
    fast: 0.24,
    base: 0.55,
    slow: 0.8,
  },
  ease: {
    cinematic: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
}

export function getTransitionPolicy(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      duration: 0.14,
      ease: 'linear' as const,
      blur: 'blur(0px)',
      yOffset: 6,
    }
  }

  return {
    duration: motionTokens.duration.base,
    ease: motionTokens.ease.cinematic,
    blur: 'blur(10px)',
    yOffset: 24,
  }
}
