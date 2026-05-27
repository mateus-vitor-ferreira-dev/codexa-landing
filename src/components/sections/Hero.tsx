'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WORDS = ['sistemas', 'websites', 'apps', 'automações']

const CODE_LINES = [
  { tokens: [{ type: 'comment', text: '// codexa.config.ts' }] },
  { tokens: [] },
  { tokens: [{ type: 'keyword', text: 'import' }, { type: 'default', text: ' { defineProject } ' }, { type: 'keyword', text: 'from' }, { type: 'string', text: " 'codexa'" }] },
  { tokens: [] },
  { tokens: [{ type: 'keyword', text: 'export default' }, { type: 'default', text: ' defineProject({' }] },
  { tokens: [{ type: 'property', text: '  stack' }, { type: 'bracket', text: ': {' }] },
  { tokens: [{ type: 'property', text: '    frontend' }, { type: 'bracket', text: ': ' }, { type: 'string', text: "'next.js'" }, { type: 'bracket', text: ',' }] },
  { tokens: [{ type: 'property', text: '    backend' }, { type: 'bracket', text: ':  ' }, { type: 'string', text: "'node.js'" }, { type: 'bracket', text: ',' }] },
  { tokens: [{ type: 'property', text: '    database' }, { type: 'bracket', text: ': ' }, { type: 'string', text: "'postgresql'" }, { type: 'bracket', text: ',' }] },
  { tokens: [{ type: 'bracket', text: '  },' }] },
  { tokens: [{ type: 'property', text: '  ai' }, { type: 'bracket', text: ': {' }] },
  { tokens: [{ type: 'property', text: '    provider' }, { type: 'bracket', text: ': ' }, { type: 'string', text: "'claude'" }, { type: 'bracket', text: ',' }] },
  { tokens: [{ type: 'property', text: '    agents' }, { type: 'bracket', text: ':  ' }, { type: 'value', text: 'true' }, { type: 'bracket', text: ',' }] },
  { tokens: [{ type: 'bracket', text: '  },' }] },
  { tokens: [{ type: 'property', text: '  deploy' }, { type: 'bracket', text: ': ' }, { type: 'string', text: "'railway'" }] },
  { tokens: [{ type: 'bracket', text: '})' }] },
]

function CodeLine({ tokens }: { tokens: { type: string; text: string }[] }) {
  if (tokens.length === 0) return <div className="h-[1.6em]" />
  return (
    <div className="leading-[1.6em]">
      {tokens.map((t, i) => (
        <span key={i} className={`token-${t.type}`}>{t.text}</span>
      ))}
    </div>
  )
}

export function Hero() {
  const sectionRef   = useRef<HTMLElement>(null)
  const wordRef      = useRef<HTMLSpanElement>(null)
  const wordIndexRef = useRef(0)
  const [visibleLines, setVisibleLines] = useState(0)

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 2.6 })

    tl.from('.hero-tag', {
      opacity: 0, y: 12, duration: 0.5, ease: 'power3.out',
    })

    tl.from('.hero-word', {
      opacity: 0, y: 48, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    }, '-=0.2')

    tl.from('.hero-desc', {
      opacity: 0, y: 16, duration: 0.5, ease: 'power2.out',
    }, '-=0.3')

    tl.from('.hero-cta', {
      opacity: 0, y: 12, stagger: 0.08, duration: 0.4, ease: 'power2.out',
    }, '-=0.25')

    tl.from('.hero-code-window', {
      opacity: 0, x: 32, duration: 0.75, ease: 'power3.out',
    }, '-=0.6')

    tl.from('.hero-scroll', {
      opacity: 0, duration: 0.45,
    }, '-=0.2')
  }, { scope: sectionRef })

  // Rotating word
  useEffect(() => {
    const interval = setInterval(() => {
      const el = wordRef.current
      if (!el) return

      gsap.to(el, {
        opacity: 0, y: -14, duration: 0.22, ease: 'power2.in',
        onComplete: () => {
          wordIndexRef.current = (wordIndexRef.current + 1) % WORDS.length
          el.textContent = WORDS[wordIndexRef.current]
          gsap.fromTo(el,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
          )
        },
      })
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  // Float contínuo no code window
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.hero-code-window')
    if (!el) return
    const tween = gsap.to(el, {
      y: -12, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
    return () => { tween.kill() }
  }, [])

  // Pulse no accent dot do tag
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.hero-tag-dot')
    if (!el) return
    gsap.to(el, {
      scale: 1.5, opacity: 0.5, duration: 1.1,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
  }, [])

  // Code window typing
  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const id = setInterval(() => {
        i++
        setVisibleLines(i)
        if (i >= CODE_LINES.length) clearInterval(id)
      }, 85)
    }, 800)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="gradient-mesh relative min-h-screen flex flex-col justify-center px-5 md:px-12 xl:px-20 pt-24 pb-16 overflow-hidden"
    >
      {/* Subtle grid — very low opacity */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 75% 60% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      {/* Content grid */}
      <div className="relative z-10 page-container grid grid-cols-1 lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px] gap-16 lg:gap-24 items-center">

        {/* LEFT */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* Tag */}
          <div className="hero-tag inline-flex items-center gap-2 self-start">
            <span
              className="hero-tag-dot w-1.5 h-1.5 rounded-full"
              style={{ background: '#00d6f5' }}
            />
            <span
              className="text-xs tracking-[0.18em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
            >
              Desenvolvimento · IA · Automação
            </span>
          </div>

          {/* Headline */}
          <div style={{ fontFamily: 'var(--font-display)' }}>
            <h1 className="font-bold leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)' }}>
              <div className="flex flex-wrap gap-x-3 mb-1">
                <div className="hero-word-wrap">
                  <span className="hero-word block" style={{ color: 'var(--text)' }}>Construímos</span>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
                <div className="hero-word-wrap" style={{ overflow: 'hidden' }}>
                  <span
                    ref={wordRef}
                    className="hero-word block"
                    style={{ color: '#00d6f5' }}
                  >
                    {WORDS[0]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-3 mb-1">
                {['que', 'transformam'].map((w) => (
                  <div key={w} className="hero-word-wrap">
                    <span className="hero-word block" style={{ color: 'var(--text)' }}>{w}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-3">
                {['seu', 'negócio.'].map((w) => (
                  <div key={w} className="hero-word-wrap">
                    <span
                      className="hero-word block"
                      style={{ color: w === 'negócio.' ? 'var(--text-muted)' : 'var(--text)' }}
                    >
                      {w}
                    </span>
                  </div>
                ))}
              </div>
            </h1>
          </div>

          {/* Description */}
          <p
            className="hero-desc leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', color: 'var(--text-muted)', maxWidth: '440px' }}
          >
            Da ideia ao deploy — desenvolvemos soluções digitais sob medida
            com atendimento próximo, metodologia clara e tecnologia moderna.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://mail.google.com/mail/?view=cm&to=mateus.ferreira10profissional%40gmail.com&su=Novo%20Projeto%20%E2%80%94%20Codexa&body=Ol%C3%A1!%20Gostaria%20de%20iniciar%20um%20projeto%20com%20a%20Codexa."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary hero-cta"
            >
              Iniciar projeto
            </a>
            <a href="#cases" className="btn-ghost hero-cta">
              Ver portfólio
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* Trust line */}
          <p
            className="hero-cta"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-faint)' }}
          >
            Projetos entregues em produção · Código 100% seu · Sem lock-in
          </p>
        </div>

        {/* RIGHT — Code Window */}
        <div className="hero-code-window hidden lg:flex w-full">
          <div
            className="code-glow rounded-xl overflow-hidden w-full"
            style={{ background: 'var(--bg-card)' }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="ml-auto text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                codexa.config.ts
              </span>
            </div>

            <div className="p-5 text-sm" style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
              <div className="flex gap-4">
                <div className="select-none text-right" style={{ color: 'var(--text-faint)', minWidth: '1.5rem' }}>
                  {CODE_LINES.slice(0, visibleLines).map((_, i) => (
                    <div key={i} className="leading-[1.6em]">{i + 1}</div>
                  ))}
                </div>

                <div className="flex-1 overflow-hidden" style={{ color: 'var(--text-muted)' }}>
                  {CODE_LINES.slice(0, visibleLines).map((line, i) => (
                    <CodeLine key={i} tokens={line.tokens} />
                  ))}

                  {visibleLines < CODE_LINES.length && (
                    <span
                      className="inline-block w-2 h-4 animate-pulse"
                      style={{ background: '#00d6f5', marginLeft: '2px', verticalAlign: 'middle' }}
                    />
                  )}
                </div>
              </div>

              {visibleLines >= CODE_LINES.length && (
                <div
                  className="mt-4 pt-3 flex items-center gap-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28c840' }} />
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Projeto configurado · pronto para deploy
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--text-faint)' }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          scroll
        </span>
        <div
          className="w-px h-8 origin-top animate-[grow_1.5s_ease-in-out_infinite]"
          style={{ background: 'linear-gradient(to bottom, var(--text-faint), transparent)' }}
        />
      </div>
    </section>
  )
}
