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
  const lineVRef    = useRef<HTMLDivElement>(null)  // mobile vertical

  useGSAP(() => {
    const trigger = {
      trigger:  sectionRef.current,
      start:    'top 65%',
    }

    // Header
    gsap.from('.hiw-header', {
      opacity: 0, y: 28, duration: 0.7, ease: 'power3.out',
      scrollTrigger: trigger,
    })

    // Linha horizontal (desktop)
    gsap.fromTo(
      lineRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.8,
        ease: 'power2.inOut',
        delay: 0.3,
        transformOrigin: 'left center',
        scrollTrigger: trigger,
      },
    )

    // Linha vertical (mobile)
    gsap.fromTo(
      lineVRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1.8,
        ease: 'power2.inOut',
        delay: 0.3,
        transformOrigin: 'top center',
        scrollTrigger: trigger,
      },
    )

    // Dots
    gsap.from('.step-dot', {
      scale: 0, opacity: 0,
      duration: 0.35, stagger: 0.28,
      ease: 'back.out(2)', delay: 0.5,
      scrollTrigger: trigger,
    })

    // Cards
    gsap.from('.step-card', {
      opacity: 0, y: 32,
      duration: 0.55, stagger: 0.18,
      ease: 'power3.out', delay: 0.55,
      scrollTrigger: trigger,
    })

  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="py-28 overflow-hidden"
      style={{ background: 'var(--bg-section)' }}
    >
      <div className="page-container flex flex-col gap-20">

        {/* Header */}
        <div className="hiw-header flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
            >
              Processo
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Do briefing
              <br />
              ao <span style={{ color: '#e8006d' }}>deploy</span>
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: 'var(--text-muted)' }}
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
                background: 'linear-gradient(to right, #e8006d, rgba(232,0,109,0.5))',
                transformOrigin: 'left center',
                boxShadow: '0 0 12px rgba(232,0,109,0.4)',
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
                      background: 'var(--bg-section)',
                      border:     '1px solid rgba(232,0,109,0.5)',
                      boxShadow:  '0 0 20px rgba(232,0,109,0.15)',
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ fontFamily: 'var(--font-mono)', color: '#e8006d' }}
                    >
                      {step.number}
                    </span>
                    {/* Pulse no último step */}
                    {step.number === '05' && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: 'rgba(232,0,109,0.15)' }}
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
                background:    'linear-gradient(to bottom, #e8006d, rgba(232,0,109,0.3))',
                transformOrigin: 'top center',
                boxShadow:     '0 0 12px rgba(232,0,109,0.3)',
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
                    border:     '1px solid rgba(232,0,109,0.5)',
                  }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: '#e8006d' }}
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
                        color:      '#e8006d',
                        background: 'rgba(232,0,109,0.1)',
                        border:     '1px solid rgba(232,0,109,0.2)',
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {step.desc}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
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
            className="text-xs text-center"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', maxWidth: '480px', lineHeight: 1.8 }}
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
  const cardRef = useRef<HTMLDivElement>(null)

  const onEnter = () => {
    gsap.to(cardRef.current, {
      borderColor: 'rgba(232,0,109,0.3)',
      y: -4,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  const onLeave = () => {
    gsap.to(cardRef.current, {
      borderColor: 'rgba(255,255,255,0.06)',
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <div
      ref={cardRef}
      className="step-card flex-1 p-5 rounded-xl flex flex-col gap-3 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border:     '1px solid rgba(255,255,255,0.06)',
        minWidth:   0,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Badge de tempo */}
      <span
        className="self-start text-xs px-2.5 py-1 rounded-full"
        style={{
          fontFamily: 'var(--font-mono)',
          color:      '#e8006d',
          background: 'rgba(232,0,109,0.1)',
          border:     '1px solid rgba(232,0,109,0.2)',
        }}
      >
        {step.badge}
      </span>

      {/* Title */}
      <h3
        className="text-base font-bold"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        {step.title}
      </h3>

      {/* Desc */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}
      >
        {step.desc}
      </p>

      {/* Detail */}
      <p
        className="text-xs mt-auto pt-2"
        style={{
          fontFamily:  'var(--font-mono)',
          color:       'var(--text-faint)',
          borderTop:   '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {step.detail}
      </p>
    </div>
  )
}
