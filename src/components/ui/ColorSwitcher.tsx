'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme, THEMES } from '@/context/ThemeContext'
import { gsap } from 'gsap'

const HINT_KEY = 'codexa:color-hint-seen'

export function ColorSwitcher() {
  const { theme, mode, setTheme, setMode } = useTheme()
  const dockRef  = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const hintRef  = useRef<HTMLDivElement>(null)
  const [touched, setTouched] = useState(false)
  // Celular: o dock fica recolhido num botão só e abre a paleta no toque
  const [open, setOpen] = useState(false)

  const dismissHint = () => {
    try { sessionStorage.setItem(HINT_KEY, '1') } catch {}
    if (hintRef.current) gsap.to(hintRef.current, { opacity: 0, y: 6, duration: 0.35, ease: 'power2.in' })
  }

  /* Entrada — espera o preloader liberar a página */
  useEffect(() => {
    const dock = dockRef.current
    if (!dock) return

    let hintTimer: ReturnType<typeof setTimeout>
    const hintSeen = () => {
      try { return sessionStorage.getItem(HINT_KEY) === '1' } catch { return false }
    }
    // A dica espera a primeira rolagem: na abertura ela cobria o fim do Hero no celular
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.6) return
      window.removeEventListener('scroll', onScroll)
      // quem já abriu a paleta antes de rolar não precisa da dica
      if (hintSeen() || !hintRef.current) return
      gsap.to(hintRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.3 })
      hintTimer = setTimeout(() => dismissHint(), 6000)
    }
    const reveal = () => {
      gsap.to(dock, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })

      // Pulso de atenção no anel — para assim que o visitante interage
      if (ringRef.current) {
        gsap.fromTo(ringRef.current,
          { opacity: 0.5, scale: 0.98 },
          { opacity: 0, scale: 1.12, duration: 1.6, ease: 'power2.out', repeat: 3, repeatDelay: 1.2, delay: 0.6 },
        )
      }

      // Balão de dica — só na primeira visita da sessão, depois da primeira rolagem
      if (!hintSeen()) {
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
      }
    }

    const fallback = setTimeout(reveal, 3200)
    const onReady  = () => { clearTimeout(fallback); reveal() }
    window.addEventListener('lenis-start', onReady, { once: true })

    return () => {
      clearTimeout(fallback)
      clearTimeout(hintTimer)
      window.removeEventListener('lenis-start', onReady)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const markTouched = () => {
    if (!touched) {
      setTouched(true)
      if (ringRef.current) gsap.killTweensOf(ringRef.current)
      gsap.set(ringRef.current, { opacity: 0 })
      dismissHint()
    }
  }

  const onAuto = () => {
    setMode(mode === 'auto' ? 'manual' : 'auto')
    markTouched()
  }

  const onPick = (t: typeof THEMES[0]) => {
    setTheme(t)
    markTouched()
    setOpen(false)
  }

  // Fecha a paleta aberta ao tocar fora dela
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!dockRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div
      ref={dockRef}
      className="color-dock"
      data-open={open ? '' : undefined}
      style={{
        position:  'fixed',
        zIndex:    1000,
        opacity:   0,
        transform: 'translateY(14px)',
      }}
    >
      {/* Balão de primeira visita */}
      <div
        ref={hintRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        'calc(100% + 12px)',
          left:          4,
          width:         'max-content',
          maxWidth:      'calc(100vw - 40px)',
          boxSizing:     'border-box',
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.7rem',
          letterSpacing: '0.06em',
          color:         'var(--text)',
          background:    'rgba(12,12,18,0.92)',
          backdropFilter:'blur(10px)',
          border:        '1px solid rgba(var(--accent-rgb),0.35)',
          borderRadius:  10,
          padding:       '9px 13px',
          opacity:       0,
          transform:     'translateY(6px)',
          pointerEvents: 'none',
          boxShadow:     '0 12px 32px rgba(0,0,0,0.5)',
        }}
      >
        A cor muda a cada seção — ou escolha a sua
        <span style={{
          position:   'absolute',
          left:       22,
          top:        '100%',
          width:      8,
          height:     8,
          background: 'rgba(12,12,18,0.92)',
          borderRight:  '1px solid rgba(var(--accent-rgb),0.35)',
          borderBottom: '1px solid rgba(var(--accent-rgb),0.35)',
          transform:  'translateY(-5px) rotate(45deg)',
        }} />
      </div>

      {/* gap e padding ficam no <style> abaixo: compensam a área de toque maior dos botões */}
      <div
        className="color-dock-bar"
        style={{
          position:       'relative',
          display:        'flex',
          alignItems:     'center',
          background:    'rgba(10,10,14,0.72)',
          backdropFilter: 'blur(14px)',
          borderRadius:   999,
          border:         '1px solid rgba(255,255,255,0.1)',
          boxShadow:      '0 10px 32px rgba(0,0,0,0.45), 0 0 24px rgba(var(--accent-rgb),0.12)',
        }}
      >
        {/* Anel de atenção */}
        <div
          ref={ringRef}
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         -4,
            borderRadius:  999,
            border:        '1px solid rgba(var(--accent-rgb),0.6)',
            opacity:       0,
            pointerEvents: 'none',
          }}
        />

        {/* Só no celular: abre e fecha a paleta */}
        <button
          type="button"
          className="color-dock-toggle"
          aria-label="Escolher a cor do site"
          aria-expanded={open}
          onClick={() => { setOpen(o => !o); if (!touched) dismissHint() }}
          style={{
            padding:        0,
            background:     'transparent',
            border:         'none',
            alignItems:     'center',
            justifyContent: 'center',
            color:          'var(--accent)',
          }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--accent)', flexShrink: 0 }}>
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
        </button>

        <span
          className="color-dock-label"
          style={{
            display:       'flex',
            alignItems:    'center',
            fontFamily:    'var(--font-mono)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--text-faint)',
            userSelect:    'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
          <span>Cor</span>
          {/* Nome da cor atual (o botão Auto já mostra o modo); largura da mais longa, para o dock não pular */}
          <span aria-live="polite" style={{ color: 'var(--text)', letterSpacing: '0.08em', minWidth: '9.6em', whiteSpace: 'nowrap' }}>
            {theme.label}
          </span>
        </span>

        <div className="color-dock-swatches" style={{ alignItems: 'center' }}>
          <button
            type="button"
            className="color-dock-auto"
            aria-pressed={mode === 'auto'}
            title={mode === 'auto' ? 'A cor acompanha a seção. Clique para fixar a cor atual' : 'Voltar a trocar a cor a cada seção'}
            onClick={onAuto}
          >
            Auto
          </button>
          {THEMES.map((t) => {
            const active = theme.id === t.id
            return (
              // Botão = área de toque (44px mobile / 32px desktop); o anel de 22px e a bolinha são o visual
              <button
                key={t.id}
                type="button"
                className="color-dock-btn"
                aria-label={`Aplicar tema ${t.label}`}
                aria-pressed={mode === 'manual' && active}
                title={t.label}
                onClick={() => onPick(t)}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.22, duration: 0.18, ease: 'back.out(2)' })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.18 })}
                style={{
                  position:       'relative',
                  padding:        0,
                  background:     'transparent',
                  border:         'none',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}
              >
                <span
                  className="color-dock-ring"
                  style={{
                    width:          22,
                    height:         22,
                    borderRadius:   '50%',
                    border:         `1.5px solid ${active ? t.accent : 'transparent'}`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    transition:     'border-color 0.2s',
                  }}
                >
                  <span style={{
                    width:        13,
                    height:       13,
                    borderRadius: '50%',
                    background:   t.accent,
                    boxShadow:    active ? `0 0 12px ${t.accent}` : `0 0 6px ${t.accent}55`,
                    transform:    `scale(${active ? 12 / 13 : 1})`,
                    transition:   'transform 0.2s, box-shadow 0.2s',
                  }} />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        /* Posição e label ficam aqui (não inline) para o media query mobile conseguir sobrescrever */
        .color-dock { left: 20px; bottom: 26px; }
        .color-dock-label { gap: 8px; font-size: 0.68rem; }
        /* Desktop: alvo de 36px; margem negativa mantém a altura do dock */
        .color-dock-bar { gap: 12px; padding: 11px 12px 11px 16px; }
        .color-dock-swatches { gap: 2px; }
        .color-dock-btn { width: 36px; height: 36px; margin: -6px 0; }
        .color-dock-btn .color-dock-ring { transform: scale(1.15); }
        .color-dock-auto {
          font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase;
          height: 28px; padding: 0 11px; margin-right: 6px; border-radius: 999px; cursor: pointer;
          color: var(--text-muted); background: transparent; border: 1px solid rgba(255,255,255,0.16);
          transition: color .25s, background .25s, border-color .25s;
        }
        .color-dock-auto[aria-pressed="true"] { color: #06060c; background: var(--accent); border-color: var(--accent); }
        .color-dock-auto:hover { border-color: var(--accent); }
        .color-dock-auto:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .color-dock-btn:focus-visible { outline: none; }
        .color-dock-btn:focus-visible .color-dock-ring { outline: 2px solid var(--accent); outline-offset: 2px; }
        .color-dock-toggle { display: none; }
        .color-dock-swatches { display: flex; }
        @media (max-width: 640px) {
          .color-dock { left: 12px; bottom: 16px; }
          /* Mobile: recolhido é só o botão da paleta (44px); aberto mostra as cores com alvo de 44px */
          .color-dock-bar { gap: 0; padding: 0; }
          .color-dock-toggle { display: flex; width: 44px; height: 44px; }
          .color-dock-label { display: none !important; }
          .color-dock-swatches { display: none; }
          .color-dock[data-open] .color-dock-swatches { display: flex; padding-right: 4px; }
          .color-dock-auto { height: 32px; margin: 0 4px 0 2px; }
          .color-dock-btn { width: 40px; height: 44px; margin: 0; }
        }
      `}</style>
    </div>
  )
}
