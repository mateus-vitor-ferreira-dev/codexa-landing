'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NO_AR, PROJETOS_NO_AR } from '@/lib/numeros'
import { ScrambleText } from '@/lib/fx/ScrambleText'
import { prefersReducedMotion } from '@/lib/fx/motion'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: PROJETOS_NO_AR, suffix: '',  label: 'Projetos no ar',    sub: 'Em produção hoje', kicker: 'Online agora' },
  { value: 30,             suffix: 'd', label: 'Suporte incluso',   sub: 'Pós-entrega',      kicker: 'Depois da entrega' },
  { value: 24,             suffix: 'h', label: 'Tempo de resposta', sub: 'Garantido',        kicker: 'Para te responder' },
]

/* O número "re-conta" com glitch — dígitos embaralhados, separação RGB,
   tremida — e solta faíscas na cor do tema. Fora do componente: só roda em
   eventos (Math.random é impuro e não pode morar no corpo do render). */
function glitchRecount(el: HTMLElement, card: HTMLElement, stat: typeof STATS[0], done: () => void) {
  const final = String(stat.value)
  const proxy = { v: 0 }

  gsap.to(proxy, {
    v: stat.value, duration: 1.1, ease: 'power3.out',
    onUpdate() {
      const p = this.progress()
      el.textContent = p < 0.35
        ? final.replace(/[0-9]/g, () => String((Math.random() * 10) | 0))
        : String(Math.round(proxy.v))
    },
    onComplete() {
      el.textContent = final
      done()
    },
  })
  gsap.fromTo(el,
    { textShadow: '3px 0 rgba(255,0,90,.75), -3px 0 rgba(0,255,240,.75)' },
    { textShadow: '0px 0 rgba(255,0,90,0), 0px 0 rgba(0,255,240,0)', duration: 0.7, ease: 'power2.out' })
  gsap.fromTo(el, { x: -4, skewX: -8 }, { x: 0, skewX: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' })

  // Faíscas: nascem no centro do número e se espalham (o card tem overflow hidden)
  const cr = card.getBoundingClientRect()
  const nr = el.getBoundingClientRect()
  const ox = nr.left - cr.left + nr.width / 2
  const oy = nr.top  - cr.top  + nr.height / 2
  for (let k = 0; k < 16; k++) {
    const dot  = document.createElement('span')
    const size = 2 + Math.random() * 4
    dot.setAttribute('aria-hidden', 'true')
    Object.assign(dot.style, {
      position: 'absolute', left: `${ox}px`, top: `${oy}px`,
      width: `${size}px`, height: `${size}px`, marginLeft: `${-size / 2}px`, marginTop: `${-size / 2}px`,
      borderRadius: '50%', pointerEvents: 'none', zIndex: '4',
      background: k % 4 === 0 ? '#fff' : 'var(--accent)',
      boxShadow: '0 0 10px rgba(var(--accent-rgb),.9)',
    })
    card.appendChild(dot)
    const a = Math.random() * Math.PI * 2
    const d = 50 + Math.random() * 90
    gsap.fromTo(dot,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      {
        x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7,
        opacity: 0, scale: 0.2,
        duration: 0.7 + Math.random() * 0.5, ease: 'power3.out',
        onComplete: () => dot.remove(),
      })
  }
}

/* Instrumento de cada número: LEDs dos projetos no ar, régua dos 30 dias
   de suporte e o mostrador das 24h. Só decoração — o valor vai no texto. */
function Gauge({ i }: { i: number }) {
  if (i === 0) {
    return (
      <span className="st-leds" aria-hidden="true">
        {Array.from({ length: PROJETOS_NO_AR }, (_, k) => (
          <i key={k} style={{ animationDelay: `${k * 0.35}s` }} />
        ))}
      </span>
    )
  }
  if (i === 1) {
    return (
      <span className="st-ticks" aria-hidden="true">
        {Array.from({ length: 30 }, (_, k) => <i key={k} className="st-tick" />)}
      </span>
    )
  }
  return (
    <svg className="st-dial" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" />
      {Array.from({ length: 24 }, (_, k) => (
        <line key={k} x1="32" y1="5" x2="32" y2={k % 6 === 0 ? 11 : 8} transform={`rotate(${k * 15} 32 32)`} />
      ))}
      <line className="st-dial-hand" x1="32" y1="32" x2="32" y2="12" />
      <circle cx="32" cy="32" r="2.2" className="st-dial-dot" />
    </svg>
  )
}

const CSS = `
.st-panel { border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); display: grid; }
.st-col {
  position: relative; overflow: hidden; padding: 2.25rem 0 2.5rem;
  display: flex; flex-direction: column; gap: 1.1rem;
}
.st-side { display: grid; border-top: 1px solid rgba(255,255,255,0.08); }
.st-side .st-col + .st-col { border-top: 1px solid rgba(255,255,255,0.08); }
@media (min-width: 640px) {
  .st-side { grid-template-columns: 1fr 1fr; }
  .st-side .st-col + .st-col { border-top: 0; border-left: 1px solid rgba(255,255,255,0.08); padding-left: clamp(1.25rem, 3vw, 2.75rem); }
}
@media (min-width: 1024px) {
  .st-panel { grid-template-columns: 1.35fr 1fr; }
  .st-main { padding-right: clamp(2rem, 4vw, 4rem); }
  .st-side { grid-template-columns: 1fr; border-top: 0; border-left: 1px solid rgba(255,255,255,0.08); }
  .st-side .st-col { padding-left: clamp(2rem, 4vw, 4rem); }
  .st-side .st-col + .st-col { border-left: 0; border-top: 1px solid rgba(255,255,255,0.08); }
}
.st-col::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .5s;
  background: radial-gradient(420px circle at 30% 70%, rgba(var(--accent-rgb),0.09), transparent 65%);
}
.st-col:hover::after { opacity: 1; }
.st-main .st-num { font-size: clamp(6rem, 13vw, 11rem); }
.st-main-row { display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
.st-main-row .st-label { font-size: 1.35rem; }

/* Quadro de status: cada projeto no ar, com o endereço de verdade */
.st-live { list-style: none; margin: .5rem 0 0; padding: 0; border-top: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
.st-live li { border-bottom: 1px solid rgba(255,255,255,0.06); }
.st-live li:last-child { border-bottom: 0; }
.st-live a {
  display: grid; grid-template-columns: 10px 1fr auto; align-items: baseline; gap: .9rem; padding: .7rem 0; min-height: 44px;
  color: inherit; transition: padding .35s cubic-bezier(.2,.8,.2,1);
}
.st-live a:hover { padding-left: .5rem; }
.st-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,.9); align-self: center; animation: st-led 2.4s ease-in-out infinite; }
.st-live-name { font-family: var(--font-display); font-weight: 600; font-size: .98rem; color: var(--text); }
.st-live-name em { font-family: var(--font-serif); font-style: italic; font-weight: 500; color: var(--text-muted); margin-left: .45rem; }
.st-live-url { font-family: var(--font-mono); font-size: .7rem; color: var(--text-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 22ch; transition: color .3s; }
.st-live a:hover .st-live-url { color: var(--accent); }
@media (max-width: 639px) { .st-live-url { display: none; } }
.st-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 32px; }
.st-kicker { white-space: nowrap; font-family: var(--font-mono); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text-faint); }
.st-num {
  display: flex; align-items: baseline; line-height: .9; color: var(--text);
  font-family: var(--font-display); font-weight: 700; letter-spacing: -0.05em;
  font-size: clamp(4.5rem, 8.5vw, 7.75rem); font-variant-numeric: tabular-nums;
}
.st-num em {
  font-family: var(--font-serif); font-style: italic; font-weight: 500; letter-spacing: 0;
  color: var(--accent); font-size: .62em; margin-left: .06em;
}
.st-label { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--text); }
.st-sub { font-family: var(--font-mono); font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--text-faint); }

.st-leds { display: flex; gap: 7px; }
.st-leds i {
  width: 9px; height: 9px; border-radius: 50%; background: var(--accent);
  box-shadow: 0 0 10px rgba(var(--accent-rgb),.9); animation: st-led 2.4s ease-in-out infinite;
}
@keyframes st-led { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }

.st-ticks { display: flex; align-items: flex-end; gap: 2px; height: 22px; flex-shrink: 0; }
.st-tick { width: 2px; height: 100%; border-radius: 1px; background: rgba(var(--accent-rgb),.75); transform-origin: bottom; }
.st-tick:nth-child(7n) { height: 70%; }
.st-tick:nth-child(7n+3) { height: 85%; }

.st-dial { width: 32px; height: 32px; fill: none; stroke: rgba(var(--accent-rgb),.55); stroke-width: 1.4; }
.st-dial circle:first-child { stroke: rgba(255,255,255,.1); }
.st-dial-hand { stroke: var(--accent); stroke-width: 2; stroke-linecap: round; transform-origin: 32px 32px; animation: st-sweep 6s linear infinite; }
.st-dial-dot { fill: var(--accent); stroke: none; }
@keyframes st-sweep { to { transform: rotate(360deg) } }

@media (prefers-reduced-motion: reduce) {
  .st-leds i, .st-dial-hand, .st-live-dot { animation: none; }
}
`

export function Stats() {

  const sectionRef  = useRef<HTMLElement>(null)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const busy        = useRef<boolean[]>([])

  const setCounter = (i: number, el: HTMLSpanElement | null) => { counterRefs.current[i] = el }

  // Hover (ou toque): re-conta com glitch; trava para não empilhar replays
  const replay = (i: number, col: HTMLElement) => {
    const el = counterRefs.current[i]
    if (!el || busy.current[i] || prefersReducedMotion()) return
    busy.current[i] = true
    glitchRecount(el, col, STATS[i], () => { busy.current[i] = false })
  }

  useGSAP(() => {
    const mm = gsap.matchMedia()
    // Com reduced-motion: sem entrada, contadores já no valor final
    mm.add('(prefers-reduced-motion: reduce)', () => {
      counterRefs.current.forEach((el, i) => {
        if (el) el.textContent = String(STATS[i].value)
      })
    })
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const trigger = { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }

      gsap.fromTo('.stats-heading',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { ...trigger, start: 'top 84%' } })

      // Painel: a linha de cima "desenha" e as colunas sobem em cascata
      gsap.fromTo('.st-col',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: trigger })

      // Régua dos 30 dias: os dias acendem um a um
      gsap.fromTo('.st-tick',
        { scaleY: 0.12, opacity: 0.25 },
        { scaleY: 1, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out', scrollTrigger: trigger })

      // Contadores: o HTML já sai com o valor final (sem JS, ou antes da hidratação,
      // aparece o número certo); immediateRender: false evita zerar antes da rolagem
      counterRefs.current.forEach((el, i) => {
        if (!el) return
        const stat = STATS[i]
        const proxy = { val: 0 }
        gsap.fromTo(proxy,
          { val: 0 },
          {
            val: stat.value, duration: 1.8, ease: 'power2.out', delay: i * 0.12,
            immediateRender: false,
            onUpdate() { el.textContent = String(Math.round(proxy.val)) },
            scrollTrigger: trigger,
          }
        )
      })
    }, sectionRef.current ?? undefined)
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-24 lg:py-36" style={{ background: 'transparent' }}>
      <style>{CSS}</style>
      <div className="page-container flex flex-col gap-12 lg:gap-16">

        {/* Heading */}
        <div className="stats-heading flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
              <ScrambleText text="Em números" />
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'var(--text)' }}>
              Resultados que<br />
              <span style={{ color: 'var(--accent)' }}>ficam no ar.</span>
            </h2>
          </div>
          <p className="max-w-xs leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Nada de número inventado: cada projeto da lista está no ar agora — clique e confira.
          </p>
        </div>

        {/* Painel: projetos no ar (com a lista real) + suporte e resposta */}
        <div className="st-panel" data-orb-avoid="">
          <StatCol i={0} className="st-main" setCounter={setCounter} replay={replay}>
            <ul className="st-live" aria-label="Projetos no ar agora">
              {NO_AR.map(p => (
                <li key={p.id}>
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="ver">
                    <span className="st-live-dot" aria-hidden="true" />
                    <span className="st-live-name">{p.title}<em>{p.subtitle}</em></span>
                    <span className="st-live-url">{p.displayUrl}</span>
                  </a>
                </li>
              ))}
            </ul>
          </StatCol>
          <div className="st-side">
            <StatCol i={1} setCounter={setCounter} replay={replay} />
            <StatCol i={2} setCounter={setCounter} replay={replay} />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCol({ i, className = '', setCounter, replay, children }: {
  i: number
  className?: string
  setCounter: (i: number, el: HTMLSpanElement | null) => void
  replay: (i: number, col: HTMLElement) => void
  children?: React.ReactNode
}) {
  const stat = STATS[i]
  return (
    <div
      className={`st-col ${className}`}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') replay(i, e.currentTarget) }}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') replay(i, e.currentTarget) }}
    >
      <div className="st-head">
        <span className="st-kicker">{stat.kicker}</span>
        <Gauge i={i} />
      </div>

      {/* Leitor de tela lê o valor final; o número animado é só visual */}
      <div className="st-main-row">
        <span className="sr-only">{stat.value}{stat.suffix}</span>
        <span className="st-num" aria-hidden="true">
          <span ref={el => setCounter(i, el)} style={{ display: 'inline-block' }}>
            {stat.value}
          </span>
          {stat.suffix && <em>{stat.suffix}</em>}
        </span>
        <div className="flex flex-col gap-1.5 pb-2">
          <span className="st-label">{stat.label}</span>
          <ScrambleText text={stat.sub} className="st-sub" />
        </div>
      </div>
      {children}
    </div>
  )
}
