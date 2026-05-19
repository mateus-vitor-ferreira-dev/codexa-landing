'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CASES = [
  {
    id:       'recanto',
    title:    'Recanto Vila Rica',
    type:     'Sistema de Reservas',
    desc:     'Plataforma multi-tenant completa para gestão de eventos e reservas — com pagamentos PIX e Stripe, automações de notificação e painel administrativo.',
    tags:     ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'PIX', 'Railway'],
    result:   'Sistema em produção gerenciando reservas, pagamentos e relatórios para espaço de eventos.',
    featured: true,
    gradient: 'linear-gradient(135deg, #0e1a2e 0%, #0a1628 50%, #06111f 100%)',
    accent:   '#3b82f6',
    mockup: {
      type: 'dashboard',
      items: [
        { w: '60%', h: '10px', color: 'rgba(59,130,246,0.6)', mt: '0' },
        { w: '40%', h: '10px', color: 'rgba(59,130,246,0.3)', mt: '8px' },
        { w: '100%', h: '1px', color: 'rgba(255,255,255,0.07)', mt: '16px' },
        { w: '100%', h: '80px', color: 'rgba(59,130,246,0.06)', mt: '12px', radius: '8px' },
        { w: '100%', h: '80px', color: 'rgba(59,130,246,0.04)', mt: '8px', radius: '8px' },
      ],
    },
  },
  {
    id:       'futmatch',
    title:    'FutMatch',
    type:     'App Mobile',
    desc:     'Aplicativo para organizar peladas de futebol amador — sorteio de times, convites, ranking de jogadores e pagamento PIX.',
    tags:     ['React Native', 'Expo', 'Node.js', 'PIX'],
    result:   'MVP validado com usuários reais, funcionalidades de sorteio e convite por link funcionando.',
    featured: false,
    gradient: 'linear-gradient(135deg, #0e1a0e 0%, #0a180a 50%, #061006 100%)',
    accent:   '#22c55e',
    mockup: {
      type: 'mobile',
      items: [
        { w: '50%',  h: '10px', color: 'rgba(34,197,94,0.6)',  mt: '0' },
        { w: '70%',  h: '10px', color: 'rgba(34,197,94,0.25)', mt: '8px' },
        { w: '100%', h: '1px',  color: 'rgba(255,255,255,0.07)', mt: '14px' },
        { w: '100%', h: '55px', color: 'rgba(34,197,94,0.07)', mt: '12px', radius: '8px' },
        { w: '100%', h: '55px', color: 'rgba(34,197,94,0.04)', mt: '8px', radius: '8px' },
      ],
    },
  },
]

/* ── Decorative mockup ──────────────────────────────────── */
function Mockup({ project }: { project: typeof CASES[0] }) {
  return (
    <div className="relative w-full h-full p-5 flex flex-col justify-between">
      {/* Browser / phone chrome */}
      <div className="flex items-center gap-1.5 mb-4">
        {['#ff5f57','#febc2e','#28c840'].map((c) => (
          <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
        ))}
        <div
          className="ml-2 flex-1 h-5 rounded"
          style={{ background: 'rgba(255,255,255,0.04)', maxWidth: '160px' }}
        />
      </div>

      {/* Fake UI lines */}
      <div className="flex flex-col">
        {project.mockup.items.map((item, i) => (
          <div
            key={i}
            style={{
              width:        item.w,
              height:       item.h,
              background:   item.color,
              marginTop:    item.mt,
              borderRadius: (item as { radius?: string }).radius ?? '3px',
            }}
          />
        ))}
      </div>

      {/* Accent glow */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width:      '60%',
          height:     '60%',
          background: `radial-gradient(ellipse at bottom right, ${project.accent}22 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

/* ── Case Card ──────────────────────────────────────────── */
function CaseCard({ project }: { project: typeof CASES[0] }) {
  const cardRef    = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const imgRef     = useRef<HTMLDivElement>(null)

  const onEnter = () => {
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.to(imgRef.current,     { scale: 1.03, duration: 0.5, ease: 'power2.out' })
    gsap.to(cardRef.current,    {
      borderColor: `${project.accent}55`,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  const onLeave = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    gsap.to(imgRef.current,     { scale: 1,    duration: 0.4, ease: 'power2.out' })
    gsap.to(cardRef.current,    {
      borderColor: 'rgba(255,255,255,0.07)',
      duration: 0.3,
    })
  }

  return (
    <div
      ref={cardRef}
      className={`case-card relative rounded-2xl overflow-hidden cursor-default
        ${project.featured ? 'lg:col-span-2' : 'lg:col-span-1'}`}
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Mockup area */}
      <div
        className="relative overflow-hidden"
        style={{ height: project.featured ? '260px' : '200px', background: project.gradient }}
      >
        <div ref={imgRef} className="w-full h-full">
          <Mockup project={project} />
        </div>

        {/* Hover overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex items-center justify-center gap-3"
          style={{
            background: 'rgba(8,8,16,0.75)',
            backdropFilter: 'blur(4px)',
            opacity: 0,
          }}
        >
          <a
            href="#"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              fontFamily: 'var(--font-display)',
              background: project.accent,
              color:      '#fff',
            }}
          >
            Ver case
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 2M12 2H4M12 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        {/* Type badge */}
        <div
          className="absolute top-4 left-4 text-xs px-3 py-1 rounded-full"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'rgba(8,8,16,0.7)',
            color:      'var(--text-muted)',
            border:     '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {project.type}
        </div>
      </div>

      {/* Info */}
      <div
        className="p-6 flex flex-col gap-4"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            {project.title}
          </h3>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: '4px' }}
          >
            <path d="M3 13L13 3M13 3H5M13 3v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {project.desc}
        </p>

        {/* Result callout */}
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={{
            fontFamily: 'var(--font-mono)',
            color:      project.accent,
            background: `${project.accent}0f`,
            border:     `1px solid ${project.accent}22`,
          }}
        >
          ✓ {project.result}
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                color:      'var(--text-muted)',
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Placeholder card ───────────────────────────────────── */
function ComingSoonCard() {
  return (
    <div
      className="case-card lg:col-span-1 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[300px]"
      style={{
        border:     '1px dashed rgba(232,0,109,0.2)',
        background: 'rgba(232,0,109,0.02)',
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ border: '1px dashed rgba(232,0,109,0.3)' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="#e8006d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>
      <div className="text-center px-6">
        <p
          className="text-sm font-semibold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
        >
          Seu projeto aqui
        </p>
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
        >
          O próximo case pode ser o seu.
        </p>
      </div>
      <a
        href="#contato"
        className="text-xs px-4 py-2 rounded-lg transition-all"
        style={{
          fontFamily: 'var(--font-mono)',
          color:      '#e8006d',
          border:     '1px solid rgba(232,0,109,0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(232,0,109,0.08)'
          e.currentTarget.style.borderColor = 'rgba(232,0,109,0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background  = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(232,0,109,0.3)'
        }}
      >
        Iniciar projeto →
      </a>
    </div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function Cases() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.cases-header', {
      opacity: 0, y: 28, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    })

    gsap.from('.case-card', {
      opacity: 0, y: 48,
      duration: 0.65, stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cases-grid', start: 'top 80%' },
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="cases"
      className="py-28"
      style={{ background: 'var(--bg)' }}
    >
      <div className="page-container flex flex-col gap-14">

        {/* Header */}
        <div className="cases-header flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
            >
              Portfólio
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Projetos
              <br />
              <span style={{ color: '#e8006d' }}>entregues</span>
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Cada projeto começa com um problema real e termina em produção.
          </p>
        </div>

        {/* Grid */}
        <div className="cases-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
          {CASES.map((p) => <CaseCard key={p.id} project={p} />)}
          <ComingSoonCard />
        </div>

      </div>
    </section>
  )
}
