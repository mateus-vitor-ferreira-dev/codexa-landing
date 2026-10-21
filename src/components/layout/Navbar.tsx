'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { Magnetic } from '@/components/fx/Magnetic'
import { prefersReducedMotion } from '@/lib/fx/motion'

const NavOrb = dynamic(
  () => import('@/components/ui/NavOrb').then(m => m.NavOrb),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: 36, height: 36, flexShrink: 0, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,214,245,0.3) 0%, transparent 70%)',
      }} />
    ),
  },
)

const LINKS = [
  { label: 'Serviços',      href: '#servicos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Cases',         href: '#cases' },
  { label: 'Contato',       href: '#contato' },
]

// Mesmas URLs do rodapé (CtaFinal)
const SOCIALS = [
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/mateus-vitor-ferreira-dev' },
  { label: 'Instagram', href: 'https://www.instagram.com/desenvolvedoracodexa/' },
  { label: 'GitHub',    href: 'https://github.com/mateus-vitor-ferreira-dev' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef  = useRef<HTMLElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const navRef   = useRef<HTMLElement>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const deskRef  = useRef<HTMLElement>(null)
  const barRef   = useRef<HTMLSpanElement>(null)
  const pillRef  = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState<string | null>(null)

  // Seção atual: a que cruza o meio da tela marca o link (aria-current + barra)
  useEffect(() => {
    const els = LINKS
      .map(l => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => el !== null)
    const seen = new Map<Element, boolean>()
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => seen.set(e.target, e.isIntersecting))
      const hit = els.find(el => seen.get(el))
      setActive(hit ? `#${hit.id}` : null)
    }, { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  /* Indicador deslizante: a barra fica sob o link ativo e corre até o link
     com hover/foco; a pílula de fundo só aparece no hover. Medidas via
     offsetLeft/offsetWidth só nos eventos, nunca em loop. */
  const slide = (target: HTMLElement | null, hover: boolean) => {
    const bar = barRef.current, pill = pillRef.current
    if (!bar || !pill) return
    const set = prefersReducedMotion()
      ? (el: HTMLElement, v: gsap.TweenVars) => gsap.set(el, v)
      : (el: HTMLElement, v: gsap.TweenVars) => gsap.to(el, { duration: 0.5, ease: 'power3.out', overwrite: 'auto', ...v })
    if (!target) {
      set(bar, { opacity: 0 })
      set(pill, { opacity: 0 })
      return
    }
    const x = target.offsetLeft, w = target.offsetWidth
    set(bar,  { x, width: w, opacity: 1 })
    set(pill, { x: x - 12, width: w + 24, opacity: hover ? 1 : 0 })
  }
  const linkEl = (href: string | null) =>
    href ? deskRef.current?.querySelector<HTMLElement>(`a[href="${href}"]`) ?? null : null

  useEffect(() => { slide(linkEl(active), false) }, [active])

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
      // Foco no primeiro link ao abrir
      menu.querySelector<HTMLElement>('a[href]')?.focus()
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

  // Menu aberto: Esc fecha (foco volta ao botão) e Tab circula só entre botão + itens do menu
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        btnRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !menuRef.current || !btnRef.current) return
      const items = [
        btnRef.current,
        ...Array.from(menuRef.current.querySelectorAll<HTMLElement>('a[href], button')),
      ]
      const i    = items.indexOf(document.activeElement as HTMLElement)
      const next = e.shiftKey
        ? (i <= 0 ? items.length - 1 : i - 1)
        : (i + 1) % items.length
      e.preventDefault()
      items[next].focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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

      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500"
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
            <NavOrb />
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
          <nav
            ref={deskRef}
            aria-label="Principal"
            className="relative hidden md:flex items-center gap-7"
            onMouseLeave={() => slide(linkEl(active), false)}
          >
            {/* Pílula (hover) e barra (ativo/hover) que deslizam entre os links */}
            <span
              ref={pillRef}
              aria-hidden="true"
              className="absolute left-0 pointer-events-none rounded-full"
              style={{
                top: -6, bottom: -6, width: 0, opacity: 0,
                background: 'rgba(var(--accent-rgb),0.08)',
                border: '1px solid rgba(var(--accent-rgb),0.18)',
              }}
            />
            <span
              ref={barRef}
              aria-hidden="true"
              className="absolute left-0 pointer-events-none"
              style={{
                bottom: -2, height: 2, width: 0, opacity: 0, borderRadius: 2,
                background: 'var(--accent)',
                boxShadow: '0 0 10px rgba(var(--accent-rgb),0.8), 0 0 22px rgba(var(--accent-rgb),0.35)',
              }}
            />
            {LINKS.map((link) => {
              const isActive = active === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'location' : undefined}
                  className="relative py-1"
                  style={{
                    fontFamily:    'var(--font-body)',
                    fontSize:      '0.9rem',
                    fontWeight:    450,
                    color:         isActive ? 'var(--text)' : 'var(--text-muted)',
                    letterSpacing: '0.01em',
                    transition:    'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; slide(e.currentTarget, true) }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? 'var(--text)' : 'var(--text-muted)' }}
                  onFocus={(e) => slide(e.currentTarget, true)}
                  onBlur={() => slide(linkEl(active), false)}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Magnetic strength={0.35} radius={36}>
            <a
              href="#contato"
              onClick={(e) => { e.preventDefault(); document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-[background-color,border-color,box-shadow] duration-250"
              style={{
                fontFamily:      'var(--font-display)',
                padding:         '10px 24px',
                background:      'rgba(var(--accent-rgb),0.08)',
                color:           '#ffffff',
                border:          '1px solid rgba(var(--accent-rgb),0.55)',
                boxShadow:       '0 0 12px rgba(var(--accent-rgb),0.18), inset 0 0 0 0 transparent',
                textShadow:      'none',
                letterSpacing:   '0.03em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = 'rgba(var(--accent-rgb),0.15)'
                e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.9)'
                e.currentTarget.style.boxShadow   = '0 0 20px rgba(var(--accent-rgb),0.35), 0 0 40px rgba(var(--accent-rgb),0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = 'rgba(var(--accent-rgb),0.08)'
                e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.55)'
                e.currentTarget.style.boxShadow   = '0 0 12px rgba(var(--accent-rgb),0.18), inset 0 0 0 0 transparent'
              }}
            >
              Fale conosco
            </a>
            </Magnetic>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={btnRef}
            type="button"
            className="md:hidden w-11 h-11 flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
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
      </header>

      {/* Mobile fullscreen menu — inert quando fechado (fora do Tab e do leitor de tela) */}
      <nav
        ref={menuRef}
        id="menu-mobile"
        aria-label="Menu"
        inert={!menuOpen}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        <div className="mobile-link flex flex-col gap-6">
          <a
            href="#contato"
            className="btn-primary self-start"
            onClick={(e) => { e.preventDefault(); closeMenu(); setTimeout(() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
          >
            Iniciar projeto
          </a>
          <div className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
