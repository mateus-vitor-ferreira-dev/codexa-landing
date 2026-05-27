'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
  }, [])

  return (
    <div ref={ref} className="relative overflow-visible" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
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
            ? 'linear-gradient(to right, transparent 0%, rgba(0,214,245,0.6) 35%, rgba(0,214,245,0.6) 65%, transparent 100%)'
            : 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.14) 30%, rgba(255,255,255,0.14) 70%, transparent 100%)',
        }}
      />
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
            background: 'radial-gradient(ellipse at center, rgba(0,214,245,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
