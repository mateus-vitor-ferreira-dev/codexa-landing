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
    liveUrl:    'https://mob-burger-web.desenvolvedoracodexa.workers.dev',
    displayUrl: 'mob-burger-web.desenvolvedoracodexa.workers.dev',
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
    liveUrl:    'https://mob-burger-landing.desenvolvedoracodexa.workers.dev',
    displayUrl: 'mob-burger-landing.desenvolvedoracodexa.workers.dev',
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

/* ── Capítulos por cliente ──────────────────────────────────
   No lugar de oito cards em sequência: um capítulo por cliente, com o
   nome em tipografia grande e as entregas como abas. A aba ativa troca o
   print, a descrição e a stack. A cor do cliente fica só na janela do
   navegador; o resto da seção usa a cor do tema. */
interface Client { name: string; projects: Project[] }

const CLIENTS: Client[] = PROJECTS.reduce<Client[]>((acc, p) => {
  const last = acc[acc.length - 1]
  if (last && last.name === p.title) last.projects.push(p)
  else acc.push({ name: p.title, projects: [p] })
  return acc
}, [])

const CSS = `
.case-chapter { border-top: 1px solid rgba(255,255,255,0.08); padding: 4rem 0; position: relative; }
.case-chapter:last-child { border-bottom: 1px solid rgba(255,255,255,0.08); }
.case-num {
  position: absolute; right: 0; top: 1.5rem; font-family: var(--font-display); font-weight: 800;
  font-size: clamp(7rem, 14vw, 12rem); line-height: 1; letter-spacing: -0.06em; color: transparent;
  -webkit-text-stroke: 1px rgba(var(--accent-rgb),0.12); pointer-events: none; user-select: none;
}
.case-kicker { font-family: var(--font-mono); font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--text-faint); margin: 0 0 .9rem; display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.case-kicker b { color: var(--accent); font-weight: 400; }
.case-name {
  margin: 0 0 1.75rem; font-family: var(--font-display); font-weight: 700; letter-spacing: -0.045em; line-height: .95;
  font-size: clamp(2.5rem, 5.2vw, 4.4rem); color: var(--text); position: relative;
}
.case-tabs { display: flex; flex-direction: column; border-top: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.75rem; }
.case-tab {
  display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 1rem; padding: .85rem 0; min-height: 44px;
  background: none; border: 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; color: inherit; position: relative;
}
.case-tab::before {
  content: ''; position: absolute; left: 0; bottom: -1px; height: 1px; width: 100%;
  background: linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb),0) 70%);
  transform: scaleX(0); transform-origin: left; transition: transform .6s cubic-bezier(.2,.8,.2,1);
}
.case-tab[aria-pressed="true"]::before { transform: scaleX(1); }
.case-tab-name { font-family: var(--font-serif); font-style: italic; font-weight: 500; font-size: 1.45rem; line-height: 1.15; color: var(--text-faint); transition: color .35s, transform .5s cubic-bezier(.2,.8,.2,1); }
.case-tab-type { font-family: var(--font-mono); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--text-faint); }
.case-tab:hover .case-tab-name { color: var(--text-muted); }
.case-tab[aria-pressed="true"] .case-tab-name { color: var(--text); transform: translateX(10px); }
.case-tab[aria-pressed="true"] .case-tab-type { color: var(--accent); }
.case-tab:only-child { pointer-events: none; }
.case-tab:only-child .case-tab-name { color: var(--text); transform: none; }

.case-status { display: inline-flex; align-items: center; gap: .45rem; }
.case-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px rgba(var(--accent-rgb),.9); animation: case-pulse 2.2s ease-in-out infinite; }
.case-desc { font-size: 1.02rem; line-height: 1.8; color: var(--text-muted); max-width: 46ch; margin: 0 0 1.25rem; }
.case-stack { list-style: none; margin: 0 0 1.75rem; padding: 0; display: flex; flex-wrap: wrap; gap: .3rem 0; font-family: var(--font-mono); font-size: .74rem; color: var(--text-faint); }
.case-stack li + li::before { content: '·'; margin: 0 .6rem; color: var(--accent); }
.case-cta {
  display: inline-flex; align-items: center; gap: .55rem; min-height: 44px; font-family: var(--font-mono); font-size: .8rem;
  color: var(--accent); border-bottom: 1px solid rgba(var(--accent-rgb),.35); transition: gap .3s, border-color .3s;
}
.case-cta:hover { gap: .9rem; border-color: var(--accent); }
.case-offline { font-family: var(--font-mono); font-size: .74rem; color: var(--text-faint); margin: 0; }

@keyframes case-pulse { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
@media (prefers-reduced-motion: reduce) {
  .case-status i { animation: none; }
  .case-tab-name, .case-tab::before { transition: none; }
}
`

function Chapter({ client, index }: { client: Client; index: number }) {
  const ref  = useRef<HTMLElement>(null)
  const [sel, setSel] = useState(0)
  const project = client.projects[sel]
  const flip = index % 2 === 1
  const num  = String(index + 1).padStart(2, '0')
  const tabsId = `case-${index}`

  // Troca de entrega: print e texto sobem em cascata (o primeiro render fica com a entrada da seção)
  const prevSel = useRef(sel)
  useGSAP(() => {
    if (prevSel.current === sel) return
    prevSel.current = sel
    if (prefersReducedMotion()) return
    gsap.fromTo(ref.current!.querySelectorAll('.case-anim'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true })
  }, { dependencies: [sel], scope: ref })

  return (
    <article ref={ref} className="case-chapter grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-10 lg:gap-20 items-center">
      <span className="case-num" aria-hidden="true">{num}</span>

      {/* Info */}
      <div className={flip ? 'lg:order-2' : ''} style={{ minWidth: 0 }}>
        <p className="case-kicker">
          <span><b>{num}</b> / {String(CLIENTS.length).padStart(2, '0')}</span>
          <span className="case-anim case-status"><i aria-hidden="true" />{project.status}</span>
        </p>
        <h3 className="case-name">{client.name}</h3>

        <div className="case-tabs" role="group" aria-label={`Entregas para ${client.name}`}>
          {client.projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="case-tab"
              aria-pressed={i === sel}
              aria-controls={tabsId}
              onClick={() => setSel(i)}
            >
              <span className="case-tab-name">{p.subtitle}</span>
              <span className="case-tab-type">{p.type}</span>
            </button>
          ))}
        </div>

        <div id={tabsId} className="case-body" aria-live="polite">
          <p className="case-anim case-desc">{project.desc}</p>
          <ul className="case-anim case-stack" aria-label="Tecnologias">
            {project.tags.map(tag => <li key={tag}>{tag}</li>)}
          </ul>
          <div className="case-anim">
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="case-cta">
                Visitar {project.displayUrl}
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </a>
            ) : (
              <p className="case-offline">Projeto entregue · não está mais no ar</p>
            )}
          </div>
        </div>
      </div>

      {/* Print: remonta a cada troca para a URL digitar de novo */}
      <div className={`case-anim ${flip ? 'lg:order-1' : ''}`} style={{ minWidth: 0 }}>
        <BrowserMockup key={project.id} project={project} />
      </div>
    </article>
  )
}

/* ── Section ────────────────────────────────────────────── */
export function Cases() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    // Só anima sem reduced-motion; com ele os capítulos já ficam visíveis
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.cases-h2-line',
        { yPercent: 105 },
        { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } }
      )
      gsap.fromTo('.cases-sub',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
      )

      gsap.utils.toArray<HTMLElement>('.case-chapter').forEach((chapter) => {
        // Nome do cliente, abas e texto sobem em cascata; o print entra desfocado
        gsap.fromTo(chapter.querySelectorAll('.case-kicker, .case-name, .case-tab, .case-body'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out',
            scrollTrigger: { trigger: chapter, start: 'top 80%', toggleActions: 'play reverse play reverse' } }
        )
        gsap.fromTo(chapter.querySelector('.case-num'),
          { yPercent: 30 },
          { yPercent: -30, ease: 'none',
            scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }
        )

        // Parallax interno: o print rola dentro da moldura, como se o site descesse.
        // Busca a camada a cada quadro porque a troca de aba remonta o mockup
        ScrollTrigger.create({
          trigger: chapter, start: 'top bottom', end: 'bottom top',
          onUpdate: (self) => {
            const layer = chapter.querySelector('.case-parallax')
            if (layer) gsap.set(layer, { y: -PARALLAX * self.progress })
          },
        })
      })
    }, sectionRef.current ?? undefined)
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="cases" className="py-24 lg:py-36" style={{ background: 'transparent' }}>
      <style>{CSS}</style>
      <div className="page-container">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 lg:mb-20">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
              <ScrambleText text="Portfólio" />
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
              <span className="block overflow-hidden pb-1">
                <span className="cases-h2-line block">Conheça nosso</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="cases-h2-line block" style={{ color: 'var(--accent)' }}>trabalho.</span>
              </span>
            </h2>
          </div>
          <p className="cases-sub leading-relaxed max-w-sm"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
            {CLIENTS.length} clientes, {PROJECTS.length} entregas reais — a maioria no ar agora mesmo.
            Escolha a entrega e clique para visitar.
          </p>
        </div>

        <div>
          {CLIENTS.map((client, i) => (
            <Chapter key={client.name} client={client} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
