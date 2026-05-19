'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const LINKS = [
  { label: 'Serviços',      href: '#servicos' },
  { label: 'Cases',         href: '#cases' },
  { label: 'Como funciona', href: '#como-funciona' },
]

const HACK_CHARS = '!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOGO_TARGET = 'CODEXA'

export function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const menuRef       = useRef<HTMLDivElement>(null)
  const linesRef      = useRef<HTMLDivElement>(null)
  const navRef        = useRef<HTMLElement>(null)
  const logoTextRef   = useRef<HTMLSpanElement>(null)
  const logoState     = useRef<'hidden' | 'visible'>('hidden')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Sincroniza com o Hero: aparece/some junto com o CODEXA grandão
  useEffect(() => {
    const FRAMES = 30

    const scrambleIn = () => {
      if (logoState.current === 'visible') return
      logoState.current = 'visible'
      setLogoVisible(true)

      const el = logoTextRef.current
      if (!el) return

      let frame = 0
      const id = setInterval(() => {
        el.textContent = LOGO_TARGET.split('').map((char, i) => {
          const lockAt = Math.floor((i / LOGO_TARGET.length) * FRAMES * 0.72)
          if (frame >= lockAt) return char
          return HACK_CHARS[Math.floor(Math.random() * HACK_CHARS.length)]
        }).join('')

        if (frame >= FRAMES) {
          el.textContent = LOGO_TARGET
          clearInterval(id)
        }
        frame++
      }, 42)
    }

    const fadeOut = () => {
      if (logoState.current === 'hidden') return
      logoState.current = 'hidden'
      setLogoVisible(false)
      // Reseta o texto para a próxima entrada
      setTimeout(() => {
        const el = logoTextRef.current
        if (el) el.textContent = LOGO_TARGET
      }, 400)
    }

    window.addEventListener('codexa-to-header', scrambleIn)
    window.addEventListener('codexa-to-hero',   fadeOut)
    return () => {
      window.removeEventListener('codexa-to-header', scrambleIn)
      window.removeEventListener('codexa-to-hero',   fadeOut)
    }
  }, [])

  useEffect(() => {
    gsap.from(navRef.current, {
      y: -24, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.1,
    })
  }, [])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      gsap.set(menu, { display: 'flex' })
      gsap.fromTo(
        menu,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power3.inOut' },
      )
      gsap.from('.mobile-link', {
        opacity: 0, y: 24, stagger: 0.07, duration: 0.4,
        ease: 'power2.out', delay: 0.2,
      })
    } else {
      document.body.style.overflow = ''
      gsap.to(menu, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: () => gsap.set(menu, { display: 'none' }),
      })
    }
  }, [menuOpen])

  useEffect(() => {
    const lines = linesRef.current
    if (!lines) return
    const [l1, l2, l3] = Array.from(lines.children) as HTMLElement[]

    if (menuOpen) {
      gsap.to(l1, { y: 6,  rotate: 45,  duration: 0.3, ease: 'power2.inOut' })
      gsap.to(l2, { opacity: 0, x: -8,  duration: 0.2 })
      gsap.to(l3, { y: -6, rotate: -45, duration: 0.3, ease: 'power2.inOut' })
    } else {
      gsap.to(l1, { y: 0, rotate: 0, duration: 0.3, ease: 'power2.inOut' })
      gsap.to(l2, { opacity: 1, x: 0,  duration: 0.2 })
      gsap.to(l3, { y: 0, rotate: 0,   duration: 0.3, ease: 'power2.inOut' })
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Gradiente permanente no topo — garante legibilidade mesmo sem scroll */}
      <div
        className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,8,16,0.75) 0%, transparent 100%)',
        }}
      />

      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(8,8,16,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(232,0,109,0.18)'
            : '1px solid transparent',
          boxShadow: scrolled
            ? '0 1px 40px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        <div className="page-container flex items-center justify-between h-20">

          {/* ── Logo ───────────────────────────────────────── */}
          <a href="#" className="flex items-baseline gap-0.5" onClick={closeMenu}>
            <span
              ref={logoTextRef}
              className="text-xl font-bold tracking-wider transition-opacity duration-150"
              style={{
                fontFamily:     'var(--font-display)',
                color:          '#fff',
                letterSpacing:  '0.08em',
                opacity:        logoVisible ? 1 : 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              CODEXA
            </span>
            <span
              className="text-base font-bold animate-pulse transition-opacity duration-300"
              style={{
                fontFamily: 'var(--font-mono)',
                color:      '#e8006d',
                lineHeight: 1,
                opacity:    logoVisible ? 1 : 0,
                transitionDelay: logoVisible ? '0.9s' : '0s',
              }}
            >
              _
            </span>
          </a>

          {/* ── Desktop links ──────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative group py-1"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize:   '0.9rem',
                  fontWeight: 450,
                  color:      'rgba(255,255,255,0.82)',
                  letterSpacing: '0.01em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.82)')}
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: '#e8006d' }}
                />
              </a>
            ))}
          </nav>

          {/* ── Desktop CTA ────────────────────────────────── */}
          <div className="hidden md:block">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily:  'var(--font-display)',
                background:  '#e8006d',
                color:       '#fff',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  background: '#ff1a7f',
                  scale: 1.03,
                  boxShadow: '0 4px 24px rgba(232,0,109,0.45)',
                  duration: 0.2,
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  background: '#e8006d',
                  scale: 1,
                  boxShadow: 'none',
                  duration: 0.25,
                })
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              Fale conosco
            </a>
          </div>

          {/* ── Mobile hamburger ───────────────────────────── */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <div ref={linesRef} className="flex flex-col gap-[5px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-6 h-[1.5px] origin-center"
                  style={{ background: '#fff' }}
                />
              ))}
            </div>
          </button>
        </div>
      </nav>

      {/* ── Mobile fullscreen menu ──────────────────────────── */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 flex-col justify-between px-6 pt-28 pb-12"
        style={{ display: 'none', background: '#080810', clipPath: 'inset(0 0 100% 0)' }}
      >
        <div className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-link flex items-center justify-between py-5 border-b"
              style={{
                fontFamily:  'var(--font-display)',
                fontSize:    'clamp(2rem, 8vw, 3.5rem)',
                fontWeight:  700,
                color:       '#fff',
                borderColor: 'rgba(255,255,255,0.07)',
                lineHeight:  1.1,
              }}
              onClick={closeMenu}
            >
              {link.label}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#e8006d', flexShrink: 0 }}>
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        <div className="mobile-link flex flex-col gap-6">
          <a href="#contato" className="btn-primary self-start" onClick={closeMenu}>
            <span className="w-2 h-2 rounded-full bg-white/60" />
            Iniciar projeto
          </a>
          <div className="flex items-center gap-6">
            {['LinkedIn', 'Instagram', 'GitHub'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-sm"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
