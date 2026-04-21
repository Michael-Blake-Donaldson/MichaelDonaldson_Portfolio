import { motion } from 'framer-motion'
import { skillLinks, skillNodes } from '../data/siteData'

export default function SkillsSection() {
  const mapById = Object.fromEntries(skillNodes.map((node) => [node.id, node]))

  return (
    <section className="relative min-h-[84vh] overflow-hidden px-6 pb-24 pt-16 md:px-14">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Skill Graph</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
          Capabilities mapped as a living constellation, not static proficiency bars.
        </h2>
      </motion.div>

      <div className="relative h-[480px] rounded-[2rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
        <svg className="absolute inset-0 h-full w-full">
          {skillLinks.map(([from, to]) => {
            const start = mapById[from as keyof typeof mapById]
            const end = mapById[to as keyof typeof mapById]
            if (!start || !end) return null
            return (
              <line
                key={`${from}-${to}`}
                x1={`${start.x}%`}
                y1={`${start.y}%`}
                x2={`${end.x}%`}
                y2={`${end.y}%`}
                stroke="rgba(106,166,255,0.4)"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>

        {skillNodes.map((node, idx) => (
          <motion.button
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-lg hover:border-neon/60 hover:text-neon"
            style={{ left: `${node.x}%`, top: `${node.y}%`, scale: node.size }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: node.size }}
            transition={{ delay: idx * 0.08, type: 'spring', stiffness: 180 }}
            whileHover={{ scale: node.size + 0.2 }}
            drag
            dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
          >
            {node.label}
          </motion.button>
        ))}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/50">
        Tip: Drag nodes to feel connection tension and rediscover pathways.
      </p>
    </section>
  )
}
