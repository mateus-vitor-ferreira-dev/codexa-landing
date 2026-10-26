'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleText } from '@/lib/fx/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

/* ── Icons ──────────────────────────────────────────────── */
const IconGlobe = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconPhone = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
  </svg>
)
const IconLayout = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
)
const IconMenu = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12a1 1 0 0 1 1 1v18l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1z"/><path d="M9 7h6M9 11h6M9 15h3"/>
  </svg>
)
const IconCpu = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>
  </svg>
)
const IconCode = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)
const IconServer = ({ size = 36 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
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
    icon: IconGlobe, badge: null,
  },
  {
    id: '02', category: 'Food service',
    title: 'Cardápios Digitais',
    desc: 'Seu cardápio no celular do cliente, sem app para baixar. Ele monta o pedido e você recebe tudo pronto no WhatsApp — sem pagar comissão para plataforma de delivery.',
    tags: ['Pedido no WhatsApp', 'QR Code na mesa', 'Painel de preços', 'Sem comissão'],
    icon: IconMenu, badge: 'Novo',
  },
  {
    id: '03', category: 'Mobile',
    title: 'Aplicativos Mobile',
    desc: 'iOS e Android com uma única base de código. Do MVP ao produto final com UX impecável.',
    tags: ['React Native + Expo', 'OTA updates', 'APIs nativas', 'Push notifications'],
    icon: IconPhone, badge: null,
  },
  {
    id: '04', category: 'SaaS',
    title: 'Sistemas Web',
    desc: 'SaaS, plataformas e sistemas internos construídos para escalar. Multi-tenant, painel admin, relatórios em tempo real.',
    tags: ['Multi-tenancy', 'Painel admin', 'Dashboards', 'Relatórios'],
    icon: IconLayout, badge: null,
  },
  {
    id: '05', category: 'IA · Automação',
    title: 'Automações com IA',
    desc: 'Processos que rodam sozinhos. Agentes inteligentes que economizam horas por semana do seu time.',
    tags: ['Claude + n8n', 'WhatsApp & email', 'Workflows', 'LLMs'],
    icon: IconCpu, badge: 'Em alta',
  },
  {
    id: '06', category: 'Backend',
    title: 'APIs & Integrações',
    desc: 'Conectamos sistemas que precisam conversar. REST, GraphQL, webhooks — Stripe, PIX, ERPs e tudo mais.',
    tags: ['Stripe · PIX · Woovi', 'WhatsApp · SMS', 'ERPs legados', 'GraphQL'],
    icon: IconCode, badge: null,
  },
  {
    id: '07', category: 'DevOps',
    title: 'Infraestrutura & Deploy',
    desc: 'Do código ao ar em minutos. CI/CD, monitoramento e escala automática quando você precisar.',
    tags: ['Railway + Vercel', 'PostgreSQL + Redis', 'Logs & alertas', 'CI/CD'],
    icon: IconServer, badge: null,
  },
]

/* ── Índice ─────────────────────────────────────────────────
   No lugar dos cards: um índice editorial. No desktop a lista fica à
   esquerda e o serviço ativo (hover, foco ou clique) abre no painel fixo
   à direita. No celular cada linha já traz descrição e tecnologias. */
type Service = typeof SERVICES[0]

function Row({ service, active, onActivate }: { service: Service; active: boolean; onActivate: () => void }) {
  const Icon = service.icon
  return (
    <li className="svc-row" data-active={active ? '' : undefined}>
      <h3 className="svc-row-h">
      <button
        type="button"
        className="svc-row-btn"
        aria-pressed={active}
        aria-controls="servicos-detalhe"
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') onActivate() }}
        onFocus={onActivate}
        onClick={onActivate}
        data-cursor="ver"
      >
        <span className="svc-row-id" aria-hidden="true">{service.id}</span>
        <span className="svc-row-title">
          <span className="svc-row-name">{service.title}</span>
          {service.badge && <span className="svc-badge">{service.badge}</span>}
        </span>
        <span className="svc-row-cat">{service.category}</span>
        <span className="svc-row-arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      </h3>

      {/* Celular: detalhe na própria linha (o painel lateral só existe no desktop) */}
      <div className="svc-row-detail">
        <span className="svc-row-icon" aria-hidden="true"><Icon size={18} /></span>
        <p>{service.desc}</p>
        <p className="svc-row-tags">{service.tags.join('  ·  ')}</p>
      </div>
    </li>
  )
}

function Detail({ service }: { service: Service }) {
  const Icon = service.icon
  const ref = useRef<HTMLDivElement>(null)

  // Troca de serviço: o conteúdo sobe e aparece em cascata
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(ref.current!.querySelectorAll('.svc-anim'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true })
  }, { dependencies: [service.id], scope: ref })

  return (
    <div ref={ref} className="svc-detail">
      {/* Numeral gigante vazado ao fundo */}
      <span className="svc-detail-num" aria-hidden="true">{service.id}</span>

      <div className="svc-anim svc-detail-emblem" aria-hidden="true">
        <svg className="svc-detail-dial" viewBox="0 0 120 120">
          {Array.from({ length: 48 }, (_, k) => (
            <line key={k} x1="60" y1="4" x2="60" y2={k % 4 === 0 ? 12 : 8}
              transform={`rotate(${k * 7.5} 60 60)`} />
          ))}
        </svg>
        <Icon size={40} />
      </div>

      <p className="svc-anim svc-detail-cat">
        <span style={{ color: 'var(--accent)' }}>{service.id}</span> / {service.category}
      </p>
      <p className="svc-anim svc-detail-title">{service.title}</p>
      <p className="svc-anim svc-detail-desc">{service.desc}</p>

      <ul className="svc-anim svc-detail-tags">
        {service.tags.map(tag => (
          <li key={tag}><span aria-hidden="true">→</span>{tag}</li>
        ))}
      </ul>

      <a
        href="#contato"
        className="svc-anim svc-detail-cta"
        onClick={(e) => { e.preventDefault(); document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }) }}
      >
        Falar sobre {service.title.toLowerCase()}
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>
  )
}

const CSS = `
.svc-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(255,255,255,0.08); }
.svc-row { border-bottom: 1px solid rgba(255,255,255,0.08); position: relative; }
.svc-row::before {
  content: ''; position: absolute; left: 0; bottom: -1px; height: 1px; width: 100%;
  background: linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb),0) 70%);
  transform: scaleX(0); transform-origin: left; transition: transform .6s cubic-bezier(.2,.8,.2,1);
}
.svc-row[data-active]::before { transform: scaleX(1); }
.svc-row-btn {
  width: 100%; display: grid; grid-template-columns: 3.25rem 1fr auto; align-items: baseline;
  gap: 0 1rem; padding: 1.6rem 0 1.1rem; background: none; border: 0; text-align: left; color: inherit;
}
.svc-row-id { font-family: var(--font-mono); font-size: .75rem; color: var(--text-faint); letter-spacing: .1em; transition: color .3s; }
.svc-row-title { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.svc-row-h { margin: 0; font: inherit; }
.svc-row-name { display: inline-block;
  font-family: var(--font-display); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;
  font-size: clamp(1.45rem, 2.2vw, 2rem); color: var(--text);
  transition: color .35s, transform .5s cubic-bezier(.2,.8,.2,1), opacity .35s;
}
.svc-badge {
  font-family: var(--font-mono); font-size: .65rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--accent); border: 1px solid rgba(var(--accent-rgb),.4); border-radius: 999px; padding: 2px 9px;
}
.svc-row-cat {
  grid-column: 2; font-family: var(--font-mono); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase;
  color: var(--text-faint); margin-top: .45rem;
}
.svc-row-arrow { display: none; }
.svc-row-detail { display: grid; grid-template-columns: 3.25rem 1fr; gap: .6rem 1rem; padding: 0 0 1.6rem; }
.svc-row-detail p { grid-column: 2; margin: 0; font-size: .95rem; line-height: 1.7; color: var(--text-muted); }
.svc-row-detail .svc-row-tags { font-family: var(--font-mono); font-size: .72rem; line-height: 1.8; color: var(--text-faint); }
.svc-row-icon { grid-row: 1; color: var(--accent); padding-top: .3rem; }

@media (min-width: 1024px) {
  .svc-row-detail { display: none; }
  .svc-row-btn { grid-template-columns: 3.25rem 1fr auto 2rem; padding: 1.7rem 0; align-items: center; }
  .svc-row-cat { grid-column: 3; margin: 0; text-align: right; }
  .svc-row-arrow { display: flex; color: var(--accent); opacity: 0; transform: translateX(-10px); transition: opacity .35s, transform .45s cubic-bezier(.2,.8,.2,1); }
  /* lista "acende" só o ativo e apaga os outros */
  .svc-list:is(:hover, :focus-within) .svc-row:not([data-active]) .svc-row-name { opacity: .32; }
  .svc-row[data-active] .svc-row-name { transform: translateX(14px); color: var(--text); }
  .svc-row[data-active] .svc-row-id,
  .svc-row[data-active] .svc-row-cat { color: var(--accent); }
  .svc-row[data-active] .svc-row-arrow { opacity: 1; transform: none; }
}

.svc-detail { position: relative; padding: 2.5rem 0 0 2.5rem; border-left: 1px solid rgba(255,255,255,0.08); min-height: 520px; }
.svc-detail-num {
  position: absolute; right: -0.5rem; top: -2.5rem; font-family: var(--font-display); font-weight: 800;
  font-size: 13rem; line-height: 1; letter-spacing: -0.06em; color: transparent;
  -webkit-text-stroke: 1px rgba(var(--accent-rgb),0.12); pointer-events: none; user-select: none;
}
.svc-detail-emblem { position: relative; width: 120px; height: 120px; display: grid; place-items: center; color: var(--accent); margin-bottom: 2rem; }
.svc-detail-dial { position: absolute; inset: 0; stroke: rgba(var(--accent-rgb),.45); stroke-width: 1; animation: svc-spin 40s linear infinite; }
.svc-detail-emblem::after {
  content: ''; position: absolute; inset: 26px; border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-rgb),.16), transparent 70%);
}
.svc-detail-cat { font-family: var(--font-mono); font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; color: var(--text-faint); margin: 0 0 .9rem; }
.svc-detail-title { font-family: var(--font-serif); font-style: italic; font-weight: 500; font-size: 2.6rem; line-height: 1.05; color: var(--text); margin: 0 0 1.1rem; }
.svc-detail-desc { font-size: 1.05rem; line-height: 1.8; color: #b9b9cb; max-width: 44ch; margin: 0 0 1.75rem; }
.svc-detail-tags { list-style: none; margin: 0 0 2.25rem; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: .7rem 1.5rem; }
.svc-detail-tags li { font-family: var(--font-mono); font-size: .78rem; color: var(--text-muted); display: flex; gap: .6rem; }
.svc-detail-tags li span { color: var(--accent); }
.svc-detail-cta {
  display: inline-flex; align-items: center; gap: .55rem; font-family: var(--font-mono); font-size: .8rem;
  color: var(--accent); border-bottom: 1px solid rgba(var(--accent-rgb),.35); padding-bottom: 4px; transition: gap .3s, border-color .3s;
}
.svc-detail-cta:hover { gap: .9rem; border-color: var(--accent); }
@keyframes svc-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .svc-detail-dial { animation: none; }
  .svc-row-name, .svc-row::before { transition: none; }
}
`

/* ── Section ────────────────────────────────────────────── */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    // Com reduced-motion: título, subtítulo e lista já no estado final
    mm.add('(prefers-reduced-motion: no-preference)', () => {
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
      // Linhas do índice sobem em cascata
      gsap.fromTo('.svc-row',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: '.svc-list', start: 'top 82%', toggleActions: 'play reverse play reverse' } }
      )
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="servicos" className="py-24 lg:py-36" style={{ background: 'transparent' }}>
      <style>{CSS}</style>
      <div className="page-container flex flex-col gap-14 lg:gap-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
              <ScrambleText text="O que construímos" />
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
              <span className="block overflow-hidden pb-1">
                <span className="services-h2-line block">Soluções digitais</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="services-h2-line block" style={{ color: 'var(--accent)' }}>sob medida.</span>
              </span>
            </h2>
          </div>
          <p className="services-header-sub leading-relaxed max-w-sm"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Cada projeto começa do zero — nada de template, nada de genérico.
            A tecnologia serve ao seu negócio.
          </p>
        </div>

        {/* Índice + painel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-12 lg:gap-16 items-start">
          <ul className="svc-list" data-orb-avoid="">
            {SERVICES.map((service, i) => (
              <Row key={service.id} service={service} active={i === active} onActivate={() => setActive(i)} />
            ))}
          </ul>
          <div id="servicos-detalhe" aria-live="polite" data-orb-avoid="" className="hidden lg:block lg:sticky lg:top-32">
            <Detail service={SERVICES[active]} />
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <a
            href="#contato"
            onClick={(e) => { e.preventDefault(); document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="flex items-center gap-2 transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Não encontrou o que precisa? Vamos conversar
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
