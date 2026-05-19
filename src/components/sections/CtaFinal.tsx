'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CtaFinal() {
  const sectionRef  = useRef<HTMLElement>(null)
  const bgGlowRef   = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Texto entra de baixo
    gsap.from('.cta-word', {
      opacity: 0, y: 48,
      duration: 0.75, stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
    })

    gsap.from('.cta-sub', {
      opacity: 0, y: 24,
      duration: 0.6, ease: 'power2.out', delay: 0.4,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
    })

    gsap.from('.cta-buttons', {
      opacity: 0, y: 20,
      duration: 0.55, ease: 'power2.out', delay: 0.6,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
    })

    // Parallax no glow de fundo
    gsap.to(bgGlowRef.current, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end:   'bottom top',
        scrub: 1.5,
      },
    })
  }, { scope: sectionRef })

  return (
    <>
      {/* CTA Section */}
      <section
        ref={sectionRef}
        id="contato"
        className="relative py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a0014 0%, #2a0022 35%, #1a0020 65%, #0e000e 100%)',
        }}
      >
        {/* Glow com parallax */}
        <div
          ref={bgGlowRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 100%, rgba(232,0,109,0.3) 0%, transparent 65%),
              radial-gradient(ellipse 40% 40% at 20% 20%, rgba(232,0,109,0.08) 0%, transparent 60%)
            `,
          }}
        />

        {/* Grid decorativo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(232,0,109,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,109,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-10 text-center">

          {/* Headline */}
          <div style={{ fontFamily: 'var(--font-display)' }}>
            <div className="overflow-hidden">
              <span
                className="cta-word block text-5xl md:text-7xl xl:text-8xl font-bold leading-none"
                style={{ color: '#fff' }}
              >
                Tem uma ideia?
              </span>
            </div>
            <div className="overflow-hidden mt-2">
              <span
                className="cta-word block text-5xl md:text-7xl xl:text-8xl font-bold leading-none"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                Vamos transformar
              </span>
            </div>
            <div className="overflow-hidden mt-2">
              <span
                className="cta-word block text-5xl md:text-7xl xl:text-8xl font-bold leading-none"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                em realidade.
              </span>
            </div>
          </div>

          {/* Subtext */}
          <p
            className="cta-sub text-base md:text-lg leading-relaxed max-w-md"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}
          >
            Do briefing ao deploy, com metodologia clara,
            comunicação constante e tecnologia que funciona de verdade.
          </p>

          {/* Buttons */}
          <div className="cta-buttons flex flex-col sm:flex-row items-center gap-4">
            {/* Primary */}
            <a
              href="mailto:contato@codexa.dev"
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                background: '#fff',
                color:      '#080810',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.03,
                  boxShadow: '0 8px 40px rgba(255,255,255,0.2)',
                  duration: 0.2,
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  boxShadow: 'none',
                  duration: 0.25,
                })
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#e8006d' }}
              />
              Iniciar projeto agora
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5535999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                color:      'rgba(255,255,255,0.7)',
                border:     '1px solid rgba(255,255,255,0.15)',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255,255,255,0.4)',
                  color:       '#fff',
                  duration:    0.2,
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255,255,255,0.15)',
                  color:       'rgba(255,255,255,0.7)',
                  duration:    0.25,
                })
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
                className="text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
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
          borderTop:   '1px solid rgba(255,255,255,0.05)',
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
              className="text-sm max-w-xs leading-relaxed"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
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
                className="text-sm transition-colors"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
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
