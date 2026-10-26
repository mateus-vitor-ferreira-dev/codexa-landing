'use client'

import { forwardRef, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleText } from '@/lib/fx/ScrambleText'
/* Cada promessa tem o texto completo (leitor de tela) e uma versão curta
   para a faixa. A faixa de cima é Syne cheia; a de baixo, serif itálico vazado,
   correndo no sentido contrário. */
const PROMISES = [
  { label: 'Código 100% seu — sem lock-in',              short: 'Código 100% seu',     row: 0 },
  { label: 'Escopo claro antes de assinar',              short: 'Escopo claro',        row: 0 },
  { label: 'Deploy em produção dentro do prazo',         short: 'Deploy no prazo',     row: 0 },
  { label: 'Suporte pós-entrega garantido',              short: 'Suporte pós-entrega', row: 0 },
  { label: 'Revisões inclusas — sem surpresas',          short: 'Revisões inclusas',   row: 0 },
  { label: 'Transparência total no processo',           short: 'transparência total', row: 1 },
  { label: 'Parceria de longo prazo, não projeto único', short: 'parceria de longo prazo', row: 1 },
  { label: 'Comunicação ativa durante todo o projeto',   short: 'comunicação ativa',   row: 1 },
  { label: 'Atendimento próximo e sem burocracia',       short: 'sem burocracia',      row: 1 },
  { label: 'Segurança e boas práticas em cada linha',    short: 'segurança em cada linha', row: 1 },
]

gsap.registerPlugin(ScrollTrigger)

const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

// Estrela de quatro pontas entre as frases
const Star = () => (
  <svg className="pm-star" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0Z" />
  </svg>
)

// Faixa animada é só decorativa: o leitor de tela lê a <ul> abaixo
const Track = forwardRef<HTMLDivElement, { row: 0 | 1 }>(function Track({ row }, ref) {
  const items = PROMISES.filter(p => p.row === row)
  const doubled = [...items, ...items]
  return (
    <div ref={ref} aria-hidden="true" className={`pm-track pm-row-${row}`}>
      {doubled.map((p, i) => (
        <span key={i} className="pm-item">
          <span className="pm-text">{p.short}</span>
          <Star />
        </span>
      ))}
    </div>
  )
})

const CSS = `
.pm-band { position: relative; overflow: hidden; padding: clamp(48px, 7vw, 96px) 0; }
.pm-band::before, .pm-band::after {
  content: ''; position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb),.35) 50%, transparent);
}
.pm-band::before { top: 0 } .pm-band::after { bottom: 0 }
.pm-rows { display: flex; flex-direction: column; gap: clamp(4px, 1vw, 14px); transform-origin: center; will-change: transform; }
.pm-track { display: flex; align-items: center; width: max-content; will-change: transform; }
.pm-item { display: inline-flex; align-items: center; flex-shrink: 0; white-space: nowrap; }
.pm-text { transition: color .35s, -webkit-text-stroke-color .35s; }
.pm-row-0 .pm-text {
  font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: -0.035em;
  font-size: clamp(2.1rem, 5.6vw, 5rem); line-height: 1.05; color: var(--text);
}
.pm-row-1 .pm-text {
  font-family: var(--font-serif); font-style: italic; font-weight: 500; letter-spacing: -0.01em;
  font-size: clamp(2.4rem, 6.2vw, 5.6rem); line-height: 1.05;
  color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.42);
}
.pm-item:hover .pm-text { color: var(--accent); -webkit-text-stroke-color: var(--accent); }
.pm-star { width: clamp(16px, 2vw, 28px); height: clamp(16px, 2vw, 28px); margin: 0 clamp(20px, 3vw, 44px); fill: var(--accent); flex-shrink: 0; }
.pm-row-1 .pm-star { fill: none; stroke: rgba(var(--accent-rgb),.7); stroke-width: 1; }
.pm-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-bottom: clamp(20px, 3vw, 36px);
}
.pm-label { font-family: var(--font-mono); font-size: .75rem; letter-spacing: .22em; text-transform: uppercase; color: var(--text-faint); margin: 0; }
.promises-marquee-toggle {
  min-height: 44px; padding: 0 0 0 16px; background: transparent; border: none;
  font-family: var(--font-mono); font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--text-faint); transition: color .2s; display: inline-flex; align-items: center; gap: 8px;
}
.promises-marquee-toggle:hover, .promises-marquee-toggle:focus-visible { color: var(--text); }
`

export function PromisesMarquee() {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false)
  // null = visitante não mexeu; aí vale o reduced-motion
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const paused = userPaused ?? reduced
  const topRef   = useRef<HTMLDivElement>(null)
  const botRef   = useRef<HTMLDivElement>(null)
  const rowsRef  = useRef<HTMLDivElement>(null)
  const rootRef  = useRef<HTMLDivElement>(null)
  const loopRef  = useRef<gsap.core.Timeline | null>(null)

  /* Faixa movida pelo GSAP (não CSS) para a velocidade poder reagir à
     rolagem: rolar rápido acelera a faixa, rolar para cima inverte o
     sentido por um instante, e tudo volta suave à velocidade base.
     Mouse em cima desacelera até parar (em vez de travar seco).
     As duas faixas correm em sentidos opostos e o bloco inclina um
     pouco na direção da rolagem rápida. */
  useEffect(() => {
    const top = topRef.current, bot = botRef.current, rows = rowsRef.current, root = rootRef.current
    if (!top || !bot || !rows || !root) return
    const loop = gsap.timeline({ repeat: -1 })
      .fromTo(top, { xPercent: 0 },   { xPercent: -50, duration: 46, ease: 'none' }, 0)
      .fromTo(bot, { xPercent: -50 }, { xPercent: 0,   duration: 52, ease: 'none' }, 0)
    loopRef.current = loop
    const skew = gsap.quickTo(rows, 'skewX', { duration: 0.5, ease: 'power3.out' })

    let dir = 1, boost = 0, hover = 1, speed = 1
    // Com reduced-motion a faixa só anda se o visitante pedir, e sem o efeito da rolagem
    const calm = window.matchMedia(REDUCED).matches
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        if (calm) return
        const v = self.getVelocity()            // px/s, com sinal
        if (Math.abs(v) > 30) dir = v < 0 ? -1 : 1
        boost = Math.max(boost, Math.min(Math.abs(v) / 260, 7))
      },
    })
    const tick = () => {
      boost *= 0.92
      const want = dir * (1 + boost) * hover
      speed += (want - speed) * 0.08
      loop.timeScale(speed)
      skew(calm ? 0 : -dir * Math.min(boost, 6) * 1.1)
    }
    const onEnter = () => { hover = 0 }
    const onLeave = () => { hover = 1 }
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      st.kill(); loop.kill(); loopRef.current = null
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      gsap.set([top, bot, rows], { clearProps: 'transform' })
    }
  }, [])

  useEffect(() => {
    const loop = loopRef.current
    if (!loop) return
    if (paused) loop.pause()
    else loop.play()
  }, [paused])

  return (
    <section aria-label="O que você leva ao trabalhar conosco" className="pm-band">
      <style>{CSS}</style>

      <div className="page-container pm-bar">
        <p className="pm-label">
          <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
          <ScrambleText text="O que você leva ao trabalhar conosco" duration={1200} />
        </p>
        {/* Pausar/retomar — alvo de 44px, visual discreto */}
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setUserPaused(!paused)}
          className="promises-marquee-toggle"
        >
          <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
          {paused ? 'Retomar' : 'Pausar'}
          <span className="sr-only"> animação</span>
        </button>
      </div>

      {/* Lista real para leitores de tela */}
      <ul className="sr-only">
        {PROMISES.map((p) => <li key={p.label}>{p.label}</li>)}
      </ul>

      <div
        ref={rootRef}
        data-orb-avoid=""
        style={{
          maskImage:       'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)',
        }}
      >
        <div ref={rowsRef} className="pm-rows">
          <Track ref={topRef} row={0} />
          <Track ref={botRef} row={1} />
        </div>
      </div>
    </section>
  )
}
