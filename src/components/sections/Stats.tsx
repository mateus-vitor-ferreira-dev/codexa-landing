'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 5,   suffix: '+',  label: 'Projetos no ar',     sub: 'Todos em produção' },
  { value: 100, suffix: '%',  label: 'Código é seu',       sub: 'Zero lock-in' },
  { value: 30,  suffix: 'd',  label: 'Suporte incluso',    sub: 'Pós-entrega' },
  { value: 24,  suffix: 'h',  label: 'Tempo de resposta',  sub: 'Garantido' },
]

export function Stats() {
  const sectionRef  = useRef<HTMLElement>(null)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])

  useGSAP(() => {
    // Card entrance — stagger lateral
    gsap.fromTo('.stat-card',
      { opacity: 0, y: 36, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          toggleActions: 'play reverse play reverse',
        },
      }
    )

    gsap.fromTo('.stats-heading',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 84%',
          toggleActions: 'play reverse play reverse',
        },
      }
    )

    // Animated counters
    counterRefs.current.forEach((el, i) => {
      if (!el) return
      const stat = STATS[i]
      const proxy = { val: 0 }
      gsap.fromTo(proxy,
        { val: 0 },
        {
          val: stat.value,
          duration: 1.8,
          ease: 'power2.out',
          delay: i * 0.1,
          onUpdate() { el.textContent = Math.round(proxy.val) + stat.suffix },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      )
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-32" style={{ background: 'var(--bg)' }}>
      <div className="page-container flex flex-col gap-14">

        {/* Heading */}
        <div className="stats-heading flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              Em números
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'var(--text)' }}>
              Resultados que<br />
              <span style={{ color: '#00d6f5' }}>ficam no ar.</span>
            </h2>
          </div>
          <p className="max-w-xs leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Cada número abaixo representa um compromisso real com o cliente.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="stat-card flex flex-col gap-4 px-8 py-10 rounded-2xl relative overflow-hidden justify-center items-center text-center"
              style={{
                background: 'linear-gradient(145deg, #1a1a22 0%, #111115 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Accent glow corner */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '80px', height: '80px',
                background: 'radial-gradient(circle at top left, rgba(0,214,245,0.12), transparent 70%)',
                pointerEvents: 'none',
              }} />

              <span
                ref={el => { counterRefs.current[i] = el }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
                  fontWeight: 800,
                  color: '#00d6f5',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                0{stat.suffix}
              </span>

              <div className="flex flex-col gap-1">
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
                  fontWeight: 700,
                  color: '#f0f0f6',
                }}>
                  {stat.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.06em',
                }}>
                  {stat.sub}
                </span>
              </div>

              {/* Bottom accent line */}
              <div style={{
                position: 'absolute', bottom: 0, left: '20%', right: '20%',
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(0,214,245,0.35), transparent)',
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
