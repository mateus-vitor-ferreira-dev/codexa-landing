'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleText } from '@/lib/fx/ScrambleText'
import { isFinePointer, prefersReducedMotion } from '@/lib/fx/motion'

gsap.registerPlugin(ScrollTrigger)

const CONFIG = {
  EYEBROW_DELAY:   0,
  LINE1_DELAY:     0.3,
  LINE2_DELAY:     0.7,
  UNDERLINE_DELAY: 1.3,
  SIGN_DELAY:      1.4,
  DURATION_TEXT:   1.2,
  DURATION_FADE:   1.0,
  EASE:            'power4.out',
}

export function Manifesto() {
  const sectionRef   = useRef<HTMLElement>(null)
  const eyebrowRef   = useRef<HTMLDivElement>(null)
  const line1Ref     = useRef<HTMLSpanElement>(null)
  const line2Ref     = useRef<HTMLSpanElement>(null)
  const underlineRef = useRef<HTMLSpanElement>(null)
  const signRef      = useRef<HTMLDivElement>(null)

  /* Lanterna: com o mouse sobre a seção, uma luz suave na cor do tema segue
     o cursor por trás da frase e a palavra "código" ganha brilho.
     Posição em CSS vars, 1 leitura de rect por frame. */
  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion() || !isFinePointer()) return
    let raf = 0, cx = 0, cy = 0
    const update = () => {
      raf = 0
      const r = section.getBoundingClientRect()
      section.style.setProperty('--mf-x', `${(cx - r.left).toFixed(0)}px`)
      section.style.setProperty('--mf-y', `${(cy - r.top).toFixed(0)}px`)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cx = e.clientX; cy = e.clientY
      section.style.setProperty('--mf-on', '1')
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onLeave = () => section.style.setProperty('--mf-on', '0')
    section.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useGSAP(() => {
    // Estado inicial (oculto) só é aplicado aqui, com JS e sem reduced-motion:
    // no SSR e com reduce o texto já sai visível. useGSAP roda em layout effect,
    // então o set acontece antes do paint e não pisca.
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(eyebrowRef.current, { opacity: 0, y: 20 })
      gsap.set(signRef.current, { opacity: 0, y: 16 })
      gsap.set([line1Ref.current, line2Ref.current], { opacity: 0, y: 44 })
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      })

      tl.fromTo(eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: CONFIG.DURATION_FADE, ease: CONFIG.EASE },
        CONFIG.EYEBROW_DELAY,
      )
      .fromTo(line1Ref.current,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: CONFIG.DURATION_TEXT, ease: CONFIG.EASE },
        CONFIG.LINE1_DELAY,
      )
      .fromTo(line2Ref.current,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: CONFIG.DURATION_TEXT, ease: CONFIG.EASE },
        CONFIG.LINE2_DELAY,
      )
      .fromTo(underlineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: 'power3.inOut', transformOrigin: 'left' },
        CONFIG.UNDERLINE_DELAY,
      )
      .fromTo(signRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: CONFIG.DURATION_FADE, ease: CONFIG.EASE },
        CONFIG.SIGN_DELAY,
      )
    }, sectionRef.current ?? undefined)
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      aria-label="Filosofia da empresa"
      style={{
        position:       'relative',
        minHeight:      '90vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'clamp(96px, 12vw, 160px) clamp(1.5rem, 5vw, 6rem)',
        background:     'transparent',
        overflow:       'hidden',
      }}
    >
      {/* Vinheta neutra — foco no texto sem alterar a cor do fundo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 72% 62% at 50% 50%, rgba(6,6,10,0.88) 0%, rgba(6,6,10,0.6) 42%, transparent 78%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Lanterna que segue o cursor (por cima da vinheta, atrás do texto) */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(420px circle at var(--mf-x, 50%) var(--mf-y, 50%), rgba(var(--accent-rgb),0.10), transparent 70%)',
        opacity: 'var(--mf-on, 0)' as unknown as number,
        transition: 'opacity .6s ease',
      }} />

      {/* Decorative vertical centre line */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(var(--accent-rgb),0.12) 50%, transparent 100%)',
        transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: '1100px', textAlign: 'center', zIndex: 2, width: '100%' }}>

        {/* Eyebrow */}
        <div
          ref={eyebrowRef}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '4px', color: 'var(--text-muted)',
            textTransform: 'uppercase', marginBottom: '48px',
          }}
        >
          <span style={{ width: '40px', height: '1px', background: 'rgba(var(--accent-rgb),0.4)', flexShrink: 0 }} />
          <ScrambleText text="Nossa filosofia" duration={1000} />
          <span style={{ width: '40px', height: '1px', background: 'rgba(var(--accent-rgb),0.4)', flexShrink: 0 }} />
        </div>

        {/* Quote */}
        <div style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      'clamp(40px, 6.5vw, 88px)',
          fontWeight:    400,
          lineHeight:    1.15,
          letterSpacing: '-0.02em',
        }}>
          <span ref={line1Ref} style={{ display: 'block' }}>
            Não vendemos{' '}
            <em style={{
              fontStyle: 'italic', color: 'var(--accent)', position: 'relative',
              textShadow: '0 0 calc(var(--mf-on, 0) * 32px) rgba(var(--accent-rgb),0.55)',
              transition: 'text-shadow .6s ease',
            }}>
              código
              {/* Animated underline */}
              <span
                ref={underlineRef}
                aria-hidden="true"
                style={{
                  position:        'absolute',
                  left:            0,
                  bottom:          '0.05em',
                  width:           '100%',
                  height:          '1px',
                  background:      'var(--accent)',
                  display:         'block',
                  transformOrigin: 'left',
                }}
              />
            </em>
            .
          </span>
          <span ref={line2Ref} style={{ display: 'block', marginTop: '0.15em' }}>
            <span style={{ color: 'var(--text-muted)' }}>Entregamos</span>{' '}
            negócios funcionando.
          </span>
        </div>

        {/* Signature */}
        <div
          ref={signRef}
          style={{
            marginTop:   '64px',
            fontFamily:  'var(--font-mono)',
            fontSize:    '11px',
            letterSpacing: '3px',
            color:       'var(--text-faint)',
            textTransform: 'uppercase',
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'center',
            gap:         '10px',
          }}
        >
          <span style={{
            width: '6px', height: '6px',
            background: 'var(--accent)', borderRadius: '50%',
            boxShadow: '0 0 8px var(--accent)',
            animation: 'manifestoBlink 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <ScrambleText text="Codexa · Lavras, MG" duration={1100} delay={300} />
        </div>
      </div>

      <style>{`
        @keyframes manifestoBlink {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </section>
  )
}
