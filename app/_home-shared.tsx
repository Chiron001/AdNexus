'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ── Scroll-reveal ─────────────────────────────── */
export function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ── Animated counter ──────────────────────────── */
export function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return { ref, count }
}

/* ── Touch carousel ────────────────────────────── */
export function Carousel({ items, renderItem, initialIndex = 0 }: {
  items: unknown[]
  renderItem: (item: unknown, i: number) => React.ReactNode
  initialIndex?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(initialIndex)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    if (initialIndex === 0) return
    setTimeout(() => {
      const el = ref.current
      if (!el) return
      el.scrollLeft = initialIndex * el.clientWidth
    }, 50)
  }, [])

  const goTo = (i: number) => {
    if (!ref.current) return
    ref.current.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4 pb-1">
        {items.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  )
}
