'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Icons ──────────────────────────────────────────────── */
const IconGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const IconPhone = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
  </svg>
)

const IconLayout = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
)

const IconCpu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>
  </svg>
)

const IconCode = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)

const IconServer = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
    <path d="M6 6h.01M6 18h.01"/>
  </svg>
)

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 13L13 3M13 3H5M13 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Service data ───────────────────────────────────────── */
const SERVICES = [
  {
    id: '01',
    title:  'Sites & Landing Pages',
    desc:   'Presença digital que converte. Design sob medida, rápido e otimizado para SEO.',
    items:  ['Landing pages de alta conversão', 'Sites institucionais', 'Blogs e portfólios', 'CMS para o cliente editar'],
    icon:   IconGlobe,
    span:   'lg:col-span-2',
    featured: false,
  },
  {
    id: '02',
    title:  'Aplicativos Mobile',
    desc:   'iOS e Android com uma única base de código. Do MVP ao produto final.',
    items:  ['React Native + Expo', 'OTA updates sem app store', 'Integração com APIs existentes'],
    icon:   IconPhone,
    span:   'lg:col-span-1',
    featured: false,
  },
  {
    id: '03',
    title:  'Sistemas Web',
    desc:   'SaaS, plataformas e sistemas internos construídos para escalar.',
    items:  ['Multi-tenancy', 'Painel administrativo', 'Relatórios e dashboards'],
    icon:   IconLayout,
    span:   'lg:col-span-1',
    featured: false,
  },
  {
    id: '04',
    title:  'Automações com IA',
    desc:   'Processos que rodam sozinhos. Agentes inteligentes que economizam horas por semana.',
    items:  ['Agentes com Claude + n8n', 'Workflows de marketing', 'Integração com WhatsApp e email', 'Análise de dados com LLMs'],
    icon:   IconCpu,
    span:   'lg:col-span-2',
    featured: true,
  },
  {
    id: '05',
    title:  'APIs & Integrações',
    desc:   'Conectamos sistemas que precisam conversar. REST, GraphQL, webhooks.',
    items:  ['Stripe, PIX, Woovi', 'WhatsApp, Email, SMS', 'ERPs e sistemas legados'],
    icon:   IconCode,
    span:   'lg:col-span-1',
    featured: false,
  },
  {
    id: '06',
    title:  'Infraestrutura & Deploy',
    desc:   'Do código ao ar em minutos. CI/CD, monitoramento e escala quando precisar.',
    items:  ['Railway + Vercel', 'PostgreSQL + Redis', 'Logs, alertas e uptime'],
    icon:   IconServer,
    span:   'lg:col-span-1',
    featured: false,
  },
]

/* ── Card ───────────────────────────────────────────────── */
function ServiceCard({ service }: { service: typeof SERVICES[0] }) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const iconRef  = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const numRef   = useRef<HTMLSpanElement>(null)

  const Icon = service.icon

  const onEnter = () => {
    gsap.to(cardRef.current, {
      borderColor: service.featured
        ? 'rgba(232,0,109,0.7)'
        : 'rgba(232,0,109,0.45)',
      duration: 0.25,
      ease: 'power2.out',
    })
    gsap.to(iconRef.current, {
      color:    '#e8006d',
      rotate:   service.featured ? 15 : 8,
      scale:    1.15,
      duration: 0.3,
      ease:     'back.out(2)',
    })
    gsap.to(arrowRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.25,
      ease: 'power2.out',
    })
    gsap.to(numRef.current, {
      opacity: 0.12,
      duration: 0.3,
    })
  }

  const onLeave = () => {
    gsap.to(cardRef.current, {
      borderColor: 'rgba(255,255,255,0.07)',
      duration: 0.3,
      ease: 'power2.out',
    })
    gsap.to(iconRef.current, {
      color:    'var(--text-faint)',
      rotate:   0,
      scale:    1,
      duration: 0.3,
      ease:     'power2.out',
    })
    gsap.to(arrowRef.current, {
      opacity: 0,
      x: -6,
      duration: 0.2,
    })
    gsap.to(numRef.current, {
      opacity: 0.05,
      duration: 0.3,
    })
  }

  return (
    <div
      ref={cardRef}
      className={`service-card relative overflow-hidden rounded-2xl p-7 flex flex-col justify-between gap-6 ${service.span}`}
      style={{
        background:   service.featured
          ? 'linear-gradient(135deg, rgba(232,0,109,0.08) 0%, rgba(14,14,30,0.95) 60%)'
          : 'var(--bg-card)',
        border:       '1px solid rgba(255,255,255,0.07)',
        minHeight:    service.span === 'lg:col-span-2' ? '220px' : '200px',
        cursor:       'none',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Número decorativo */}
      <span
        ref={numRef}
        className="absolute top-4 right-6 font-bold pointer-events-none select-none"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   'clamp(4rem, 8vw, 7rem)',
          lineHeight: 1,
          color:      'var(--text)',
          opacity:    0.05,
          letterSpacing: '-0.05em',
        }}
      >
        {service.id}
      </span>

      {/* Top row: ícone + arrow */}
      <div className="flex items-start justify-between">
        <div
          ref={iconRef}
          style={{ color: 'var(--text-faint)' }}
        >
          <Icon />
        </div>

        <span
          ref={arrowRef}
          style={{
            color:   '#e8006d',
            opacity: 0,
            transform: 'translateX(-6px)',
            display: 'inline-block',
          }}
        >
          <IconArrow />
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 relative z-10">
        <h3
          className="text-xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          {service.title}
        </h3>

        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-muted)', maxWidth: '380px' }}
        >
          {service.desc}
        </p>

        {/* Deliverables */}
        <ul className="flex flex-wrap gap-2 mt-1">
          {service.items.map((item) => (
            <li
              key={item}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                fontFamily: 'var(--font-mono)',
                color:      service.featured ? 'rgba(232,0,109,0.9)' : 'var(--text-muted)',
                background: service.featured
                  ? 'rgba(232,0,109,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: service.featured
                  ? '1px solid rgba(232,0,109,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    // Header
    gsap.from('.services-header', {
      opacity: 0, y: 32, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
    })

    // Cards em stagger
    gsap.from('.service-card', {
      opacity: 0,
      y: 48,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 80%',
      },
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="servicos"
      className="py-28"
      style={{ background: 'var(--bg)' }}
    >
      <div className="page-container flex flex-col gap-14">

        {/* Header */}
        <div className="services-header flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
            >
              O que construímos
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Soluções digitais
              <br />
              <span style={{ color: '#e8006d' }}>sob medida</span>
            </h2>
          </div>

          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Cada projeto começa do zero — nada de template, nada de genérico.
            A tecnologia serve ao seu negócio.
          </p>
        </div>

        {/* Bento grid */}
        <div
          className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {SERVICES.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>

        {/* CTA sutil */}
        <div className="services-header flex justify-center">
          <a
            href="#contato"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e8006d')}
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
