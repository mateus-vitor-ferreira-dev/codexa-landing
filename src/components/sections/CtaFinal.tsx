'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTheme } from '@/context/ThemeContext'

gsap.registerPlugin(ScrollTrigger)

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 20 }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {links.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-body)', transition: 'color 0.25s', cursor: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const LINE1 = ['Tem', 'uma', 'ideia?']
const LINE2 = ['Vamos', 'transformar', 'em', 'realidade.']
const ALL_WORDS = [...LINE1, ...LINE2]

export function CtaFinal() {
  const { theme } = useTheme()

  const pinnedRef   = useRef<HTMLElement>(null)
  const ctaRef      = useRef<HTMLElement>(null)
  const bgGlowRef   = useRef<HTMLDivElement>(null)
  const wordsRef    = useRef<(HTMLSpanElement | null)[]>(Array(ALL_WORDS.length).fill(null))
  const headlineRef = useRef<HTMLDivElement>(null)

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

    gsap.set('.cta-buttons', { opacity: 0, y: 20 })

    const wordsTl = gsap.timeline({
      scrollTrigger: {
        trigger: pinnedRef.current,
        pin: true,
        anticipatePin: 1,
        start: 'top top',
        end: `+=${ALL_WORDS.length * 240}px`,
        scrub: 1.4,
      },
    })

    wordsTl
      .fromTo(words, { opacity: 0.07 }, { opacity: 1, stagger: { each: 0.3 } })
      .fromTo('.cta-buttons', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, '>')

    gsap.fromTo('.cta-sub',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
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
            background: theme.accent, color: '#06060c',
            fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800,
            letterSpacing: '-0.01em', textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: `0 0 80px rgba(${theme.rgb},0.5), 0 20px 48px rgba(0,0,0,0.4)`,
            cursor: 'none', zIndex: 2,
          }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: `0 0 130px rgba(${theme.rgb},0.7), 0 24px 48px rgba(0,0,0,0.5)`, duration: 0.22 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: `0 0 80px rgba(${theme.rgb},0.5), 0 20px 48px rgba(0,0,0,0.4)`, duration: 0.28 })}
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
              'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(var(--accent-rgb),0.12) 0%, transparent 60%)',
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
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: `
            radial-gradient(1200px 400px at 50% -10%, rgba(var(--accent-rgb),0.06), transparent 70%),
            linear-gradient(180deg, var(--bg) 0%, #07070c 100%)
          `,
          padding: '88px 0 32px',
        }}
      >
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(120% 80% at 50% 0%, black 30%, transparent 75%)',
          opacity: 0.5,
        }} />

        {/* Top accent glow line */}
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          width: 420, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          boxShadow: '0 0 24px 2px rgba(var(--accent-rgb),0.4)',
        }} />

        {/* Ghost watermark */}
        <div style={{
          position: 'absolute', left: '50%', bottom: '-8%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(120px, 22vw, 300px)',
          color: 'rgba(255,255,255,0.018)', letterSpacing: '-0.04em', lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
        }}>
          CODEXA
        </div>

        <div className="page-container" style={{ position: 'relative' }}>

          {/* Nav grid: brand col + 3 link cols */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)',
            paddingBottom: 64,
          }}>

            {/* ── Brand column ── */}
            <div style={{ gridColumn: 'span 1' }}>
              {/* Mini terminal */}
              <div style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
                maxWidth: 280,
                marginBottom: 28,
                boxShadow: '0 24px 60px -30px rgba(0,0,0,0.8)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  {(['#ff5f57','#febc2e','#28c840'] as const).map(c => (
                    <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  ))}
                  <span style={{ marginLeft: 6, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>codexa@deploy</span>
                </div>
                <div style={{ padding: '14px 13px', fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.75 }}>
                  <div><span style={{ color: 'var(--accent)' }}>$</span> status --prod</div>
                  <div style={{ color: 'var(--text-muted)' }}>› 5 projetos no ar · 100% uptime</div>
                  <div>
                    <span style={{ color: 'var(--accent)' }}>$</span>
                    <span style={{ display: 'inline-block', width: 7, height: 14, background: 'var(--accent)', verticalAlign: '-2px', marginLeft: 4, animation: 'footerCursorBlink 1.1s steps(1) infinite' }} />
                  </div>
                </div>
              </div>

              {/* Logo mark */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 20, height: 20, transform: 'rotate(45deg)',
                  border: '2px solid var(--accent)', borderRadius: 4,
                  boxShadow: '0 0 16px rgba(var(--accent-rgb),0.3)',
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Codexa</span>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '28ch', marginBottom: 14 }}>
                Soluções digitais sob medida.<br />Lavras, MG — Brasil.
              </p>

              {/* Status */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840', flexShrink: 0, animation: 'footerStatusPulse 2s infinite' }} />
                Disponível para novos projetos
              </div>
            </div>

            {/* ── Navegação ── */}
            <FooterCol title="Navegação" links={[
              { label: 'Serviços',      href: '#servicos' },
              { label: 'Cases',         href: '#cases' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Contato',       href: '#contato' },
            ]} />

            {/* ── Serviços ── */}
            <FooterCol title="Serviços" links={[
              { label: 'Sites & Landing', href: '#servicos' },
              { label: 'Apps Mobile',     href: '#servicos' },
              { label: 'Sistemas Web',    href: '#servicos' },
              { label: 'IA & Automação',  href: '#servicos' },
            ]} />

            {/* ── Contato ── */}
            <FooterCol title="Contato" links={[
              { label: 'WhatsApp', href: 'https://wa.me/5535998765432' },
              { label: 'E-mail',   href: 'mailto:mateus.ferreira10profissional@gmail.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com/in/mateus-vitor-ferreira-dev' },
              { label: 'GitHub',   href: 'https://github.com/mateus-vitor-ferreira-dev' },
            ]} />
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16,
            alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-faint)',
          }}>
            <span>© 2026 Codexa. Todos os direitos reservados.</span>
            <div style={{ display: 'flex', gap: 22 }}>
              {[
                { label: 'LinkedIn',  href: 'https://linkedin.com/in/mateus-vitor-ferreira-dev' },
                { label: 'Instagram', href: 'https://instagram.com/codexa.dev' },
                { label: 'GitHub',    href: 'https://github.com/mateus-vitor-ferreira-dev' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.25s', cursor: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                >{s.label}</a>
              ))}
            </div>
            <span>Feito com <strong style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Next.js</strong> + <strong style={{ color: 'var(--text-muted)', fontWeight: 500 }}>GSAP</strong></span>
          </div>
        </div>

        <style>{`
          @keyframes footerCursorBlink { 50% { opacity: 0 } }
          @keyframes footerStatusPulse {
            0%   { box-shadow: 0 0 0 0 rgba(40,200,64,0.5) }
            70%  { box-shadow: 0 0 0 8px rgba(40,200,64,0) }
            100% { box-shadow: 0 0 0 0 rgba(40,200,64,0) }
          }
        `}</style>
      </footer>
    </>
  )
}
