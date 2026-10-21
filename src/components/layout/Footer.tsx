'use client'

import { PROJETOS_NO_AR } from '@/lib/numeros'

// Links do rodapé com alvo de 44px de altura (toque); o texto continua igual
const LINK_ALVO: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', minHeight: 44,
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      {/* marginBottom menor compensa o respiro interno do primeiro link (alvo de 44px) */}
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 9 }}>
        {title}
      </h3>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
        {links.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{ ...LINK_ALVO, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-body)', transition: 'color 0.25s' }}
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

// Rodapé da home. Fica fora do <main> (page.tsx); o zIndex 10 repete o empilhamento
// do <main> para continuar acima do BackgroundEffects.
export function Footer() {
  return (
    /* data-origem: cliques no WhatsApp daqui contam como "rodape" */
    <footer
      data-origem="rodape"
      style={{
        position: 'relative',
        zIndex: 10,
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
      <div aria-hidden="true" style={{
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
        <div className="footer-grid grid grid-cols-2 lg:grid-cols-4" style={{
          gap: 'clamp(24px, 4vw, 48px)',
          paddingBottom: 64,
        }}>

          {/* ── Brand column (linha inteira no celular) ── */}
          <div className="col-span-2 lg:col-span-1">
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
                <div style={{ color: 'var(--text-muted)' }}>› {PROJETOS_NO_AR} projetos no ar · 100% uptime</div>
                <div>
                  <span style={{ color: 'var(--accent)' }}>$</span>
                  <span style={{ display: 'inline-block', width: 7, height: 14, background: 'var(--accent)', verticalAlign: '-2px', marginLeft: 4, animation: 'footerCursorBlink 1.1s steps(1) infinite' }} />
                </div>
              </div>
            </div>

            {/* Logo mark (alt vazio: o nome já vem no texto ao lado) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" width={20} height={20} alt="" style={{ display: 'block', flexShrink: 0 }} />
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
            { label: 'WhatsApp', href: 'https://wa.me/5535997460058' },
            { label: 'E-mail',   href: 'mailto:contato@digitalcodexa.com' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/mateus-vitor-ferreira-dev' },
            { label: 'GitHub',   href: 'https://github.com/mateus-vitor-ferreira-dev' },
          ]} />
        </div>

        {/* Bottom bar (paddingTop menor compensa a altura de 44px dos links) */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16,
          alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 15,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-faint)',
        }}>
          <span>© 2026 Codexa. Todos os direitos reservados.</span>
          <a href="/privacidade" style={{ ...LINK_ALVO, color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
          >Política de Privacidade</a>
          <div style={{ display: 'flex', gap: 22 }}>
            {[
              { label: 'LinkedIn',  href: 'https://linkedin.com/in/mateus-vitor-ferreira-dev' },
              { label: 'Instagram', href: 'https://www.instagram.com/desenvolvedoracodexa/' },
              { label: 'GitHub',    href: 'https://github.com/mateus-vitor-ferreira-dev' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ ...LINK_ALVO, color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.25s' }}
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
  )
}
