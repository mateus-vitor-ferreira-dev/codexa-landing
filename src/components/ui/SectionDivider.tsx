'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isFinePointer, prefersReducedMotion } from '@/lib/fx/motion'

gsap.registerPlugin(ScrollTrigger)

/* Reação ao cursor: quando o mouse passa perto de uma divisória, um ponto
   de luz corre pela linha acompanhando o x do cursor, mais forte quanto
   mais perto. Um único listener e um único rAF para todas as divisórias:
   no frame, lê todos os rects (só das visíveis) e depois escreve tudo —
   sem intercalar leitura/escrita (layout thrashing). */
const RANGE = 140                                    // px acima/abaixo da linha
const dividers = new Map<HTMLElement, boolean>()     // el → visível
let io: IntersectionObserver | null = null
let raf = 0, mx = -1e4, my = -1e4

function frame() {
  raf = 0
  const els = [...dividers].filter(([, v]) => v).map(([el]) => el)
  const rects = els.map(el => el.getBoundingClientRect())
  els.forEach((el, i) => {
    const r = rects[i]
    const prox = Math.max(0, 1 - Math.abs(my - (r.top + r.height / 2)) / RANGE)
    el.style.setProperty('--dv-x', `${(mx - r.left).toFixed(0)}px`)
    el.style.setProperty('--dv-on', prox.toFixed(3))
  })
}
const schedule = () => { if (!raf) raf = requestAnimationFrame(frame) }
const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return
  mx = e.clientX; my = e.clientY
  schedule()
}
const onOut = () => { mx = my = -1e4; schedule() }

function register(el: HTMLElement) {
  if (dividers.size === 0) {
    io = new IntersectionObserver(entries => {
      entries.forEach(en => dividers.set(en.target as HTMLElement, en.isIntersecting))
    })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    document.documentElement.addEventListener('pointerleave', onOut)
  }
  dividers.set(el, false)
  io?.observe(el)
  return () => {
    io?.unobserve(el)
    dividers.delete(el)
    el.style.removeProperty('--dv-on')
    if (dividers.size === 0) {
      io?.disconnect(); io = null
      cancelAnimationFrame(raf); raf = 0
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      document.documentElement.removeEventListener('pointerleave', onOut)
    }
  }
}

interface Props {
  accent?: boolean
}

export function SectionDivider({ accent = false }: Props) {
  const ref     = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el   = ref.current
    const line = lineRef.current
    const glow = glowRef.current
    if (!el || !line) return

    const unregister = !prefersReducedMotion() && isFinePointer() ? register(el) : null
    const mm = gsap.matchMedia()
    // Com reduced-motion: linha e brilho já visíveis, sem desenho
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Line draws left → right on scroll
      gsap.fromTo(line,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      if (glow) {
        gsap.fromTo(glow,
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1, scale: 1,
            duration: 0.7, delay: 0.3,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    })
    return () => { mm.revert(); unregister?.() }
  }, [])

  return (
    <div ref={ref} className="relative overflow-visible" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
      {/* Line */}
      <div
        ref={lineRef}
        style={{
          position:        'absolute',
          top:             '50%',
          left:            0,
          right:           0,
          height:          '1px',
          transform:       'translateY(-50%)',
          transformOrigin: 'left center',
          background:     accent
            ? 'linear-gradient(to right, transparent 0%, rgba(var(--accent-rgb),0.6) 35%, rgba(var(--accent-rgb),0.6) 65%, transparent 100%)'
            : 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.14) 30%, rgba(255,255,255,0.14) 70%, transparent 100%)',
        }}
      />
      {/* Ponto de luz que segue o cursor ao longo da linha (só mouse) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: 0, right: 0, top: '50%', height: 40,
          transform: 'translateY(-50%)', pointerEvents: 'none',
          opacity: 'var(--dv-on, 0)' as unknown as number,
          background: `radial-gradient(${accent ? 260 : 200}px 20px at var(--dv-x, -999px) 50%, rgba(var(--accent-rgb),${accent ? 0.22 : 0.14}), transparent 70%)`,
        }}
      >
        <span style={{
          position: 'absolute', left: 0, right: 0, top: '50%', height: 1, marginTop: -0.5,
          background: `radial-gradient(${accent ? 180 : 140}px 100% at var(--dv-x, -999px) 50%, rgba(var(--accent-rgb),1), rgba(var(--accent-rgb),0.4) 40%, transparent 100%)`,
        }} />
      </div>
      {/* Glow bloom (accent only) */}
      {accent && (
        <div
          ref={glowRef}
          style={{
            position:  'absolute',
            top:       '50%',
            left:      '50%',
            transform: 'translate(-50%, -50%)',
            width:     '320px',
            height:    '64px',
            background: 'radial-gradient(ellipse at center, rgba(var(--accent-rgb),0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
