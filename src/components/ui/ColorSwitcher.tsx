'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme, THEMES } from '@/context/ThemeContext'
import { gsap } from 'gsap'

const HINT_KEY = 'codexa:color-hint-seen'

export function ColorSwitcher() {
  const { theme, setTheme } = useTheme()
  const dockRef  = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const hintRef  = useRef<HTMLDivElement>(null)
  const [touched, setTouched] = useState(false)

  const dismissHint = () => {
    try { sessionStorage.setItem(HINT_KEY, '1') } catch {}
    if (hintRef.current) gsap.to(hintRef.current, { opacity: 0, y: 6, duration: 0.35, ease: 'power2.in' })
  }

  /* Entrada — espera o preloader liberar a página */
  useEffect(() => {
    const dock = dockRef.current
    if (!dock) return

    let hintTimer: ReturnType<typeof setTimeout>
    const reveal = () => {
      gsap.to(dock, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })

      // Pulso de atenção no anel — para assim que o visitante interage
      if (ringRef.current) {
        gsap.fromTo(ringRef.current,
          { opacity: 0.5, scale: 0.98 },
          { opacity: 0, scale: 1.12, duration: 1.6, ease: 'power2.out', repeat: 3, repeatDelay: 1.2, delay: 0.6 },
        )
      }

      // Balão de dica — só na primeira visita da sessão
      let seen = true
      try { seen = sessionStorage.getItem(HINT_KEY) === '1' } catch { seen = false }
      if (!seen && hintRef.current) {
        gsap.to(hintRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 1.1 })
        hintTimer = setTimeout(() => dismissHint(), 8000)
      }
    }

    const fallback = setTimeout(reveal, 3200)
    const onReady  = () => { clearTimeout(fallback); reveal() }
    window.addEventListener('lenis-start', onReady, { once: true })

    return () => {
      clearTimeout(fallback)
      clearTimeout(hintTimer)
      window.removeEventListener('lenis-start', onReady)
    }
  }, [])

  const onPick = (t: typeof THEMES[0]) => {
    setTheme(t)
    if (!touched) {
      setTouched(true)
      if (ringRef.current) gsap.killTweensOf(ringRef.current)
      gsap.set(ringRef.current, { opacity: 0 })
      dismissHint()
    }
  }

  return (
    <div
      ref={dockRef}
      className="color-dock"
      style={{
        position:  'fixed',
        left:      20,
        bottom:    26,
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
          whiteSpace:    'nowrap',
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
        Esta página muda de cor — escolha a sua
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

      <div
        style={{
          position:       'relative',
          display:        'flex',
          alignItems:     'center',
          gap:            14,
          padding:        '10px 16px 10px 14px',
          background:     'rgba(10,10,14,0.72)',
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

        <span
          className="color-dock-label"
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           7,
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.62rem',
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
          Cor do site
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {THEMES.map((t) => {
            const active = theme.id === t.id
            return (
              <button
                key={t.id}
                type="button"
                aria-label={`Aplicar tema ${t.label}`}
                aria-pressed={active}
                title={t.label}
                onClick={() => onPick(t)}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.22, duration: 0.18, ease: 'back.out(2)' })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.18 })}
                style={{
                  position:       'relative',
                  width:          22,
                  height:         22,
                  padding:        0,
                  borderRadius:   '50%',
                  background:     'transparent',
                  border:         `1.5px solid ${active ? t.accent : 'transparent'}`,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         'none',
                  outline:        'none',
                  transition:     'border-color 0.2s',
                }}
              >
                <span style={{
                  width:        active ? 12 : 13,
                  height:       active ? 12 : 13,
                  borderRadius: '50%',
                  background:   t.accent,
                  boxShadow:    active ? `0 0 12px ${t.accent}` : `0 0 6px ${t.accent}55`,
                  transition:   'width 0.2s, height 0.2s, box-shadow 0.2s',
                }} />
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .color-dock { left: 12px; bottom: 16px; }
          .color-dock-label span,
          .color-dock-label { font-size: 0; gap: 0; }
          .color-dock-label svg { width: 16px; height: 16px; }
        }
      `}</style>
    </div>
  )
}
