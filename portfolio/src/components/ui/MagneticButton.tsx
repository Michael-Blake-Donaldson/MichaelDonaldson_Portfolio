import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { useMagnetic } from '../../hooks/useMagnetic'

type MagneticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'ghost'
  onHoverSound?: () => void
  onClickSound?: () => void
}

export function MagneticButton({
  className,
  tone = 'default',
  onHoverSound,
  onClickSound,
  children,
  onMouseEnter,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const ref = useMagnetic(0.22)

  return (
    <button
      ref={ref}
      className={clsx(
        'group relative rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.22em] transition-all duration-300',
        tone === 'default'
          ? 'border-neon/40 bg-neon/10 text-neon hover:bg-neon/20 hover:shadow-glow'
          : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10',
        className,
      )}
      onMouseEnter={(event) => {
        onHoverSound?.()
        onMouseEnter?.(event)
      }}
      onClick={(event) => {
        onClickSound?.()
        onClick?.(event)
      }}
      {...rest}
    >
      <span className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-neon/20" />
      <span className="relative">{children}</span>
    </button>
  )
}
