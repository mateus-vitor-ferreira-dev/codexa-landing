'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Moon, Sun } from 'lucide-react'
import { prefersReducedMotion } from '@/lib/fx/motion'
import { useTilt } from '@/lib/fx/useTilt'
import { ScrambleText } from '@/lib/fx/ScrambleText'
import { DistortImage } from '@/components/fx/DistortImage'

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
  liveUrl?:   string   // sem URL: projeto entregue que não está mais no ar
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
    preview:    '/cases/mob-burger-web/preview.webp',
    liveUrl:    'https://pedidos.mobburger.digitalcodexa.com',
    displayUrl: 'pedidos.mobburger.digitalcodexa.com',
    status:     'Em produção',
  },
  {
    id:         '02',
    title:      'M.O.B Burger',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Uma página que vende antes mesmo do cliente terminar de rolar. Animações, galeria de produtos e CTA direto para o pedido — tudo pensado para converter visitante em cliente.',
    tags:       ['Next.js', 'GSAP', 'Tailwind', 'Cloudflare'],
    accent:     '#FFB000',
    preview:    '/cases/mob-burger-landing/preview.webp',
    liveUrl:    'https://mobburger.digitalcodexa.com',
    displayUrl: 'mobburger.digitalcodexa.com',
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
    preview:    '/cases/recanto-web/preview-light.webp',
    preview2:   '/cases/recanto-web/preview-dark.webp',
    displayUrl: 'recantovilarica.com.br',
    status:     'Entregue',
  },
  {
    id:         '04',
    title:      'Recanto Vila Rica',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Clientes chegam ao site, veem o espaço, consultam preços e já reservam — sem precisar ligar. A landing reduziu o atrito entre o interesse e a reserva confirmada.',
    tags:       ['Next.js', 'GSAP', 'Tailwind', 'Vercel'],
    accent:     '#c9a84c',
    preview:    '/cases/recanto-landing/preview.webp',
    displayUrl: 'recantovilarica.com.br',
    status:     'Entregue',
  },
  {
    id:         '05',
    title:      'Só+1',
    subtitle:   'Plataforma',
    type:       'SaaS — Esporte',
    desc:       'Achar jogo deixou de depender do grupo do WhatsApp. O jogador entra em uma partida aberta com um clique, vê vagas, local e valor na hora — em 12 modalidades diferentes.',
    tags:       ['React + Vite', 'Login com Google', 'Painel do jogador', 'Vercel'],
    accent:     '#22c55e',
    preview:    '/cases/somaisum-app/preview.webp',
    liveUrl:    'https://app.so-mais-um.com',
    displayUrl: 'app.so-mais-um.com',
    status:     'Em produção',
  },
  {
    id:         '06',
    title:      'Só+1',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'A página explica o produto em segundos e leva o jogador direto para o cadastro. Base de usuários construída antes mesmo da plataforma abrir oficialmente.',
    tags:       ['Next.js', 'Tailwind', 'SEO', 'Vercel'],
    accent:     '#22c55e',
    preview:    '/cases/somaisum-landing/preview.webp',
    liveUrl:    'https://so-mais-um.com',
    displayUrl: 'so-mais-um.com',
    status:     'No ar',
  },
  {
    id:         '07',
    title:      'MDMJ Transportes',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Quem compra em BH descobre em segundos que a MDMJ busca a carga e entrega em Lavras. O orçamento sai direto no WhatsApp, e páginas por cidade capturam quem procura frete no Google.',
    tags:       ['Next.js', 'SEO local', 'WhatsApp', 'Vercel'],
    accent:     '#f97316',
    preview:    '/cases/mdmj-landing/preview.webp',
    liveUrl:    'https://mdmjtransportes.com.br',
    displayUrl: 'mdmjtransportes.com.br',
    status:     'No ar',
  },
  {
    id:         '08',
    title:      'MDMJ Transportes',
    subtitle:   'Portal do Cliente',
    type:       'Sistema Web',
    desc:       'Painel de gestão da transportadora com acompanhamento de pedidos pelo cliente. Quem despachou consulta o status do frete sem precisar ligar para a empresa.',
    tags:       ['Next.js', 'Login com Google', 'Painel de gestão', 'Vercel'],
    accent:     '#f97316',
    preview:    '/cases/mdmj-app/preview.webp',
    liveUrl:    'https://app.mdmjtransportes.com.br',
    displayUrl: 'app.mdmjtransportes.com.br',
    status:     'Em produção',
  },
]

/* ── URL digitada ───────────────────────────────────────── */
/* A barra de endereço "digita" a URL quando o card entra, com caret de
   terminal. O texto completo fica no DOM para leitor de tela; a camada
   animada é só visual. Com reduced-motion a URL aparece pronta. */
function TypedUrl({ text, accent }: { text: string; accent: string }) {
  const rootRef  = useRef<HTMLSpanElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current, layer = layerRef.current, caret = caretRef.current
    if (!root || !layer || !caret || prefersReducedMotion()) return

    const blink = caret.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: 520, iterations: Infinity, direction: 'alternate', easing: 'steps(1, end)' })
    let timer = 0
    const hide = () => { caret.style.visibility = 'hidden' }
    const type = (i: number) => {
      layer.textContent = text.slice(0, i)
      if (i < text.length) {
        // cadência humana: mais rápido no meio, pausa curta nos pontos
        const ch = text[i]
        timer = window.setTimeout(() => type(i + 1), ch === '.' ? 90 : 22 + Math.random() * 34)
      } else {
        timer = window.setTimeout(hide, 1400)
      }
    }
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(timer)
      if (e.isIntersecting) {
        caret.style.visibility = 'visible'
        timer = window.setTimeout(() => type(0), 260)
      } else {
        // fora da tela volta ao estado "vazio" para digitar de novo na próxima entrada
        layer.textContent = ''
      }
    }, { threshold: 0.9 })
    layer.textContent = ''
    io.observe(root)
    return () => {
      io.disconnect(); clearTimeout(timer); blink.cancel()
      layer.textContent = text
      caret.style.visibility = 'hidden'
    }
  }, [text])

  return (
    <span ref={rootRef} className="flex items-center" style={{ minWidth: 0, overflow: 'hidden' }}>
      <span className="sr-only">{text}</span>
      <span
        ref={layerRef}
        aria-hidden="true"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }}
      >
        {text}
      </span>
      <span
        ref={caretRef}
        aria-hidden="true"
        style={{ width: '5px', height: '10px', marginLeft: '1px', flexShrink: 0, background: accent, visibility: 'hidden', borderRadius: '1px' }}
      />
    </span>
  )
}

/* ── Browser Mockup ─────────────────────────────────────── */
const PARALLAX = 48  // px que o print desliza dentro da moldura ao rolar

function BrowserMockup({ project }: { project: Project }) {
  const tiltRef    = useRef<HTMLDivElement>(null)
  const wrapRef    = useRef<HTMLAnchorElement>(null)
  const overRef    = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLSpanElement>(null)
  const [showAlt, setShowAlt] = useState(false)
  const hasDual    = !!project.preview2
  const isLive     = !!project.liveUrl

  // Tilt 3D num wrapper próprio: o <a> já tem o float do GSAP e o card a entrada
  useTilt(tiltRef, { max: 6, scale: 1.015, perspective: 1100 })

  /* Continuous float (parado com reduced-motion) */
  useEffect(() => {
    const el = wrapRef.current
    if (!el || prefersReducedMotion()) return
    const tween = gsap.to(el, {
      y: -9, duration: 3.2 + Math.random() * 0.8,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
    return () => { tween.kill() }
  }, [])

  /* Auto-toggle para projetos com dois temas (desligado com reduced-motion);
     só alterna enquanto o mockup está na tela */
  useEffect(() => {
    const el = wrapRef.current
    if (!hasDual || !el || prefersReducedMotion()) return
    let id = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id)
      if (e.isIntersecting) id = window.setInterval(() => setShowAlt((v) => !v), 3600)
    }, { threshold: 0.3 })
    io.observe(el)
    return () => { io.disconnect(); clearInterval(id) }
  }, [hasDual])

  const onEnter = () => {
    gsap.to(overRef.current, { opacity: 1, duration: 0.3 })
    gsap.to(btnRef.current, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
  }
  const onLeave = () => {
    gsap.to(overRef.current, { opacity: 0, duration: 0.3 })
    gsap.to(btnRef.current, { y: 10, opacity: 0, duration: 0.2 })
  }

  return (
    <div ref={tiltRef} className="relative">
      <a
        ref={wrapRef}
        href={project.liveUrl}
        target={isLive ? '_blank' : undefined}
        rel={isLive ? 'noopener noreferrer' : undefined}
        data-cursor={isLive ? 'ver' : undefined}
        className="block rounded-2xl overflow-hidden shrink-0 relative"
        style={{
          border:    '1px solid rgba(255,255,255,0.13)',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 50px ${project.accent}18`,
        }}
        onMouseEnter={isLive ? onEnter : undefined}
        onMouseLeave={isLive ? onLeave : undefined}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-3"
          style={{ height: '34px', background: '#0a0a0e', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
          {/* minWidth 0: sem isso o flex-1 não encolhe e o ellipsis da URL não funciona */}
          <div className="flex items-center gap-1.5 flex-1 h-5 rounded-md ml-2 px-2.5"
            style={{ background: 'rgba(255,255,255,0.07)', maxWidth: '260px', minWidth: 0 }}>
            <svg width="7" height="8" viewBox="0 0 8 9" fill="none" aria-hidden="true" style={{ color: project.accent, flexShrink: 0 }}>
              <rect x="1" y="4" width="6" height="5" rx="0.8" stroke="currentColor" strokeWidth="0.9"/>
              <path d="M2.5 4V2.5a1.5 1.5 0 0 1 3 0V4" stroke="currentColor" strokeWidth="0.9"/>
            </svg>
            <TypedUrl text={project.displayUrl} accent={project.accent} />
          </div>
          {/* Indicador de tema (só para projetos com dual preview) */}
          {hasDual && (
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: project.accent, opacity: 0.8,
                marginLeft: 'auto', whiteSpace: 'nowrap', paddingRight: '4px', flexShrink: 0,
              }}
            >
              {showAlt ? <Moon size={12} aria-hidden="true" /> : <Sun size={12} aria-hidden="true" />}
              <ScrambleText text={showAlt ? 'Tema escuro' : 'Tema claro'} duration={520} replayOnHover={false} />
            </span>
          )}
        </div>

        {/* Screenshot: a camada interna é mais alta que a moldura e desliza no scroll */}
        <div className="relative overflow-hidden" style={{ height: '380px' }}>
          <div className="case-parallax" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: -PARALLAX }}>
            <DistortImage
              src={project.preview}
              alt={`${project.title} — ${project.subtitle}`}
              src2={project.preview2}
              alt2={`${project.title} — tema escuro`}
              showAlt={showAlt}
              accent={project.accent}
              sizes="(max-width: 1024px) 100vw, 50vw"
              hostRef={wrapRef}
            />
          </div>
          {/* Overlay hover: degradê só na base para a distorção continuar visível */}
          {isLive && (
            <div ref={overRef} className="absolute inset-0 flex items-end justify-center pb-7"
              style={{ background: 'linear-gradient(to top, rgba(6,6,12,0.85) 0%, rgba(6,6,12,0.35) 38%, transparent 68%)', opacity: 0, zIndex: 2, pointerEvents: 'none' }}>
              <span
                ref={btnRef}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                  // Texto escuro: branco sobre os accents não passa no contraste
                  color: '#06060c', background: project.accent,
                  opacity: 0, transform: 'translateY(10px)',
                  boxShadow: `0 10px 30px ${project.accent}40`,
                }}
              >
                Visitar site
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
            </div>
          )}
        </div>

        {/* Reflexo de luz que segue o ponteiro (variáveis do useTilt herdadas do wrapper) */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 3,
            background: 'radial-gradient(520px circle at var(--tilt-x, 50%) var(--tilt-y, 50%), rgba(255,255,255,0.10), transparent 42%)',
            opacity: 'var(--tilt-active, 0)', transition: 'opacity .45s ease', mixBlendMode: 'screen',
          }} />
        {/* Borda brilhante: anel de 1px recortado por máscara, aceso perto do ponteiro */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            zIndex: 4, padding: '1px',
            background: `radial-gradient(260px circle at var(--tilt-x, 50%) var(--tilt-y, 50%), ${project.accent}, transparent 60%)`,
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
            opacity: 'var(--tilt-active, 0)', transition: 'opacity .45s ease',
          }} />
      </a>
    </div>
  )
}

/* ── Project Card ───────────────────────────────────────── */
function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const flip = index % 2 === 1
  const totalStr = String(total).padStart(2, '0')

  return (
    <div
      className="project-card grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center py-20"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Browser mockup — inverte ordem no flip */}
      <div className={flip ? 'lg:order-2' : 'lg:order-1'} style={{ minWidth: 0 }}>
        <BrowserMockup project={project} />
      </div>

      {/* Info */}
      <div className={`flex flex-col gap-6 ${flip ? 'lg:order-1' : 'lg:order-2'}`}>

        {/* Counter + type */}
        {/* flex-wrap: com fontes de 12px a linha não cabe em telas de 320px */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-3">
            <ScrambleText
              text={`${project.id}/${totalStr}`}
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '0.75rem',
                letterSpacing: '0.18em',
                color:         project.accent,
                opacity:       0.7,
              }}
            />
            {/* Progresso na série: um traço por case, aceso até o atual */}
            <span className="flex items-center gap-[3px]" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={`case-tick${i <= index ? ' is-on' : ''}`}
                  style={{
                    display: 'block', width: 8, height: 2, borderRadius: 1, transformOrigin: 'left center',
                    background: i <= index ? project.accent : 'rgba(255,255,255,0.12)',
                    opacity: i === index ? 1 : i < index ? 0.45 : 1,
                  }}
                />
              ))}
            </span>
          </span>
          <ScrambleText
            text={project.type}
            className="px-2.5 py-1 rounded-full text-xs uppercase tracking-wider"
            delay={120}
            style={{
              fontFamily: 'var(--font-mono)',
              color:      project.accent,
              background: `${project.accent}12`,
              border:     `1px solid ${project.accent}28`,
            }}
          />
          <span className="flex items-center gap-1.5">
            <span className="case-status-dot w-1.5 h-1.5 rounded-full" style={{ background: project.accent, boxShadow: `0 0 8px ${project.accent}` }} />
            <ScrambleText
              text={project.status}
              delay={240}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-faint)' }}
            />
          </span>
        </div>

        {/* Title */}
        <div>
          <ScrambleText
            as="p"
            text={project.subtitle}
            delay={180}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '6px' }}
          />
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

        {/* Stack: chips que entram em sequência */}
        <ul className="flex flex-wrap gap-2" aria-label="Tecnologias">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="case-tag px-2.5 py-1 rounded-md"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.04em',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tag}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start flex items-center gap-2 text-sm font-semibold"
          style={{
            fontFamily: 'var(--font-display)',
            minHeight:  44, // alvo de toque mínimo; o x fica só por conta do gsap
            color:      project.accent,
          }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 4, duration: 0.2 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.2 })}
        >
          Visitar projeto ao vivo
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
        )}
      </div>
    </div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function Cases() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    // Só anima sem reduced-motion; com ele os cards já ficam visíveis
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
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

        // Progresso da série e chips da stack entram em sequência junto com o card
        const trig = { trigger: card, start: 'top 75%', toggleActions: 'play none none reverse' }
        gsap.fromTo(card.querySelectorAll('.case-tick'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.45, ease: 'power2.out', stagger: 0.04, delay: 0.2, scrollTrigger: trig })
        gsap.fromTo(card.querySelectorAll('.case-tag'),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06, delay: 0.35, scrollTrigger: trig })

        // Ponto de status "respira" (pulso discreto, só enquanto há movimento permitido)
        gsap.to(card.querySelector('.case-status-dot'), {
          opacity: 0.35, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1,
        })

        // Parallax interno: o print rola dentro da moldura, como se o site descesse
        const layer = card.querySelector('.case-parallax')
        if (layer) {
          gsap.fromTo(layer, { y: 0 }, {
            y: -PARALLAX, ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          })
        }
      })
    }, sectionRef.current ?? undefined)
    return () => mm.revert()
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
