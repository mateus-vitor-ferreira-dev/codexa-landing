'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      gsap.set([eyebrowRef.current, line1Ref.current, line2Ref.current, signRef.current], { opacity: 1, y: 0 })
      gsap.set(underlineRef.current, { scaleX: 1 })
      return
    }

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
        background:     '#120818',
        overflow:       'hidden',
      }}
    >
      {/* Top fade — connects to hero */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '220px',
        background: 'linear-gradient(180deg, #06060a 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Bottom fade — connects to promises marquee */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px',
        background: 'linear-gradient(0deg, #0d0614 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Decorative vertical centre line */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(77,216,224,0.12) 50%, transparent 100%)',
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
            opacity: 0,
          }}
        >
          <span style={{ width: '40px', height: '1px', background: 'rgba(77,216,224,0.4)', flexShrink: 0 }} />
          Nossa filosofia
          <span style={{ width: '40px', height: '1px', background: 'rgba(77,216,224,0.4)', flexShrink: 0 }} />
        </div>

        {/* Quote */}
        <div style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      'clamp(40px, 6.5vw, 88px)',
          fontWeight:    400,
          lineHeight:    1.15,
          letterSpacing: '-0.02em',
        }}>
          <span ref={line1Ref} style={{ display: 'block', opacity: 0 }}>
            Não vendemos{' '}
            <em style={{ fontStyle: 'italic', color: '#4dd8e0', position: 'relative' }}>
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
                  background:      '#4dd8e0',
                  display:         'block',
                  transformOrigin: 'left',
                  transform:       'scaleX(0)',
                }}
              />
            </em>
            .
          </span>
          <span ref={line2Ref} style={{ display: 'block', opacity: 0, marginTop: '0.15em' }}>
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
            opacity:     0,
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'center',
            gap:         '10px',
          }}
        >
          <span style={{
            width: '6px', height: '6px',
            background: '#4dd8e0', borderRadius: '50%',
            boxShadow: '0 0 8px #4dd8e0',
            animation: 'manifestoBlink 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          Codexa · Lavras, MG
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
