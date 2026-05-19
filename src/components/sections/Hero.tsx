'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin()

const WORDS = ['websites', 'sistemas', 'apps', 'automações']
const HACK_CHARS = '!<>-_\\/[]{}=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

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
  const sectionRef    = useRef<HTMLElement>(null)
  const heroBrandRef  = useRef<HTMLDivElement>(null)
  const wordRef       = useRef<HTMLSpanElement>(null)
  const wordIndexRef  = useRef(0)
  const heroVisible   = useRef(true)
  const isAnimating   = useRef(false)
  const [visibleLines, setVisibleLines] = useState(0)

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 2.8 })

    // CODEXA é o primeiro a entrar — desliza de cima pra baixo
    tl.from('.hero-brand-main', {
      opacity: 0, y: -48, duration: 0.9, ease: 'power3.out',
    })

    // Separador
    tl.from('.hero-separator', {
      scaleX: 0, duration: 0.6, ease: 'power2.out',
    }, '-=0.3')

    // Tag
    tl.from('.hero-tag', {
      opacity: 0, y: 16, duration: 0.55, ease: 'power3.out',
    }, '-=0.2')

    // Headline words
    tl.from('.hero-word', {
      opacity: 0, y: 56, duration: 0.75, stagger: 0.1, ease: 'power3.out',
    }, '-=0.25')

    // Description
    tl.from('.hero-desc', {
      opacity: 0, y: 20, duration: 0.55, ease: 'power2.out',
    }, '-=0.35')

    // CTAs
    tl.from('.hero-cta', {
      opacity: 0, y: 16, stagger: 0.1, duration: 0.45, ease: 'power2.out',
    }, '-=0.3')

    // Code window
    tl.from('.hero-code-window', {
      opacity: 0, x: 48, duration: 0.85, ease: 'power3.out',
    }, '-=0.75')

    // Scroll hint
    tl.from('.hero-scroll', {
      opacity: 0, duration: 0.5,
    }, '-=0.3')

  }, { scope: sectionRef })

  // Scroll bidirecional: esconde/mostra o CODEXA hero com scramble
  useEffect(() => {
    const TARGET = 'CODEXA'
    const FRAMES = 28

    const applyGradient = (el: HTMLElement) => {
      el.style.background = 'linear-gradient(135deg, #ffffff 10%, #e8006d 90%)'
      el.style.webkitBackgroundClip = 'text'
      el.style.backgroundClip = 'text'
      el.style.color = 'transparent'
    }

    const applySolid = (el: HTMLElement) => {
      el.style.background = 'none'
      el.style.webkitBackgroundClip = 'unset'
      el.style.backgroundClip = 'unset'
      el.style.color = '#e8006d'
    }

    const runScramble = (el: HTMLElement, restoreGradient: boolean, onDone?: () => void) => {
      applySolid(el)
      let frame = 0
      const id = setInterval(() => {
        el.textContent = TARGET.split('').map((char, i) => {
          const lockAt = Math.floor((i / TARGET.length) * FRAMES * 0.65)
          if (frame >= lockAt) return char
          return HACK_CHARS[Math.floor(Math.random() * HACK_CHARS.length)]
        }).join('')

        if (frame >= FRAMES) {
          el.textContent = TARGET
          clearInterval(id)
          if (restoreGradient) applyGradient(el)
          onDone?.()
        }
        frame++
      }, 42)
    }

    const hideHero = () => {
      if (!heroVisible.current || isAnimating.current) return
      heroVisible.current = false
      isAnimating.current = true

      const el = heroBrandRef.current
      if (!el) { isAnimating.current = false; return }

      window.dispatchEvent(new Event('codexa-to-header'))

      runScramble(el, false, () => {
        gsap.to(el.parentElement!, {
          opacity: 0, y: -36, duration: 0.5, ease: 'power2.in', delay: 0.06,
          onComplete: () => { isAnimating.current = false },
        })
      })
    }

    const showHero = () => {
      if (heroVisible.current || isAnimating.current) return
      heroVisible.current = true
      isAnimating.current = true

      const el = heroBrandRef.current
      if (!el) { isAnimating.current = false; return }

      window.dispatchEvent(new Event('codexa-to-hero'))

      const parent = el.parentElement!
      el.textContent = TARGET
      gsap.fromTo(parent,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out',
          onComplete: () => runScramble(el, true, () => { isAnimating.current = false }) },
      )
    }

    const onScroll = () => {
      const el = heroBrandRef.current
      if (!el) return
      const { top } = el.getBoundingClientRect()
      // Usa rect para hide (preciso, sem transform residual nessa direção)
      // Usa scrollY para show (o transform y:-36 do hide afeta rect.top no retorno)
      if (top < 50 && heroVisible.current) hideHero()
      else if (window.scrollY < 50 && !heroVisible.current) showHero()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Rotating word
  useEffect(() => {
    const interval = setInterval(() => {
      const el = wordRef.current
      if (!el) return

      gsap.to(el, {
        opacity: 0, y: -18, duration: 0.28, ease: 'power2.in',
        onComplete: () => {
          wordIndexRef.current = (wordIndexRef.current + 1) % WORDS.length
          el.textContent = WORDS[wordIndexRef.current]
          gsap.fromTo(el,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          )
        },
      })
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  // Code window typing
  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const id = setInterval(() => {
        i++
        setVisibleLines(i)
        if (i >= CODE_LINES.length) clearInterval(id)
      }, 90)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="gradient-mesh relative min-h-screen flex flex-col justify-center gap-10 px-5 md:px-12 xl:px-20 pt-28 pb-16 overflow-hidden"
    >
      {/* Grid decorativo de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)',
        }}
      />

      {/* Glow magenta canto inferior esquerdo */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '50vw',
          height: '50vh',
          background: 'radial-gradient(ellipse at bottom left, rgba(232,0,109,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ── CODEXA — primeiro elemento, destaque total ── */}
      <div
        className="hero-brand-main relative z-10 text-center pointer-events-none select-none"
      >
        <div
          ref={heroBrandRef}
          style={{
            fontFamily:     'var(--font-display)',
            fontWeight:     900,
            fontSize:       'clamp(72px, 13.5vw, 180px)',
            letterSpacing:  '-0.025em',
            lineHeight:     1,
            background:     'linear-gradient(135deg, #ffffff 10%, #e8006d 90%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color:          'transparent',
          }}
        >
          CODEXA
        </div>
      </div>

      {/* Separador */}
      <div
        className="hero-separator relative z-10 w-full origin-left"
        style={{ height: '1px', background: 'linear-gradient(to right, rgba(232,0,109,0.5), rgba(232,0,109,0.1), transparent)' }}
      />

      {/* ── Conteúdo ── */}
      <div className="relative z-10 page-container grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-12 lg:gap-20 items-center">

        {/* LEFT */}
        <div className="flex flex-col gap-7 min-w-0">

          {/* Tag */}
          <div className="hero-tag inline-flex items-center gap-2 self-start">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#e8006d' }}
            />
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              Desenvolvimento · IA · Automação
            </span>
          </div>

          {/* Headline */}
          <div style={{ fontFamily: 'var(--font-display)' }}>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight">
              <div className="flex flex-wrap gap-x-4 mb-1">
                {['Construímos'].map((w) => (
                  <div key={w} className="hero-word-wrap">
                    <span className="hero-word block" style={{ color: 'var(--text)' }}>{w}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-baseline gap-x-4 mb-1">
                <div className="hero-word-wrap">
                  <span ref={wordRef} className="hero-word block" style={{ color: '#e8006d' }}>
                    {WORDS[0]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4">
                {['que', 'transformam'].map((w) => (
                  <div key={w} className="hero-word-wrap">
                    <span className="hero-word block" style={{ color: 'var(--text)' }}>{w}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-4">
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
            className="hero-desc text-base md:text-lg leading-relaxed max-w-[480px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Da ideia ao deploy — desenvolvemos soluções digitais sob medida
            com atendimento próximo, metodologia clara e tecnologia moderna.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5">
            <a href="#contato" className="btn-primary hero-cta">
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.7)' }} />
              Iniciar projeto
            </a>
            <a href="#cases" className="btn-ghost hero-cta">
              Ver portfólio
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* Métricas */}
          <div
            className="hero-cta flex gap-8 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { value: '10+', label: 'projetos entregues' },
              { value: '3+', label: 'anos de experiência' },
              { value: '100%', label: 'sob medida' },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#e8006d' }}>
                  {m.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Code Window */}
        <div className="hero-code-window hidden lg:flex w-full">
          <div className="code-glow rounded-xl overflow-hidden w-full" style={{ background: 'var(--bg-card)' }}>
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
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
                      style={{ background: '#e8006d', marginLeft: '2px', verticalAlign: 'middle' }}
                    />
                  )}
                </div>
              </div>

              {visibleLines >= CODE_LINES.length && (
                <div
                  className="mt-4 pt-3 flex items-center gap-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#28c840' }} />
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
          className="w-px h-10 origin-top animate-[grow_1.5s_ease-in-out_infinite]"
          style={{ background: 'linear-gradient(to bottom, var(--magenta), transparent)' }}
        />
      </div>
    </section>
  )
}
