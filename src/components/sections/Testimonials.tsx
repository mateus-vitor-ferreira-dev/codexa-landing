'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TESTIMONIALS = [
  {
    quote: 'A Codexa entregou o sistema de reservas no prazo e acima do esperado. A comunicação foi totalmente transparente do início ao fim — sabia exatamente o que estava sendo feito.',
    name:    'Cleide Mirin Pereira',
    role:    'Proprietária · Recanto Vila Rica · Lavras, MG',
    accent:  '#c9a84c',
    initials:'CM',
  },
  {
    quote: 'Nossa landing page ficou exatamente como imaginamos. O sistema de pedidos aumentou nossas vendas logo no primeiro mês. Qualidade técnica e visual muito acima da média.',
    name:    'Murilo Carvalho Campos',
    role:    'Sócio · M.O.B Burger · Lavras, MG',
    accent:  '#FF4500',
    initials:'MC',
  },
  {
    quote: 'Processo organizado e direto. Cada sprint tinha entregável real, dava pra acompanhar o progresso sem precisar ficar perguntando. Recomendo sem hesitar.',
    name:    'Johnatan Alves De Oliveira',
    role:    'CEO · FutMatch · Plataforma SaaS',
    accent:  '#22c55e',
    initials:'JA',
  },
]

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo('.testimonials-heading',
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          toggleActions: 'play reverse play reverse',
        },
      }
    )

    gsap.fromTo('.testimonial-card',
      { opacity: 0, y: 44, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.72, stagger: 0.14, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play reverse play reverse',
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="depoimentos" className="py-36"
      style={{ background: 'transparent', position: 'relative', zIndex: 0 }}>
      <div className="page-container flex flex-col gap-20">

        {/* Heading */}
        <div className="testimonials-heading flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              Depoimentos
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
              O que nossos<br />
              <span style={{ color: '#00d6f5' }}>clientes falam.</span>
            </h2>
          </div>
          <p className="leading-relaxed max-w-xs"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Projetos reais, clientes reais —<br />
            resultados que continuam no ar.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>

      </div>
    </section>
  )
}

/* ── Card ───────────────────────────────────────────────── */
function TestimonialCard({ testimonial: t }: { testimonial: typeof TESTIMONIALS[0] }) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  const onEnter = () => {
    gsap.to(wrapRef.current, {
      y: -6,
      borderColor: `${t.accent}44`,
      boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${t.accent}18`,
      duration: 0.28, ease: 'power2.out',
    })
    gsap.fromTo(shineRef.current,
      { xPercent: -100 },
      { xPercent: 160, duration: 0.65, ease: 'power2.out' }
    )
  }

  const onLeave = () => {
    gsap.to(wrapRef.current, {
      y: 0,
      borderColor: 'rgba(255,255,255,0.09)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      duration: 0.35, ease: 'power2.out',
    })
    gsap.set(shineRef.current, { xPercent: -100 })
  }

  return (
    <div
      ref={wrapRef}
      className="testimonial-card flex flex-col gap-6"
      style={{
        background: 'linear-gradient(145deg, #1e1e26 0%, #141418 60%, #0e0e13 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        borderRadius: '20px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Shine overlay */}
      <div ref={shineRef} className="pointer-events-none absolute inset-0 z-10" style={{
        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.055) 50%, transparent 70%)',
        transform: 'translateX(-100%)',
      }} />

      {/* Accent corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '120px', height: '120px',
        background: `radial-gradient(circle at top right, ${t.accent}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Quote mark */}
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0L16 3.2C11.2 4.267 8.533 7.2 8 12H14.4V24H0ZM17.6 24V14.4C17.6 6.4 22.4 1.6 32 0L33.6 3.2C28.8 4.267 26.133 7.2 25.6 12H32V24H17.6Z"
          fill={t.accent}
          fillOpacity="0.5"
        />
      </svg>

      {/* Quote text — flex-1 empurra o author para o fundo */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        lineHeight: 1.78,
        color: 'var(--text-muted)',
        flex: 1,
      }}>
        {t.quote}
      </p>

      {/* Author */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        marginTop: 'auto',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: `${t.accent}20`,
          border: `1px solid ${t.accent}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            fontWeight: 700, color: t.accent, letterSpacing: '0.04em',
          }}>
            {t.initials}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f6',
          }}>
            {t.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem', color: 'var(--text-faint)',
            letterSpacing: '0.06em',
          }}>
            {t.role}
          </span>
        </div>
      </div>
    </div>
  )
}
