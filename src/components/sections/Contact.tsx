'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WA_URL = 'https://wa.me/5535997460058?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20um%20projeto!'

const CHANNELS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    value: '+55 35 9 9746-0058',
    href: WA_URL,
    external: true,
    color: '#25d366',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
  },
  {
    key: 'email',
    label: 'E-mail',
    value: 'contato@digitalcodexa.com',
    href: 'mailto:contato@digitalcodexa.com',
    external: false,
    color: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    value: '@desenvolvedoracodexa',
    href: 'https://www.instagram.com/desenvolvedoracodexa/',
    external: true,
    color: '#e1306c',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
]

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo(
      '.contact-heading',
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      },
    )
    gsap.fromTo(
      '.contact-card',
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', toggleActions: 'play none none none' },
      },
    )
    gsap.fromTo(
      '.contact-cta-block',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none none' },
      },
    )
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="contato"
      style={{ paddingTop: '6rem', paddingBottom: '6rem', position: 'relative' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(var(--accent-rgb),0.06) 0%, transparent 65%)',
        }}
      />

      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <div className="contact-heading" style={{ marginBottom: '3.5rem' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14,
          }}>
            Contato
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Vamos conversar sobre<br />
            <span style={{ color: 'var(--accent)' }}>o seu projeto</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)',
            lineHeight: 1.7, maxWidth: '52ch',
          }}>
            Estamos disponíveis para novos projetos. Escolha o canal que preferir — respondemos rápido.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          alignItems: 'stretch',
        }}>

          {/* Channel cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
            {CHANNELS.map((ch) => (
              <a
                key={ch.key}
                href={ch.href}
                target={ch.external ? '_blank' : undefined}
                rel={ch.external ? 'noopener noreferrer' : undefined}
                className="contact-card"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -3, duration: 0.2, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0,  duration: 0.22, ease: 'power2.in' })}
                style={{
                  flex: '1 1 0',
                  display: 'flex', alignItems: 'center', gap: 18,
                  padding: '18px 22px',
                  minHeight: 82,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  textDecoration: 'none',
                  transition: 'border-color 0.25s, background 0.25s',
                  cursor: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(var(--accent-rgb),0.35)`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                {/* Icon */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: ch.color
                    ? `rgba(${hexToRgb(ch.color)}, 0.12)`
                    : 'rgba(var(--accent-rgb), 0.1)',
                  color: ch.color ?? 'var(--accent)',
                  border: `1px solid ${ch.color ? `rgba(${hexToRgb(ch.color)}, 0.2)` : 'rgba(var(--accent-rgb), 0.2)'}`,
                }}>
                  {ch.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'var(--text-faint)', marginBottom: 3,
                  }}>
                    {ch.label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.92rem',
                    color: 'var(--text-muted)', fontWeight: 450,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {ch.value}
                  </p>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-faint)', flexShrink: 0 }}>
                  <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </div>

          {/* CTA block */}
          <div
            className="contact-cta-block"
            style={{
              padding: 'clamp(28px, 4vw, 40px)',
              background: `rgba(var(--accent-rgb), 0.04)`,
              border: `1px solid rgba(var(--accent-rgb), 0.18)`,
              borderRadius: 18,
              display: 'flex', flexDirection: 'column', gap: 24,
            }}
          >
            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: '#28c840', flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(40,200,64,0.18)',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Disponível para novos projetos
              </span>
            </div>

            <div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
                fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginBottom: 10,
              }}>
                Pronto para começar?
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.92rem',
                color: 'var(--text-muted)', lineHeight: 1.7,
              }}>
                Envie uma mensagem pelo WhatsApp ou preencha o formulário abaixo. Retornamos em até 24h.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.03, duration: 0.18 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1,    duration: 0.22 })}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 10,
                  background: '#25d366', color: '#fff',
                  fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700,
                  textDecoration: 'none', cursor: 'none',
                  boxShadow: '0 4px 24px rgba(37,211,102,0.3)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chamar no WhatsApp
              </a>
              <a
                href="#form-contato"
                onClick={(e) => { e.preventDefault(); document.getElementById('form-contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 600,
                  textDecoration: 'none', cursor: 'none',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
              >
                Enviar mensagem
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5l7 7-7 7M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
