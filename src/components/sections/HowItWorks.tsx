'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleText } from '@/lib/fx/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    number: '01',
    title:  'Briefing',
    badge:  '30 min',
    desc:   'Uma conversa para entender sua necessidade real — sem enrolação, sem formulário de 40 campos.',
    detail: 'Você explica o problema. A equipe faz as perguntas certas.',
  },
  {
    number: '02',
    title:  'Proposta',
    badge:  '48h',
    desc:   'Escopo, tecnologias, prazo e valor detalhados. Sem surpresa, sem custo oculto.',
    detail: 'Tudo documentado antes de assinar.',
  },
  {
    number: '03',
    title:  'Contrato',
    badge:  'Assinado',
    desc:   'Garantia para os dois lados. 50% para iniciar, 50% na entrega. Propriedade do código é sua.',
    detail: 'Sem taxa oculta. Sem lock-in.',
  },
  {
    number: '04',
    title:  'Sprints',
    badge:  '2 semanas',
    desc:   'Desenvolvimento em ciclos curtos com validação do cliente em cada etapa. Você vê o progresso.',
    detail: 'Deploy em staging a cada sprint.',
  },
  {
    number: '05',
    title:  'Deploy',
    badge:  '+30 dias',
    desc:   'Projeto no ar com documentação e treinamento. Suporte pós-entrega incluso por 30 dias.',
    detail: 'E oferta de manutenção mensal.',
  },
]

/* ── Linha do tempo editorial ───────────────────────────────
   No lugar dos cards: as etapas viram linhas de tipografia grande.
   A etapa que cruza o meio da tela acende; no desktop o painel fixo
   à esquerda acompanha com o contador gigante e a régua de progresso. */
const CSS = `
.hiw-track { position: relative; }
.hiw-list { list-style: none; margin: 0; padding: 0; }
.hiw-rail { position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.08); }
.hiw-rail i {
  position: absolute; inset: 0; transform-origin: top; transform: scaleY(0);
  background: linear-gradient(to bottom, var(--accent), rgba(var(--accent-rgb),.35));
  box-shadow: 0 0 12px rgba(var(--accent-rgb),.4);
}
.hiw-step {
  position: relative; display: grid; grid-template-columns: 1fr auto; gap: .35rem 1.25rem;
  padding: 2rem 0 2.25rem 1.75rem; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.hiw-step:last-child { border-bottom: 0; }
.hiw-dot {
  position: absolute; left: -4px; top: 2.65rem; width: 9px; height: 9px; border-radius: 50%;
  background: var(--bg); border: 1px solid rgba(var(--accent-rgb),.5); transition: background .4s, box-shadow .4s;
}
.hiw-step[data-active] .hiw-dot { background: var(--accent); box-shadow: 0 0 14px rgba(var(--accent-rgb),.9); }
.hiw-id { grid-column: 1 / -1; font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text-faint); transition: color .4s; }
.hiw-title {
  margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -0.04em; line-height: 1;
  font-size: clamp(2.1rem, 4.6vw, 3.6rem); color: var(--text); transition: opacity .45s, transform .6s cubic-bezier(.2,.8,.2,1);
}
.hiw-badge {
  align-self: end; white-space: nowrap; font-family: var(--font-serif); font-style: italic; font-weight: 500;
  font-size: clamp(1.15rem, 1.8vw, 1.6rem); color: var(--accent); line-height: 1.1;
}
.hiw-body { grid-column: 1 / -1; display: grid; gap: .6rem; margin-top: .75rem; max-width: 54ch; transition: opacity .45s; }
.hiw-desc { margin: 0; font-size: 1rem; line-height: 1.75; color: var(--text-muted); }
.hiw-detail { margin: 0; font-family: var(--font-mono); font-size: .74rem; color: var(--text-faint); }
.hiw-detail span { color: var(--accent); margin-right: .5rem; }
.hiw-step[data-active] .hiw-id { color: var(--accent); }

@media (min-width: 1024px) {
  .hiw-step { padding-left: 2.5rem; }
  /* só a etapa ativa fica acesa */
  .hiw-step:not([data-active]) .hiw-title { opacity: .28; }
  .hiw-step:not([data-active]) .hiw-body { opacity: .45; }
  .hiw-step[data-active] .hiw-title { transform: translateX(10px); }
}

.hiw-panel { position: relative; }
.hiw-count {
  display: flex; align-items: baseline; gap: .4rem; line-height: .85; margin: 2.75rem 0 1.5rem;
  font-family: var(--font-display); font-weight: 800; letter-spacing: -0.06em; font-variant-numeric: tabular-nums;
}
.hiw-count-cur { font-size: 9.5rem; color: transparent; -webkit-text-stroke: 1px rgba(var(--accent-rgb),.6); }
.hiw-count-cur span { display: inline-block; animation: hiw-roll .55s cubic-bezier(.2,.8,.2,1); }
.hiw-count-tot { font-family: var(--font-serif); font-style: italic; font-weight: 500; letter-spacing: 0; font-size: 2rem; color: var(--text-faint); }
.hiw-bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 1.1rem; }
.hiw-bar i { height: 2px; background: rgba(255,255,255,0.1); transition: background .4s, box-shadow .4s; }
.hiw-bar i[data-on] { background: var(--accent); box-shadow: 0 0 10px rgba(var(--accent-rgb),.6); }
.hiw-now { font-family: var(--font-mono); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text-faint); margin: 0; }
.hiw-now b { color: var(--text); font-weight: 400; }

.hiw-terms { border-top: 1px solid rgba(255,255,255,0.08); margin-top: 2.5rem; padding-top: 1.5rem; display: grid; gap: .9rem; }
.hiw-term { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.hiw-term dt { font-family: var(--font-mono); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text-faint); }
.hiw-term dd { margin: 0; font-family: var(--font-serif); font-style: italic; font-size: 1.35rem; color: var(--text); }

@keyframes hiw-roll { from { opacity: 0; transform: translateY(40%); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .hiw-title, .hiw-body, .hiw-dot { transition: none; }
  .hiw-count-cur span { animation: none; }
  .hiw-rail i { transform: none; }
}
`

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    // A etapa ativa é estado, não movimento: vale também com reduced-motion
    gsap.utils.toArray<HTMLElement>('.hiw-step').forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => { if (self.isActive) setActive(i) },
      })
    })

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.hiw-h2-line',
        { yPercent: 105 },
        { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } }
      )
      gsap.fromTo('.hiw-fade',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play reverse play reverse' } }
      )
      // Trilho "desenha" conforme a rolagem
      gsap.to('.hiw-rail i', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.hiw-list', start: 'top 55%', end: 'bottom 55%', scrub: 0.8 },
      })
      gsap.fromTo('.hiw-step',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-list', start: 'top 82%', toggleActions: 'play reverse play reverse' } }
      )
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  const step = STEPS[active]

  return (
    <section ref={sectionRef} id="como-funciona" className="py-24 lg:py-36" style={{ background: 'transparent' }}>
      <style>{CSS}</style>
      <div className="page-container grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-14 lg:gap-24 items-start">

        {/* Painel: título + contador (fixo no desktop) */}
        <div className="hiw-panel lg:sticky lg:top-32" data-orb-avoid="">
          <p className="text-xs tracking-[0.22em] uppercase mb-4"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
            <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
            <ScrambleText text="Processo" />
          </p>
          <h2 className="font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
            <span className="block overflow-hidden pb-1">
              <span className="hiw-h2-line block">Do briefing</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="hiw-h2-line block">ao <span style={{ color: 'var(--accent)' }}>deploy.</span></span>
            </span>
          </h2>
          <p className="hiw-fade leading-relaxed max-w-sm mt-6"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Processo claro, comunicação constante e entregas reais a cada duas semanas.
          </p>

          <div className="hidden lg:block" aria-hidden="true">
            <div className="hiw-count">
              <span className="hiw-count-cur"><span key={step.number}>{step.number}</span></span>
              <span className="hiw-count-tot">/05</span>
            </div>
            <div className="hiw-bar">
              {STEPS.map((s, i) => <i key={s.number} data-on={i <= active ? '' : undefined} />)}
            </div>
            <p className="hiw-now">Agora: <b>{step.title}</b> · {step.badge}</p>
          </div>

          <dl className="hiw-fade hiw-terms">
            <div className="hiw-term"><dt>Projetos simples</dt><dd>2–4 semanas</dd></div>
            <div className="hiw-term"><dt>Projetos complexos</dt><dd>2–4 meses</dd></div>
            <div className="hiw-term"><dt>Acompanhamento</dt><dd>cada etapa</dd></div>
          </dl>
        </div>

        {/* Etapas */}
        <div className="hiw-track" data-orb-avoid="">
        <span className="hiw-rail" aria-hidden="true"><i /></span>
        <ol className="hiw-list">
          {STEPS.map((s, i) => (
            <li key={s.number} className="hiw-step" data-active={i === active ? '' : undefined}
              aria-current={i === active ? 'step' : undefined}>
              <span className="hiw-dot" aria-hidden="true" />
              <span className="hiw-id">Etapa {s.number}</span>
              <h3 className="hiw-title">{s.title}</h3>
              <span className="hiw-badge">{s.badge}</span>
              <div className="hiw-body">
                <p className="hiw-desc">{s.desc}</p>
                <p className="hiw-detail"><span aria-hidden="true">→</span>{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>

      </div>
    </section>
  )
}
