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
  const wordsRef  = useRef<(HTMLSpanElement | null)[]>(Array(ALL_WORDS.length).fill(null))

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

    // Palavras acendem word-by-word conforme o scroll (pin)
    gsap.fromTo(
      words,
      { opacity: 0.07 },
      {
        opacity: 1,
        stagger: { each: 0.3 },
        scrollTrigger: {
          trigger: pinnedRef.current,
          pin: true,
          start: 'top top',
          end: `+=${ALL_WORDS.length * 210}px`,
          scrub: 0.7,
        },
      }
    )

    // Subtext e botões entram depois do pin
    gsap.from('.cta-sub', {
      opacity: 0, y: 18,
      duration: 0.65, ease: 'power2.out',
      scrollTrigger: { trigger: ctaRef.current, start: 'top 78%' },
    })

    gsap.from('.cta-buttons', {
      opacity: 0, y: 16,
      duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: ctaRef.current, start: 'top 72%' },
    })

    // Parallax no glow de fundo
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
          background: '#0d0d0f',
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
          {/* Linha 1 — branca */}
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
          {/* Linha 2 — atenuada */}
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
      </section>

      {/* SEÇÃO CTA — subtext + botões */}
      <section
        ref={ctaRef}
        className="relative py-32 overflow-hidden"
        style={{ background: '#0d0d0f' }}
      >
        {/* Glow sutil com parallax */}
        <div
          ref={bgGlowRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(232,0,109,0.12) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 page-container flex flex-col items-center gap-10 text-center">

          {/* Subtext */}
          <p
            className="cta-sub leading-relaxed max-w-md"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}
          >
            Do briefing ao deploy, com metodologia clara,
            comunicação constante e tecnologia que funciona de verdade.
          </p>

          {/* Buttons */}
          <div className="cta-buttons flex flex-col sm:flex-row items-center gap-4">
            {/* Primary — brilho deslizante */}
            <a
              ref={ctaBtnRef}
              href="https://mail.google.com/mail/?view=cm&to=mateus.ferreira10profissional%40gmail.com&su=Novo%20Projeto%20%E2%80%94%20Codexa&body=Ol%C3%A1!%20Gostaria%20de%20iniciar%20um%20projeto%20com%20a%20Codexa."
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-xl font-bold"
              style={{
                fontFamily: 'var(--font-display)', fontSize: '1rem',
                background: '#fff', color: '#080810', cursor: 'none',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.03, boxShadow: '0 10px 48px rgba(255,255,255,0.25)', duration: 0.22 })
                gsap.fromTo(shineRef.current, { xPercent: -100 }, { xPercent: 160, duration: 0.6, ease: 'power2.out' })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, boxShadow: 'none', duration: 0.28 })
                gsap.set(shineRef.current, { xPercent: -100 })
              }}
            >
              {/* Shine overlay */}
              <div ref={shineRef} className="pointer-events-none absolute inset-0" style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
              }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#e8006d' }} />
              Iniciar projeto agora
            </a>

            {/* WhatsApp */}
            <a
              href="https://w.app/codexa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                color:      'rgba(255,255,255,0.7)',
                border:     '1px solid rgba(255,255,255,0.15)',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { borderColor: 'rgba(255,255,255,0.4)', color: '#fff', duration: 0.2 })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', duration: 0.25 })
              }}
            >
              {/* WhatsApp icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Falar no WhatsApp
            </a>
          </div>

          {/* Trust indicators */}
          <div
            className="cta-sub flex flex-wrap items-center justify-center gap-6 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%' }}
          >
            {[
              '✓ Resposta em até 24h',
              '✓ Proposta sem compromisso',
              '✓ Contrato transparente',
            ].map((item) => (
              <span
                key={item}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-14"
        style={{
          background:  'var(--bg)',
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
              <span style={{ fontFamily: 'var(--font-mono)', color: '#e8006d' }}>_</span>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-4">
            {[
              { label: 'Serviços',      href: '#servicos' },
              { label: 'Cases',         href: '#cases' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Contato',       href: '#contato' },
              { label: 'LinkedIn',      href: '#' },
              { label: 'Instagram',     href: '#' },
              { label: 'GitHub',        href: '#' },
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
