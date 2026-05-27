'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LETTERS   = ['C', 'O', 'D', 'E', 'X', 'A']
const HACK_CHARS = '!<>-_\\/[]{}=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    document.body.style.overflow = 'hidden'

    const runScramble = (onDone?: () => void) => {
      const TARGET = 'CODEXA'
      const FRAMES = 24
      const els = overlay.querySelectorAll<HTMLElement>('.pre-letter-char')
      let frame = 0
      const id = setInterval(() => {
        TARGET.split('').forEach((char, i) => {
          const el = els[i]
          if (!el) return
          const lockAt = Math.floor((i / TARGET.length) * FRAMES * 0.65)
          el.textContent = frame >= lockAt
            ? char
            : HACK_CHARS[Math.floor(Math.random() * HACK_CHARS.length)]
        })
        if (frame >= FRAMES) {
          clearInterval(id)
          onDone?.()
        }
        frame++
      }, 42)
    }

    const counter = { value: 0 }
    const tl = gsap.timeline()

    // ── 1. Letras sobem de baixo com stagger ─────────────────
    tl.from('.pre-letter', {
      y: '115%',
      duration: 0.65,
      stagger: 0.06,
      ease: 'power3.out',
    })

    // ── 2. Scramble nas letras ───────────────────────────────
    tl.call(() => runScramble())
    tl.to({}, { duration: 1.1 })   // aguarda o scramble completar (~24 × 42ms)

    // ── 3. Tagline aparece ───────────────────────────────────
    tl.from('.pre-tag', {
      opacity: 0,
      y: 8,
      duration: 0.4,
      ease: 'power2.out',
    })

    // ── 4. Barra preenche + contador incrementa ──────────────
    tl.fromTo(
      '.pre-bar',
      { scaleX: 0 },
      { scaleX: 1, duration: 1.05, ease: 'power2.inOut' },
    )

    tl.to(counter, {
      value: 100,
      duration: 1.05,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = `${Math.round(counter.value)}%`
        }
      },
    }, '<')

    // ── 5. Pausa em 100% ─────────────────────────────────────
    tl.to({}, { duration: 0.3 })

    // ── 6. Saída: clip-path sobe (cortina para cima) ─────────
    tl.to(overlay, {
      clipPath: 'inset(100% 0 0% 0)',
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        document.body.style.overflow = ''
        gsap.set(overlay, { display: 'none' })
        window.dispatchEvent(new Event('lenis-start'))
        onComplete?.()
      },
    })

  }, [onComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex:     9998,
        background: '#080810',
        clipPath:   'inset(0 0 0% 0)',
      }}
    >
      {/* Noise idêntico ao do body */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px 200px',
        }}
      />

      {/* Glow de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 60%, rgba(0,214,245,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Conteúdo central */}
      <div className="relative flex flex-col items-center" style={{ gap: '2.5rem' }}>

        {/* CODEXA_ — cada letra em overflow:hidden para o slide-up */}
        <div className="flex items-baseline">
          {LETTERS.map((letter, i) => (
            <div key={i} style={{ overflow: 'hidden', lineHeight: 1.1 }}>
              <span
                className="pre-letter pre-letter-char block"
                style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      'clamp(3.5rem, 9vw, 6.5rem)',
                  fontWeight:    800,
                  color:         '#fff',
                  letterSpacing: '0.1em',
                }}
              >
                {letter}
              </span>
            </div>
          ))}

          {/* Cursor _ com pulse */}
          <div style={{ overflow: 'hidden', lineHeight: 1.1, marginLeft: '0.1em' }}>
            <span
              className="pre-letter block animate-pulse"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 700,
                color:      '#00d6f5',
              }}
            >
              _
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          className="pre-tag"
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.65rem',
            letterSpacing: '0.28em',
            color:         'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}
        >
          soluções digitais sob medida
        </p>

        {/* Barra de progresso + contador */}
        <div
          className="flex items-center gap-4"
          style={{ width: '100%', minWidth: 'clamp(280px, 50vw, 420px)' }}
        >
          {/* Track */}
          <div
            className="flex-1 h-px overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {/* Fill */}
            <div
              className="pre-bar h-full"
              style={{
                background:      'linear-gradient(to right, #00d6f5, rgba(0,214,245,0.6))',
                transformOrigin: 'left center',
                boxShadow:       '0 0 12px rgba(0,214,245,0.6)',
              }}
            />
          </div>

          {/* Counter */}
          <span
            ref={counterRef}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '0.72rem',
              color:      '#00d6f5',
              minWidth:   '3.2ch',
              textAlign:  'right',
              letterSpacing: '0.05em',
            }}
          >
            0%
          </span>
        </div>

      </div>
    </div>
  )
}
