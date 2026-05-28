'use client'

import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Data ───────────────────────────────────────────────── */
interface Project {
  id:         string
  title:      string
  subtitle:   string
  type:       string
  desc:       string
  tags:       string[]
  accent:     string
  preview:    string
  preview2?:  string   // segunda imagem para alternância de tema
  liveUrl:    string
  displayUrl: string
  status:     string
}

const PROJECTS: Project[] = [
  {
    id:         '01',
    title:      'M.O.B Burger',
    subtitle:   'Web App',
    type:       'Sistema de Pedidos',
    desc:       'O M.O.B deixou de depender de apps de delivery e passou a receber pedidos direto — sem pagar comissão. Sistema com PIX, cartão e painel em tempo real para a cozinha.',
    tags:       ['Next.js', 'Stripe', 'PostgreSQL', 'Railway'],
    accent:     '#FF4500',
    preview:    '/cases/mob-burger-web/preview.png',
    liveUrl:    'https://mob-burger-web.vercel.app',
    displayUrl: 'mob-burger-web.vercel.app',
    status:     'Em produção',
  },
  {
    id:         '02',
    title:      'M.O.B Burger',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Uma página que vende antes mesmo do cliente terminar de rolar. Animações, galeria de produtos e CTA direto para o pedido — tudo pensado para converter visitante em cliente.',
    tags:       ['Next.js', 'GSAP', 'Tailwind', 'Vercel'],
    accent:     '#FFB000',
    preview:    '/cases/mob-burger-landing/preview.png',
    liveUrl:    'https://mob-burger-landing.vercel.app',
    displayUrl: 'mob-burger-landing.vercel.app',
    status:     'No ar',
  },
  {
    id:         '03',
    title:      'Recanto Vila Rica',
    subtitle:   'Sistema Web',
    type:       'SaaS — Reservas',
    desc:       'O Recanto eliminou planilhas e o vai-e-vem de mensagens. Hoje reservas, pagamentos e confirmações acontecem no sistema — o dono acompanha tudo num único painel.',
    tags:       ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    accent:     '#c9a84c',
    preview:    '/cases/recanto-web/preview-light.png',
    preview2:   '/cases/recanto-web/preview-dark.png',
    liveUrl:    'https://recanto-vila-rica.vercel.app',
    displayUrl: 'recanto-vila-rica.vercel.app',
    status:     'Em produção',
  },
  {
    id:         '04',
    title:      'Recanto Vila Rica',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Clientes chegam ao site, veem o espaço, consultam preços e já reservam — sem precisar ligar. A landing reduziu o atrito entre o interesse e a reserva confirmada.',
    tags:       ['Next.js', 'GSAP', 'Tailwind', 'Vercel'],
    accent:     '#c9a84c',
    preview:    '/cases/recanto-landing/preview.png',
    liveUrl:    'https://recanto-vila-rica-landing.vercel.app',
    displayUrl: 'recanto-vila-rica-landing.vercel.app',
    status:     'No ar',
  },
  {
    id:         '05',
    title:      'FutMatch',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'A página comunica o valor do produto em segundos e converte visitante em usuário cadastrado. Base de usuários construída antes mesmo do app ser lançado oficialmente.',
    tags:       ['React', 'Tailwind', 'Vercel'],
    accent:     '#22c55e',
    preview:    '/cases/futmatch-landing/preview.png',
    liveUrl:    'https://futmatch-landing.vercel.app',
    displayUrl: 'futmatch-landing.vercel.app',
    status:     'No ar',
  },
]

/* ── Browser Mockup ─────────────────────────────────────── */
function BrowserMockup({ project }: { project: Project }) {
  const wrapRef    = useRef<HTMLAnchorElement>(null)
  const img1Ref    = useRef<HTMLDivElement>(null)
  const img2Ref    = useRef<HTMLDivElement>(null)
  const overRef    = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLSpanElement>(null)
  const themeRef   = useRef<HTMLSpanElement>(null)
  const [showAlt, setShowAlt] = useState(false)
  const hasDual    = !!project.preview2

  /* Continuous float */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const tween = gsap.to(el, {
      y: -9, duration: 3.2 + Math.random() * 0.8,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
    return () => { tween.kill() }
  }, [])

  /* Auto-toggle para projetos com dois temas */
  useEffect(() => {
    if (!hasDual) return
    const id = setInterval(() => {
      setShowAlt((v) => !v)
    }, 3200)
    return () => clearInterval(id)
  }, [hasDual])

  /* Crossfade entre imagens no toggle */
  useEffect(() => {
    if (!hasDual || !img1Ref.current || !img2Ref.current) return
    if (showAlt) {
      gsap.to(img1Ref.current, { opacity: 0, duration: 0.7, ease: 'power2.inOut' })
      gsap.to(img2Ref.current, { opacity: 1, duration: 0.7, ease: 'power2.inOut' })
      if (themeRef.current) themeRef.current.textContent = '◑ Tema escuro'
    } else {
      gsap.to(img1Ref.current, { opacity: 1, duration: 0.7, ease: 'power2.inOut' })
      gsap.to(img2Ref.current, { opacity: 0, duration: 0.7, ease: 'power2.inOut' })
      if (themeRef.current) themeRef.current.textContent = '◐ Tema claro'
    }
  }, [showAlt, hasDual])

  const onEnter = () => {
    gsap.to(img1Ref.current, { scale: 1.06, duration: 0.5, ease: 'power2.out' })
    if (img2Ref.current) gsap.to(img2Ref.current, { scale: 1.06, duration: 0.5, ease: 'power2.out' })
    gsap.to(overRef.current, { opacity: 1, duration: 0.25 })
    gsap.to(btnRef.current, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
  }
  const onLeave = () => {
    gsap.to(img1Ref.current, { scale: 1, duration: 0.5, ease: 'power2.out' })
    if (img2Ref.current) gsap.to(img2Ref.current, { scale: 1, duration: 0.5, ease: 'power2.out' })
    gsap.to(overRef.current, { opacity: 0, duration: 0.3 })
    gsap.to(btnRef.current, { y: 10, opacity: 0, duration: 0.2 })
  }

  return (
    <a
      ref={wrapRef}
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden shrink-0 relative"
      style={{
        border:    '1px solid rgba(255,255,255,0.13)',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 50px ${project.accent}18`,
        cursor:    'none',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 px-3"
        style={{ height: '34px', background: '#0a0a0e', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <div className="flex items-center gap-1.5 flex-1 h-5 rounded-md ml-2 px-2.5"
          style={{ background: 'rgba(255,255,255,0.07)', maxWidth: '260px' }}>
          <svg width="7" height="8" viewBox="0 0 8 9" fill="none" style={{ color: project.accent, flexShrink: 0 }}>
            <rect x="1" y="4" width="6" height="5" rx="0.8" stroke="currentColor" strokeWidth="0.9"/>
            <path d="M2.5 4V2.5a1.5 1.5 0 0 1 3 0V4" stroke="currentColor" strokeWidth="0.9"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {project.displayUrl}
          </span>
        </div>
        {/* Indicador de tema (só para projetos com dual preview) */}
        {hasDual && (
          <span
            ref={themeRef}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '8px',
              color: project.accent, opacity: 0.8,
              marginLeft: 'auto', whiteSpace: 'nowrap', paddingRight: '4px',
            }}
          >
            ◐ Tema claro
          </span>
        )}
      </div>

      {/* Screenshot */}
      <div className="relative overflow-hidden" style={{ height: '380px' }}>
        {/* Imagem principal */}
        <div
          ref={img1Ref}
          style={{ position: 'absolute', inset: 0, transformOrigin: 'center top' }}
        >
          <Image
            src={project.preview}
            alt={`${project.title} — ${project.subtitle}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ objectFit: 'cover', objectPosition: 'top' }}
          />
        </div>
        {/* Imagem alternativa (tema escuro / dual) */}
        {project.preview2 && (
          <div
            ref={img2Ref}
            style={{ position: 'absolute', inset: 0, transformOrigin: 'center top', opacity: 0 }}
          >
            <Image
              src={project.preview2}
              alt={`${project.title} — tema escuro`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        )}
        {/* Overlay hover */}
        <div ref={overRef} className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(9,9,11,0.58)', backdropFilter: 'blur(3px)', opacity: 0, zIndex: 2 }}>
          <span
            ref={btnRef}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{
              fontFamily: 'var(--font-display)', fontSize: '0.95rem',
              color: '#fff', background: project.accent,
              opacity: 0, transform: 'translateY(10px)',
            }}
          >
            Visitar site
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
      </div>
    </a>
  )
}

/* ── Project Card ───────────────────────────────────────── */
function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const flip = index % 2 === 1

  return (
    <div
      className="project-card grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center py-20"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Browser mockup — inverte ordem no flip */}
      <div className={flip ? 'lg:order-2' : 'lg:order-1'}>
        <BrowserMockup project={project} />
      </div>

      {/* Info */}
      <div className={`flex flex-col gap-6 ${flip ? 'lg:order-1' : 'lg:order-2'}`}>

        {/* Counter + type */}
        <div className="flex items-center gap-4">
          <span
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.65rem',
              letterSpacing: '0.18em',
              color:         project.accent,
              opacity:       0.7,
            }}
          >
            {project.id}/{String(total).padStart(2, '0')}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-mono)',
              color:      project.accent,
              background: `${project.accent}12`,
              border:     `1px solid ${project.accent}28`,
            }}
          >
            {project.type}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-faint)' }}>
              {project.status}
            </span>
          </span>
        </div>

        {/* Title */}
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {project.subtitle}
          </p>
          <h3
            className="font-bold leading-[1.08]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   'clamp(1.9rem, 3vw, 2.6rem)',
              fontWeight: 800,
              color:      '#f0f0f6',
            }}
          >
            {project.title}
          </h3>
        </div>

        {/* Description */}
        <p
          className="leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '440px' }}
        >
          {project.desc}
        </p>

        {/* CTA */}
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start flex items-center gap-2 text-sm font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            color:      project.accent,
            cursor:     'none',
          }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 4, duration: 0.2 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.2 })}
        >
          Visitar projeto ao vivo
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function Cases() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    // Heading
    gsap.fromTo('.cases-heading',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
    )

    // Desfoque → nítido — bidirecional
    gsap.utils.toArray<HTMLElement>('.project-card').forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 44, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 83%', toggleActions: 'play reverse play reverse' } }
      )
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="cases" className="py-36" style={{ background: 'transparent' }}>
      <div className="page-container">

        {/* Heading */}
        <div className="cases-heading mb-10">
          <p className="text-xs uppercase tracking-[0.2em] mb-4"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
            Portfólio
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2
              className="font-bold leading-[1.05]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text)' }}
            >
              Conheça nosso<br />trabalho.
            </h2>
            <p className="leading-relaxed max-w-xs"
              style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
              Projetos reais, em produção,<br />
              acessíveis agora mesmo — clique para visitar.
            </p>
          </div>
        </div>

        {/* Project cards — vertical carousel */}
        <div>
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={PROJECTS.length}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
