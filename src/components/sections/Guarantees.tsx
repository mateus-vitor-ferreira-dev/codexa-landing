'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  {
    label: 'Resposta em até 24h',
    desc:  'Proposta detalhada enviada em no máximo um dia útil após o briefing. Sem enrolação.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: 'Proposta sem compromisso',
    desc:  'Não gostou do que viu? Tudo bem. Sem custo, sem pressão, sem obrigação de fechar.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: 'Contrato transparente',
    desc:  'Escopo, prazo, valor e titularidade do código definidos por escrito antes de começar.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

function GuaranteeCard({ item }: { item: typeof ITEMS[0] }) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  const onEnter = () => {
    gsap.to(cardRef.current, {
      y: -6,
      borderColor: 'rgba(0,214,245,0.3)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,214,245,0.12)',
      duration: 0.25, ease: 'power2.out',
    })
    gsap.fromTo(shineRef.current,
      { xPercent: -100 },
      { xPercent: 160, duration: 0.55, ease: 'power2.out' }
    )
  }

  const onLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      borderColor: 'rgba(255,255,255,0.09)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      duration: 0.3, ease: 'power2.out',
    })
    gsap.set(shineRef.current, { xPercent: -100 })
  }

  return (
    <div
      ref={cardRef}
      className="guarantee-item flex flex-col gap-5 cursor-default overflow-hidden"
      style={{
        background:   'linear-gradient(145deg, #1a1a22 0%, #131318 100%)',
        border:       '1px solid rgba(255,255,255,0.09)',
        borderRadius: '20px',
        padding:      '36px 32px',
        boxShadow:    '0 4px 24px rgba(0,0,0,0.3)',
        position:     'relative',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Shine */}
      <div
        ref={shineRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          transform:  'translateX(-100%)',
          zIndex:     1,
        }}
      />

      {/* Icon badge */}
      <div style={{
        width:          '52px',
        height:         '52px',
        borderRadius:   '14px',
        background:     'rgba(0,214,245,0.08)',
        border:         '1px solid rgba(0,214,245,0.22)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          '#00d6f5',
        flexShrink:     0,
        position:       'relative',
        zIndex:         2,
      }}>
        {item.icon}
      </div>

      {/* Label */}
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize:   '1.08rem',
        fontWeight: 700,
        color:      '#f0f0f6',
        lineHeight: 1.3,
        position:   'relative',
        zIndex:     2,
      }}>
        {item.label}
      </p>

      {/* Desc */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize:   '0.9rem',
        color:      'var(--text-muted)',
        lineHeight: 1.8,
        position:   'relative',
        zIndex:     2,
      }}>
        {item.desc}
      </p>
    </div>
  )
}

export function Guarantees() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.set('.guarantee-item', { opacity: 0, x: 72, scale: 0.93, rotateY: 8 })

    gsap.to('.guarantee-item', {
      opacity: 1, x: 0, scale: 1, rotateY: 0,
      duration: 0.75,
      stagger: 0.18,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 78%',
        toggleActions: 'play reverse play reverse',
      },
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      style={{
        background:    'var(--bg-section)',
        borderTop:     '1px solid rgba(255,255,255,0.05)',
        paddingTop:    '8rem',
        paddingBottom: '6rem',
      }}
    >
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ perspective: '1200px' }}>
          {ITEMS.map((item) => (
            <GuaranteeCard key={item.label} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
