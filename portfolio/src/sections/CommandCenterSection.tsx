import { motion } from 'framer-motion'

const widgets = [
  { label: 'Build Velocity', value: '+38%', tone: 'from-neon/30 to-neon/5' },
  { label: 'Incident Mean Time', value: '-27%', tone: 'from-arc/30 to-arc/5' },
  { label: 'UX Satisfaction', value: '4.9/5', tone: 'from-plasma/30 to-plasma/5' },
  { label: 'Ship Confidence', value: '92%', tone: 'from-white/20 to-white/5' },
]

export default function CommandCenterSection() {
  return (
    <section className="relative min-h-[84vh] overflow-hidden px-6 pb-24 pt-16 md:px-14">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Command Center</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
          A dashboard-grade view of engineering momentum and design impact.
        </h2>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((widget, idx) => (
          <motion.article
            key={widget.label}
            className={`rounded-3xl border border-white/10 bg-gradient-to-br ${widget.tone} p-6 backdrop-blur-lg`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{widget.label}</p>
            <p className="mt-4 font-display text-4xl text-white">{widget.value}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Current Focus Streams</p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-white/75">Design Systems / Motion Tokens</p>
            <div className="h-2 rounded bg-white/10">
              <motion.div
                className="h-full rounded bg-gradient-to-r from-neon to-arc"
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                transition={{ delay: 0.35, duration: 1.1 }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-white/75">AI Workflow Orchestration</p>
            <div className="h-2 rounded bg-white/10">
              <motion.div
                className="h-full rounded bg-gradient-to-r from-plasma to-neon"
                initial={{ width: 0 }}
                animate={{ width: '71%' }}
                transition={{ delay: 0.42, duration: 1.1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
