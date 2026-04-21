import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { timelineEvents } from '../data/siteData'

gsap.registerPlugin(ScrollTrigger)

export default function TimelineSection() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-event',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.16,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.4,
          },
        },
      )

      gsap.to('.timeline-track', {
        backgroundPositionY: 220,
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
    <section ref={rootRef} className="relative min-h-[84vh] overflow-hidden px-6 pb-28 pt-16 md:px-14">
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.28em] text-neon/75">Flux Timeline</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl text-white md:text-5xl">
          Milestones across my transition from student learning to professional software engineering.
        </h2>
      </motion.div>

      <div className="timeline-track relative rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(88,246,210,0.08),rgba(106,166,255,0.08))] p-6 md:p-8">
        <div className="space-y-6">
          {timelineEvents.map((item) => (
            <article
              key={item.year}
              className="timeline-event relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-lg"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon/75">{item.year}</p>
              <h3 className="mt-2 font-display text-xl text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
