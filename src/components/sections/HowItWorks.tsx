'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    number: '01',
    title:  'Briefing',
    badge:  '30 min',
    desc:   'Uma conversa para entender sua necessidade real — sem enrolação, sem formulário de 40 campos.',
    detail: 'Você explica o problema. Eu faço as perguntas certas.',
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

export function HowItWorks() {
  const sectionRef  = useRef<HTMLElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)
  const lineVRef    = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Header
    gsap.fromTo('.hiw-header',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', toggleActions: 'play reverse play reverse' } }
    )

    // ── Linha horizontal (desktop) — scrub driven ──────────────
    gsap.fromTo(lineRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end:   'center 30%',
          scrub: 1.2,
        },
      },
    )

    // ── Linha vertical (mobile) — scrub driven ─────────────────
    gsap.fromTo(lineVRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top center',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end:   'bottom 50%',
          scrub: 1.2,
        },
      },
    )

    // Dots — zoom de entrada bidirecional
    gsap.fromTo('.step-dot',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(3)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 62%', toggleActions: 'play reverse play reverse' } }
    )

    // Cards — fade + subida + scale bidirecional
    gsap.fromTo('.step-card',
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 58%', toggleActions: 'play reverse play reverse' } }
    )

  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="py-36 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <div className="page-container flex flex-col gap-28">

        {/* Header */}
        <div className="hiw-header flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
            >
              Processo
            </p>
            <h2
              className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}
            >
              Do briefing
              <br />
              ao <span style={{ color: '#00d6f5' }}>deploy</span>
            </h2>
          </div>
          <p
            className="leading-relaxed max-w-sm"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}
          >
            Processo claro, comunicação constante e entregas reais a cada duas semanas.
          </p>
        </div>

        {/* ── Desktop timeline ────────────────────────────────── */}
        <div className="hidden md:block">

          {/* Track container */}
          <div className="relative">

            {/* Linha de fundo */}
            <div
              className="absolute top-5 left-0 right-0 h-px"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />

            {/* Linha magenta (animada) */}
            <div
              ref={lineRef}
              className="absolute top-5 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(to right, #00d6f5, rgba(0,214,245,0.5))',
                transformOrigin: 'left center',
                boxShadow: '0 0 12px rgba(0,214,245,0.4)',
              }}
            />

            {/* Dots */}
            <div className="relative flex justify-between mb-12">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="step-dot flex flex-col items-center"
                >
                  {/* Círculo */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center relative"
                    style={{
                      background: 'var(--bg)',
                      border:     '1px solid rgba(0,214,245,0.5)',
                      boxShadow:  '0 0 20px rgba(0,214,245,0.15)',
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ fontFamily: 'var(--font-mono)', color: '#00d6f5' }}
                    >
                      {step.number}
                    </span>
                    {/* Pulse no último step */}
                    {step.number === '05' && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: 'rgba(0,214,245,0.15)' }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cards abaixo da linha */}
            <div className="flex justify-between gap-4">
              {STEPS.map((step) => (
                <StepCard key={step.number} step={step} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile timeline (vertical) ──────────────────────── */}
        <div className="flex md:hidden flex-col">
          <div className="relative pl-12">

            {/* Linha vertical de fundo */}
            <div
              className="absolute left-4 top-0 bottom-0 w-px"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />

            {/* Linha vertical magenta */}
            <div
              ref={lineVRef}
              className="absolute left-4 top-0 bottom-0 w-px"
              style={{
                background:    'linear-gradient(to bottom, #00d6f5, rgba(0,214,245,0.3))',
                transformOrigin: 'top center',
                boxShadow:     '0 0 12px rgba(0,214,245,0.3)',
              }}
            />

            {/* Steps */}
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="step-card relative flex gap-6 pb-10 last:pb-0"
              >
                {/* Dot */}
                <div
                  className="step-dot absolute -left-[22px] top-0 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--bg-section)',
                    border:     '1px solid rgba(0,214,245,0.5)',
                  }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: '#00d6f5' }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-lg font-bold"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                      {step.title}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color:      '#00d6f5',
                        background: 'rgba(0,214,245,0.1)',
                        border:     '1px solid rgba(0,214,245,0.2)',
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p className="leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                    {step.desc}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nota de rodapé */}
        <div className="hiw-header flex justify-center">
          <p
            className="text-center"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-faint)', maxWidth: '480px', lineHeight: 1.9 }}
          >
            Projetos simples entregues em 2–4 semanas ·
            Projetos complexos em 2–4 meses ·
            Você acompanha cada etapa
          </p>
        </div>

      </div>
    </section>
  )
}

/* ── Step Card (desktop) ────────────────────────────────── */
function StepCard({ step }: { step: typeof STEPS[0] }) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  /* Elevar hover */
  const onEnter = () => {
    gsap.to(cardRef.current, {
      y: -7,
      borderColor: 'rgba(0,214,245,0.35)',
      boxShadow: '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,214,245,0.15)',
      duration: 0.28, ease: 'power2.out',
    })
    gsap.fromTo(shineRef.current,
      { xPercent: -100 },
      { xPercent: 160, duration: 0.6, ease: 'power2.out' }
    )
  }

  const onLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      borderColor: 'rgba(255,255,255,0.12)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      duration: 0.35, ease: 'power2.out',
    })
    gsap.set(shineRef.current, { xPercent: -100 })
  }

  return (
    <div
      ref={cardRef}
      className="step-card flex-1 rounded-2xl flex flex-col gap-4 cursor-default overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1e1e26 0%, #141418 60%, #0e0e13 100%)',
        border:     '1px solid rgba(255,255,255,0.12)',
        boxShadow:  '0 8px 32px rgba(0,0,0,0.35)',
        minWidth:   0,
        position:   'relative',
        padding:    '28px 24px',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Shine overlay */}
      <div ref={shineRef} className="pointer-events-none absolute inset-0 z-10" style={{
        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
        transform: 'translateX(-100%)',
      }} />

      {/* Badge de tempo */}
      <span className="self-start px-3 py-1 rounded-full" style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
        color: '#00d6f5', background: 'rgba(0,214,245,0.12)',
        border: '1px solid rgba(0,214,245,0.28)',
      }}>
        {step.badge}
      </span>

      {/* Title */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#f0f0f6' }}>
        {step.title}
      </h3>

      {/* Desc */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#b8b8cc', lineHeight: 1.72 }}>
        {step.desc}
      </p>

      {/* Detail */}
      <p className="mt-auto pt-3" style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
        color: 'var(--text-faint)', borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {step.detail}
      </p>
    </div>
  )
}
