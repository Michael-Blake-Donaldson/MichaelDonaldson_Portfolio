import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { timelineEvents } from '../data/siteData'

gsap.registerPlugin(ScrollTrigger)

type PlanetTheme = {
  orbGradient: string
  glow: string
  ringOuter: string
  ringInner: string
  craterA: string
  craterB: string
  craterC: string
  progress: string
  chip: string
}

function getPlanetTheme(company: string, index: number): PlanetTheme {
  const normalized = company.toLowerCase()

  if (normalized.includes('unscripted')) {
    return {
      orbGradient: 'from-cyan-300/35 via-sky-400/20 to-blue-500/10',
      glow: 'shadow-[0_0_65px_rgba(34,211,238,0.34)]',
      ringOuter: 'border-cyan-200/45',
      ringInner: 'border-cyan-100/20',
      craterA: 'bg-cyan-100/60',
      craterB: 'bg-cyan-300/25',
      craterC: 'bg-cyan-900/28',
      progress: 'from-cyan-300 via-sky-400 to-blue-400',
      chip: 'text-cyan-200',
    }
  }

  if (normalized.includes('target')) {
    return {
      orbGradient: 'from-rose-300/35 via-red-400/22 to-rose-700/12',
      glow: 'shadow-[0_0_70px_rgba(248,113,113,0.3)]',
      ringOuter: 'border-rose-200/40',
      ringInner: 'border-rose-100/20',
      craterA: 'bg-rose-100/55',
      craterB: 'bg-red-300/24',
      craterC: 'bg-rose-900/30',
      progress: 'from-rose-300 via-red-400 to-orange-300',
      chip: 'text-rose-200',
    }
  }

  if (normalized.includes('disney')) {
    return {
      orbGradient: 'from-indigo-300/35 via-violet-400/22 to-blue-700/14',
      glow: 'shadow-[0_0_70px_rgba(129,140,248,0.32)]',
      ringOuter: 'border-indigo-200/40',
      ringInner: 'border-indigo-100/20',
      craterA: 'bg-indigo-100/58',
      craterB: 'bg-violet-300/22',
      craterC: 'bg-indigo-900/30',
      progress: 'from-indigo-300 via-violet-400 to-blue-400',
      chip: 'text-indigo-200',
    }
  }

  if (normalized.includes("arby's") || normalized.includes('arbys')) {
    return {
      orbGradient: 'from-amber-300/36 via-orange-400/24 to-red-600/14',
      glow: 'shadow-[0_0_72px_rgba(251,146,60,0.33)]',
      ringOuter: 'border-amber-100/42',
      ringInner: 'border-amber-100/20',
      craterA: 'bg-amber-100/58',
      craterB: 'bg-orange-300/24',
      craterC: 'bg-orange-900/30',
      progress: 'from-amber-300 via-orange-400 to-red-400',
      chip: 'text-amber-200',
    }
  }

  return index % 2 === 0
    ? {
      orbGradient: 'from-neon/30 via-arc/15 to-transparent',
      glow: 'shadow-[0_0_55px_rgba(88,246,210,0.22)]',
      ringOuter: 'border-white/25',
      ringInner: 'border-white/10',
      craterA: 'bg-white/50',
      craterB: 'bg-white/15',
      craterC: 'bg-black/20',
      progress: 'from-neon via-arc to-plasma',
      chip: 'text-neon/80',
    }
    : {
      orbGradient: 'from-plasma/30 via-arc/20 to-transparent',
      glow: 'shadow-[0_0_55px_rgba(255,90,191,0.22)]',
      ringOuter: 'border-white/25',
      ringInner: 'border-white/10',
      craterA: 'bg-white/50',
      craterB: 'bg-white/15',
      craterC: 'bg-black/20',
      progress: 'from-neon via-arc to-plasma',
      chip: 'text-neon/80',
    }
}

export default function TimelineSection() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.planet-chapter').forEach((node, index) => {
        const orb = node.querySelector('.planet-orb')
        const ring = node.querySelector('.planet-ring')
        const card = node.querySelector('.planet-card')

        if (orb) {
          gsap.timeline({
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
            .fromTo(
              orb,
              { scale: 1.34, yPercent: -16, rotate: -8 },
              { scale: 1.02, yPercent: -2, rotate: 0, ease: 'power2.out', duration: 0.42 },
            )
            .to(orb, { scale: 0.8, yPercent: 18, rotate: 8, ease: 'power1.in', duration: 0.33 })
            .to(orb, { scale: 0.64, yPercent: 28, opacity: 0.84, ease: 'none', duration: 0.25 })
        }

        if (ring) {
          gsap.fromTo(
            ring,
            { rotate: index % 2 === 0 ? 8 : -8 },
            {
              rotate: index % 2 === 0 ? -18 : 18,
              ease: 'none',
              scrollTrigger: {
                trigger: node,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }

        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 54 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: node,
                start: 'top 72%',
                end: 'top 38%',
                scrub: 0.4,
              },
            },
          )
        }
      })

      gsap.to('.timeline-cosmos', {
        backgroundPositionY: 260,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="timeline-cosmos relative min-h-[84vh] overflow-hidden px-6 pb-28 pt-16 md:px-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(88,246,210,0.16),transparent_36%),radial-gradient(circle_at_80%_16%,rgba(255,90,191,0.14),transparent_38%),radial-gradient(circle_at_58%_72%,rgba(106,166,255,0.2),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.14)_0.7px,transparent_0.8px)] [background-size:20px_20px] opacity-35" />

      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Flux Timeline</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
          Descend through the career system: each planet marks a role in my engineering journey.
        </h2>
        <p className="mt-4 max-w-2xl text-white/70">
          From production software delivery to large-scale operational leadership, each orbit highlights system thinking,
          optimization, and ownership under pressure.
        </p>
      </motion.div>

      <div className="space-y-24">
        {timelineEvents.map((item, index) => {
          const isEven = index % 2 === 0
          const theme = getPlanetTheme(item.company, index)

          return (
            <article
              key={`${item.year}-${item.title}`}
              className="planet-chapter grid min-h-[88vh] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]"
            >
              <div className={isEven ? 'order-1' : 'order-1 lg:order-2'}>
                <div className="planet-orb relative mx-auto w-[min(84vw,460px)]">
                  <div className={`aspect-square rounded-full border border-white/15 bg-gradient-to-br ${theme.orbGradient} ${theme.glow}`} />
                  <div className={`planet-ring absolute inset-[11%] rounded-full border ${theme.ringOuter}`} />
                  <div className={`absolute inset-[22%] rounded-full border ${theme.ringInner}`} />
                  <div className={`absolute left-[16%] top-[18%] h-5 w-5 rounded-full ${theme.craterA} blur-[1px]`} />
                  <div className={`absolute right-[20%] top-[32%] h-8 w-8 rounded-full ${theme.craterB}`} />
                  <div className={`absolute bottom-[21%] left-[27%] h-10 w-10 rounded-full ${theme.craterC}`} />
                </div>
              </div>

              <div className={isEven ? 'order-2' : 'order-2 lg:order-1'}>
                <div className="planet-card rounded-[1.6rem] border border-white/15 bg-black/40 p-6 backdrop-blur-xl md:p-8">
                  <p className={`font-mono text-[11px] uppercase tracking-[0.24em] ${theme.chip}`}>
                    {item.planet} • {item.year}
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-white md:text-3xl">{item.title}</h3>
                  <p className="mt-2 text-sm uppercase tracking-[0.14em] text-white/55">{item.company}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{item.period}</p>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">{item.summary}</p>
                  <ul className="mt-5 space-y-2">
                    {item.signals.map((signal) => (
                      <li
                        key={`${item.title}-${signal}`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/78"
                      >
                        {signal}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 h-1.5 overflow-hidden rounded-full border border-white/10 bg-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.progress}`}
                      style={{ width: `${Math.min(98, 56 + index * 12)}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
