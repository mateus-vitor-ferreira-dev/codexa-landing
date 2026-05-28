'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Icons ──────────────────────────────────────────────── */
const IconGlobe = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconPhone = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
  </svg>
)
const IconLayout = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
)
const IconCpu = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>
  </svg>
)
const IconCode = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)
const IconServer = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
    <path d="M6 6h.01M6 18h.01"/>
  </svg>
)

/* ── Data ───────────────────────────────────────────────── */
const SERVICES = [
  {
    id: '01', category: 'Web Design',
    title: 'Sites & Landing Pages',
    desc: 'Presença digital que converte. Design sob medida, rápido e otimizado para SEO — do briefing ao ar.',
    tags: ['Alta conversão', 'Sites institucionais', 'CMS editável', 'SEO técnico'],
    icon: IconGlobe, accent: '#3b82f6', badge: null,
  },
  {
    id: '02', category: 'Mobile',
    title: 'Aplicativos Mobile',
    desc: 'iOS e Android com uma única base de código. Do MVP ao produto final com UX impecável.',
    tags: ['React Native + Expo', 'OTA updates', 'APIs nativas', 'Push notifications'],
    icon: IconPhone, accent: '#22c55e', badge: null,
  },
  {
    id: '03', category: 'SaaS',
    title: 'Sistemas Web',
    desc: 'SaaS, plataformas e sistemas internos construídos para escalar. Multi-tenant, painel admin, relatórios em tempo real.',
    tags: ['Multi-tenancy', 'Painel admin', 'Dashboards', 'Relatórios'],
    icon: IconLayout, accent: '#8b5cf6', badge: null,
  },
  {
    id: '04', category: 'IA · Automação',
    title: 'Automações com IA',
    desc: 'Processos que rodam sozinhos. Agentes inteligentes que economizam horas por semana do seu time.',
    tags: ['Claude + n8n', 'WhatsApp & email', 'Workflows', 'LLMs'],
    icon: IconCpu, accent: '#00d6f5', badge: 'Em alta',
  },
  {
    id: '05', category: 'Backend',
    title: 'APIs & Integrações',
    desc: 'Conectamos sistemas que precisam conversar. REST, GraphQL, webhooks — Stripe, PIX, ERPs e tudo mais.',
    tags: ['Stripe · PIX · Woovi', 'WhatsApp · SMS', 'ERPs legados', 'GraphQL'],
    icon: IconCode, accent: '#f59e0b', badge: null,
  },
  {
    id: '06', category: 'DevOps',
    title: 'Infraestrutura & Deploy',
    desc: 'Do código ao ar em minutos. CI/CD, monitoramento e escala automática quando você precisar.',
    tags: ['Railway + Vercel', 'PostgreSQL + Redis', 'Logs & alertas', 'CI/CD'],
    icon: IconServer, accent: '#06b6d4', badge: null,
  },
]

/* ── Card ───────────────────────────────────────────────── */
function ServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  const flip     = index % 2 === 1
  const cardRef  = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const iconRef  = useRef<HTMLDivElement>(null)
  const Icon     = service.icon

  /* Scroll entry — lateral slide bidirecional via direct ref */
  useGSAP(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, x: flip ? 70 : -70 },
      {
        opacity: 1, x: 0, duration: 0.75, ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 88%',
          toggleActions: 'play reverse play reverse',
        },
      }
    )
  }, { scope: cardRef })

  /* Continuous — float suave no ícone */
  useEffect(() => {
    const el = iconRef.current
    if (!el) return
    const tween = gsap.to(el, {
      y: -6,
      duration: 2.0 + (index % 3) * 0.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    return () => { tween.kill() }
  }, [index])

  /* Hover — brilho deslizante + lift */
  const onEnter = () => {
    gsap.to(cardRef.current, {
      y: -6,
      borderColor: `${service.accent}55`,
      boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${service.accent}22`,
      duration: 0.28, ease: 'power2.out',
    })
    gsap.fromTo(shineRef.current,
      { xPercent: -100 },
      { xPercent: 160, duration: 0.65, ease: 'power2.out' }
    )
    gsap.to(iconRef.current, { scale: 1.18, duration: 0.3, ease: 'back.out(2)' })
  }

  const onLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      borderColor: 'rgba(255,255,255,0.12)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      duration: 0.35, ease: 'power2.out',
    })
    gsap.set(shineRef.current, { xPercent: -100 })
    gsap.to(iconRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' })
  }

  return (
    <div
      ref={cardRef}
      className="service-card flex flex-col sm:flex-row rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, #1e1e26 0%, #141418 60%, #0e0e13 100%)`,
        border:     '1px solid rgba(255,255,255,0.12)',
        boxShadow:  '0 8px 32px rgba(0,0,0,0.35)',
        cursor:     'none',
        position:   'relative',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Brilho deslizante overlay */}
      <div
        ref={shineRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)',
          transform:  'translateX(-100%)',
        }}
      />

      {/* Icon block — alternates side */}
      <div
        className={`relative flex items-center justify-center flex-shrink-0 ${flip ? 'sm:order-2' : 'sm:order-1'}`}
        style={{
          width:      'clamp(160px, 22%, 220px)',
          minHeight:  '260px',
          background: `radial-gradient(ellipse at center, ${service.accent}30 0%, ${service.accent}10 65%, transparent 100%)`,
          borderRight: !flip ? `1px solid rgba(255,255,255,0.08)` : 'none',
          borderLeft:   flip ? `1px solid rgba(255,255,255,0.08)` : 'none',
        }}
      >
        {/* Corner accent dot */}
        <div style={{
          position: 'absolute', top: 14, left: flip ? 'auto' : 14, right: flip ? 14 : 'auto',
          width: 6, height: 6, borderRadius: '50%', background: service.accent, opacity: 0.6,
        }} />
        <div ref={iconRef} style={{ color: service.accent }}>
          <Icon size={38} />
        </div>
      </div>

      {/* Text block */}
      <div
        className={`flex flex-col justify-center flex-1 ${flip ? 'sm:order-1' : 'sm:order-2'}`}
        style={{
          paddingTop:    '3rem',
          paddingBottom: '3rem',
          paddingLeft:   flip ? '3rem' : '4rem',
          paddingRight:  flip ? '4rem' : '3rem',
        }}
      >
        {/* Category + badge */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            letterSpacing: '0.2em', textTransform: 'uppercase' as const,
            color: service.accent, opacity: 0.85,
          }}>
            {service.id} · {service.category}
          </span>
          {service.badge && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
              letterSpacing: '0.12em', textTransform: 'uppercase' as const,
              background: `${service.accent}20`, color: service.accent,
              border: `1px solid ${service.accent}40`,
              padding: '3px 10px', borderRadius: '99px',
            }}>
              {service.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-4" style={{
          fontFamily: 'var(--font-display)',
          fontSize:   'clamp(1.3rem, 2vw, 1.6rem)',
          fontWeight: 800,
          color:      '#f0f0f6',
          lineHeight: 1.2,
        }}>
          {service.title}
        </h3>

        {/* Description */}
        <p className="mb-6" style={{
          fontFamily: 'var(--font-body)',
          fontSize:   '1rem',
          fontWeight: 400,
          color:      '#b8b8cc',
          lineHeight: 1.6,
        }}>
          {service.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2.5">
          {service.tags.map((tag) => (
            <span key={tag} style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     '0.68rem',
              fontWeight:   500,
              color:        '#9090a8',
              background:   'rgba(255,255,255,0.06)',
              border:       '1px solid rgba(255,255,255,0.1)',
              padding:      '6px 14px',
              borderRadius: '6px',
              whiteSpace:   'nowrap' as const,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const reduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    gsap.fromTo('.services-h2-line',
      { yPercent: 105 },
      { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } }
    )
    gsap.fromTo('.services-header-sub',
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="servicos" className="py-36" style={{ background: 'transparent' }}>
      <div className="page-container flex flex-col gap-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              O que construímos
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
              <span className="block overflow-hidden pb-1">
                <span className="services-h2-line block">Soluções digitais</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="services-h2-line block" style={{ color: '#00d6f5' }}>sob medida.</span>
              </span>
            </h2>
          </div>
          <p className="services-header-sub leading-relaxed max-w-sm"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Cada projeto começa do zero — nada de template, nada de genérico.
            A tecnologia serve ao seu negócio.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-7">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <a
            href="https://mail.google.com/mail/?view=cm&to=mateus.ferreira10profissional%40gmail.com&su=Novo%20Projeto%20%E2%80%94%20Codexa&body=Ol%C3%A1!%20Gostaria%20de%20iniciar%20um%20projeto%20com%20a%20Codexa."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00d6f5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Não encontrou o que precisa? Vamos conversar
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
