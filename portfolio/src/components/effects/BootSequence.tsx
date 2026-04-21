import { motion } from 'framer-motion'

type BootSequenceProps = {
  ready: boolean
}

const logs = [
  'Initializing neural renderer',
  'Syncing telemetry channels',
  'Bootstrapping interaction mesh',
  'Finalizing visual protocol',
]

export function BootSequence({ ready }: BootSequenceProps) {
  if (ready) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-abyss px-6 py-10 md:px-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-xs uppercase tracking-[0.28em] text-neon/70">System Boot</div>
      <div className="space-y-4 font-mono text-xs text-white/70 md:text-sm">
        {logs.map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.34 }}
          >
            [{String(index + 1).padStart(2, '0')}] {line}
          </motion.p>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-neon via-arc to-plasma"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.6, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-right font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          preparing immersive runtime...
        </p>
      </div>
    </motion.div>
  )
}
