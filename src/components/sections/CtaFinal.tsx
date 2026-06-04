'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTheme } from '@/context/ThemeContext'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.digitalcodexa.com'

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

  const [form, setForm]     = useState({ nome: '', email: '', whatsapp: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [errors, setErrors] = useState<{ nome?: string; email?: string }>({})

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function validateField(field: 'nome' | 'email', value: string) {
    if (field === 'nome' && !value.trim()) return 'Nome é obrigatório'
    if (field === 'email') {
      if (!value.trim()) return 'E-mail é obrigatório'
      if (!validateEmail(value)) return 'E-mail inválido'
    }
    return undefined
  }

  function handleBlur(field: 'nome' | 'email') {
    const err = validateField(field, form[field])
    setErrors(prev => ({ ...prev, [field]: err }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nomeErr  = validateField('nome',  form.nome)
    const emailErr = validateField('email', form.email)
    if (nomeErr || emailErr) {
      setErrors({ nome: nomeErr, email: emailErr })
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

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
        <button
          className="cta-buttons"
          onClick={() => document.getElementById('form-contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{
            position: 'absolute',
            bottom: 'clamp(48px, 9vh, 88px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex', alignItems: 'center', gap: '14px',
            padding: '20px 52px', borderRadius: '100px',
            background: theme.accent, color: '#06060c',
            fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800,
            letterSpacing: '-0.01em', whiteSpace: 'nowrap', border: 'none',
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
        </button>
      </section>

      {/* SEÇÃO CTA — subtext + formulário */}
      <section
        ref={ctaRef}
        id="form-contato"
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

        <div className="relative z-10 page-container flex flex-col items-center text-center" style={{ gap: '3rem' }}>

          {/* Subtext */}
          <p
            className="cta-sub leading-relaxed max-w-md"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)' }}
          >
            Do briefing ao deploy, com metodologia clara,
            comunicação constante e tecnologia que funciona de verdade.
          </p>

          {/* Formulário de contato */}
          <div style={{ width: '100%', maxWidth: 480, textAlign: 'left' }}>
            {status === 'ok' ? (
              <div style={{
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 16, padding: '40px 32px', textAlign: 'center',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', marginBottom: 8 }}>
                  Mensagem enviada!
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  Entraremos em contato em breve para dar início ao seu projeto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                      Nome *
                    </label>
                    <input
                      value={form.nome}
                      onChange={e => { setForm(f => ({ ...f, nome: e.target.value })); if (errors.nome) setErrors(p => ({ ...p, nome: undefined })) }}
                      onBlur={() => handleBlur('nome')}
                      placeholder="Seu nome"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.nome ? '#ef4444' : 'rgba(255,255,255,0.09)'}`,
                        borderRadius: 10, padding: '12px 14px', color: '#f4f4f5',
                        fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
                        width: '100%', cursor: 'auto',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = errors.nome ? '#ef4444' : `rgba(${theme.rgb},0.35)`)}
                    />
                    {errors.nome && (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#ef4444' }}>
                        {errors.nome}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                      onBlur={() => handleBlur('email')}
                      placeholder="seu@email.com"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255,255,255,0.09)'}`,
                        borderRadius: 10, padding: '12px 14px', color: '#f4f4f5',
                        fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
                        width: '100%', cursor: 'auto',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = errors.email ? '#ef4444' : `rgba(${theme.rgb},0.35)`)}
                    />
                    {errors.email && (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#ef4444' }}>
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="(35) 9 9999-9999"
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 10, padding: '12px 14px', color: '#f4f4f5',
                      fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
                      width: '100%', cursor: 'auto',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `rgba(${theme.rgb},0.35)`)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    Sobre o projeto
                  </label>
                  <textarea
                    rows={4}
                    value={form.mensagem}
                    onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    placeholder="Descreva brevemente o que você precisa..."
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 10, padding: '12px 14px', color: '#f4f4f5',
                      fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
                      resize: 'vertical', width: '100%', cursor: 'auto',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `rgba(${theme.rgb},0.35)`)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                {status === 'error' && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#ef4444', textAlign: 'center' }}>
                    Algo deu errado. Tente novamente ou envie um e-mail diretamente.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    marginTop: 4, padding: '14px 32px', borderRadius: 10, border: 'none',
                    background: theme.accent, color: '#06060c',
                    fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800,
                    letterSpacing: '-0.01em', cursor: status === 'sending' ? 'wait' : 'none',
                    opacity: status === 'sending' ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                    boxShadow: `0 0 40px rgba(${theme.rgb},0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                  onMouseEnter={e => status !== 'sending' && gsap.to(e.currentTarget, { scale: 1.02, duration: 0.18 })}
                  onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.22 })}
                >
                  {status === 'sending' ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensagem
                      <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                        <path d="M4.5 11h13M13 5l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                  Ao enviar, você concorda com nossa{' '}
                  <a href="/privacidade" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>
                    Política de Privacidade
                  </a>
                  . Seus dados são usados apenas para retorno do contato.
                </p>
              </form>
            )}
          </div>

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.svg" width={20} height={20} alt="Codexa" style={{ display: 'block', flexShrink: 0 }} />
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
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Cases',         href: '#cases' },
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
              { label: 'E-mail',   href: 'mailto:contato@digitalcodexa.com' },
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
            <a href="/privacidade" style={{ color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            >Política de Privacidade</a>
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
