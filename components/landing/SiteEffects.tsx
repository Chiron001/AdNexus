'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/* Site-wide pointer + scroll effects for the marketing pages.
   - .io-card / .io-spot / .io-spot-dark : cursor-following spotlight (--mx / --my)
   - .io-tilt                            : gentle 3D tilt toward the cursor (--rx / --ry)
   - [data-parallax] > [data-depth]      : hero widgets drift with the mouse
   - top reading-progress bar and a back-to-top button */
export function SiteEffects() {
  const barRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        setShowTop(window.scrollY > 900)
      })
    }

    let tilted: HTMLElement | null = null
    const resetTilt = () => {
      if (!tilted) return
      tilted.style.setProperty('--rx', '0deg')
      tilted.style.setProperty('--ry', '0deg')
      tilted = null
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return // touch/pen get no hover effects
      const target = e.target as Element | null
      if (!target?.closest) return

      const spot = target.closest<HTMLElement>('.io-card, .io-spot, .io-spot-dark')
      if (spot) {
        const r = spot.getBoundingClientRect()
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`)
        spot.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      if (reduce) return

      const tilt = target.closest<HTMLElement>('.io-tilt')
      if (tilt !== tilted) resetTilt()
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        tilt.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`)
        tilt.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
        tilted = tilt
      }

      const root = target.closest<HTMLElement>('[data-parallax]')
      if (root) {
        const r = root.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        root.querySelectorAll<HTMLElement>('[data-depth]').forEach(el => {
          const d = Number(el.dataset.depth) || 10
          // `translate` (not `transform`) so it stacks with the widgets' own entrance/float animations
          el.style.translate = `${(x * d).toFixed(1)}px ${(y * d).toFixed(1)}px`
        })
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', resetTilt)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', resetTilt)
    }
  }, [])

  return (
    <>
      <div aria-hidden="true" className="fixed top-0 left-0 right-0 h-[3px] z-[80] pointer-events-none">
        <div ref={barRef} className="h-full origin-left" style={{ transform: 'scaleX(0)', background: 'linear-gradient(90deg, var(--io-accent), var(--io-accent-2))' }} />
      </div>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`io-to-top fixed right-5 bottom-5 sm:right-8 sm:bottom-8 z-[55] w-12 h-12 rounded-full flex items-center justify-center text-white ${showTop ? 'is-visible' : ''}`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  )
}
