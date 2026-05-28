'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const LINKS = [
  { label: 'Serviços',      href: '#servicos' },
  { label: 'Cases',         href: '#cases' },
  { label: 'Como funciona', href: '#como-funciona' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef  = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const navRef   = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
      <div
        className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(9,9,11,0.8) 0%, transparent 100%)',
        }}
      />

      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(9,9,11,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid transparent',
        }}
      >
        <div className="page-container flex items-center justify-between h-20">

          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5"
            onClick={closeMenu}
            style={{ textDecoration: 'none' }}
          >
            <img
              src="/logo-mark.svg"
              alt=""
              width={28}
              height={28}
              style={{ display: 'block', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.1rem',
                fontWeight:    700,
                letterSpacing: '-0.02em',
                color:         'var(--text)',
                lineHeight:    1,
                paddingTop:    '1px',
              }}
            >
              Codexa
            </span>
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative group py-1"
                style={{
                  fontFamily:    'var(--font-body)',
                  fontSize:      '0.9rem',
                  fontWeight:    450,
                  color:         'var(--text-muted)',
                  letterSpacing: '0.01em',
                  transition:    'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: '#00d6f5' }}
                />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href="https://mail.google.com/mail/?view=cm&to=mateus.ferreira10profissional%40gmail.com&su=Novo%20Projeto%20%E2%80%94%20Codexa&body=Ol%C3%A1!%20Gostaria%20de%20iniciar%20um%20projeto%20com%20a%20Codexa."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-all duration-250"
              style={{
                fontFamily:      'var(--font-display)',
                padding:         '10px 24px',
                background:      'rgba(0,214,245,0.08)',
                color:           '#ffffff',
                border:          '1px solid rgba(0,214,245,0.55)',
                boxShadow:       '0 0 12px rgba(0,214,245,0.18), inset 0 0 0 0 transparent',
                textShadow:      'none',
                letterSpacing:   '0.03em',
                cursor:          'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = 'rgba(0,214,245,0.15)'
                e.currentTarget.style.borderColor = 'rgba(0,214,245,0.9)'
                e.currentTarget.style.boxShadow   = '0 0 20px rgba(0,214,245,0.35), 0 0 40px rgba(0,214,245,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = 'rgba(0,214,245,0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,214,245,0.55)'
                e.currentTarget.style.boxShadow   = '0 0 12px rgba(0,214,245,0.18), inset 0 0 0 0 transparent'
              }}
            >
              Fale conosco
            </a>
          </div>

          {/* Mobile hamburger */}
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
                  style={{ background: 'var(--text)' }}
                />
              ))}
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 flex-col justify-between px-6 pt-28 pb-12"
        style={{ display: 'none', background: '#09090b', clipPath: 'inset(0 0 100% 0)' }}
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
                color:       'var(--text)',
                borderColor: 'rgba(255,255,255,0.06)',
                lineHeight:  1.1,
              }}
              onClick={closeMenu}
            >
              {link.label}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#00d6f5', flexShrink: 0 }}>
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        <div className="mobile-link flex flex-col gap-6">
          <a
            href="https://mail.google.com/mail/?view=cm&to=mateus.ferreira10profissional%40gmail.com&su=Novo%20Projeto%20%E2%80%94%20Codexa&body=Ol%C3%A1!%20Gostaria%20de%20iniciar%20um%20projeto%20com%20a%20Codexa."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary self-start"
            onClick={closeMenu}
          >
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
