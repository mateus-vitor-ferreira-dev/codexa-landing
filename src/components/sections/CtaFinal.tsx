'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINE1 = ['Tem', 'uma', 'ideia?']
const LINE2 = ['Vamos', 'transformar', 'em', 'realidade.']
const ALL_WORDS = [...LINE1, ...LINE2]

export function CtaFinal() {
  const pinnedRef = useRef<HTMLElement>(null)
  const ctaRef    = useRef<HTMLElement>(null)
  const bgGlowRef = useRef<HTMLDivElement>(null)
  const ctaBtnRef = useRef<HTMLAnchorElement>(null)
  const shineRef  = useRef<HTMLDivElement>(null)
  const wordsRef      = useRef<(HTMLSpanElement | null)[]>(Array(ALL_WORDS.length).fill(null))
  const headlineRef   = useRef<HTMLDivElement>(null)

  /* Gradiente animado contínuo no glow de fundo */
  useEffect(() => {
    const el = bgGlowRef.current
    if (!el) return
    const tween = gsap.to(el, {
      opacity: 0.65, scale: 1.15,
      duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
    return () => { tween.kill() }
  }, [])

  useGSAP(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      gsap.set(wordsRef.current.filter(Boolean), { opacity: 1 })
      gsap.set(['.cta-sub', '.cta-buttons'], { opacity: 1 })
      return
    }

    const words = wordsRef.current.filter((el): el is HTMLSpanElement => el !== null)

    gsap.fromTo(headlineRef.current,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: pinnedRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )

    gsap.fromTo(
      words,
      { opacity: 0.07 },
      {
        opacity: 1,
        stagger: { each: 0.3 },
        scrollTrigger: {
          trigger: pinnedRef.current,
          pin: true,
          anticipatePin: 1,
          start: 'top top',
          end: `+=${ALL_WORDS.length * 240}px`,
          scrub: 1.4,
        },
      }
    )

    gsap.fromTo('.cta-sub',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
    )

    gsap.fromTo('.cta-buttons',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: pinnedRef.current, start: 'top 80%', toggleActions: 'play none none reverse' } }
    )

    gsap.to(bgGlowRef.current, {
      y: -60, ease: 'none',
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    })
  })

  return (
    <>
      {/* SEÇÃO PINADA — headline reveal word-by-word */}
      <section
        ref={pinnedRef}
        id="contato"
        className="relative overflow-hidden"
        style={{
          background: 'transparent',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Grid decorativo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage:
              'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        <div
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 7vw, 8rem)',
            fontWeight: 'bold',
            lineHeight: 1.05,
            textAlign: 'center',
            userSelect: 'none',
            maxWidth: '1100px',
            padding: '0 clamp(1rem, 5vw, 3rem)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            {LINE1.map((word, i) => (
              <span key={i} style={{ display: 'inline-block', margin: '0 0.12em' }}>
                <span
                  ref={el => { wordsRef.current[i] = el }}
                  style={{ opacity: 0.07, color: '#fff', display: 'inline-block' }}
                >
                  {word}
                </span>
              </span>
            ))}
          </div>
          <div style={{ marginTop: '0.08em' }}>
            {LINE2.map((word, i) => (
              <span key={i} style={{ display: 'inline-block', margin: '0 0.12em' }}>
                <span
                  ref={el => { wordsRef.current[LINE1.length + i] = el }}
                  style={{ opacity: 0.07, color: 'rgba(255,255,255,0.55)', display: 'inline-block' }}
                >
                  {word}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Botão — posicionado na base da seção pinada */}
        <a
          className="cta-buttons"
          href="mailto:mateus.ferreira10profissional@gmail.com?subject=Novo%20Projeto%20%E2%80%94%20Codexa&body=Ol%C3%A1!%20Gostaria%20de%20iniciar%20um%20projeto%20com%20a%20Codexa."
          style={{
            position: 'absolute',
            bottom: 'clamp(48px, 9vh, 88px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex', alignItems: 'center', gap: '14px',
            padding: '20px 52px', borderRadius: '100px',
            background: '#00d6f5', color: '#06060c',
            fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800,
            letterSpacing: '-0.01em', textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 0 80px rgba(0,214,245,0.5), 0 20px 48px rgba(0,0,0,0.4)',
            cursor: 'none', zIndex: 2,
          }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: '0 0 130px rgba(0,214,245,0.7), 0 24px 48px rgba(0,0,0,0.5)', duration: 0.22 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: '0 0 80px rgba(0,214,245,0.5), 0 20px 48px rgba(0,0,0,0.4)', duration: 0.28 })}
        >
          Iniciar um Projeto
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M4.5 11h13M13 5l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </section>

      {/* SEÇÃO CTA — subtext */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden"
        style={{ background: 'transparent', paddingTop: '5rem', paddingBottom: '8rem' }}
      >
        {/* Glow sutil com parallax */}
        <div
          ref={bgGlowRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(0,214,245,0.12) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 page-container flex flex-col items-center text-center">

          {/* Subtext */}
          <p
            className="cta-sub leading-relaxed max-w-md"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)' }}
          >
            Do briefing ao deploy, com metodologia clara,
            comunicação constante e tecnologia que funciona de verdade.
          </p>

        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-14"
        style={{
          background:  'transparent',
          borderTop:   '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="page-container flex flex-col md:flex-row items-start justify-between gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-1">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                CODEXA
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#00d6f5' }}>_</span>
            </div>
            <p
              className="max-w-xs leading-relaxed"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}
            >
              Soluções digitais sob medida.<br />
              Lavras, MG — Brasil.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-4">
            {[
              { label: 'Serviços',      href: '#servicos' },
              { label: 'Cases',         href: '#cases' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Contato',       href: '#contato' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="page-container flex flex-col md:flex-row items-center justify-between gap-3 mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
          >
            © 2026 Codexa. Todos os direitos reservados.
          </span>
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
          >
            Feito com Next.js + GSAP
          </span>
        </div>
      </footer>
    </>
  )
}
