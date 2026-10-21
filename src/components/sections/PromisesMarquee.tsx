'use client'

import { useState, useSyncExternalStore } from 'react'
import {
  Code2, Shield, User, Rocket, Check,
  RefreshCw, Clock, Eye, Handshake, MessageCircle,
} from 'lucide-react'

const PROMISES = [
  { icon: Code2,          label: 'Código 100% seu — sem lock-in'         },
  { icon: Shield,         label: 'Segurança e boas práticas em cada linha' },
  { icon: User,           label: 'Atendimento próximo e sem burocracia'   },
  { icon: Rocket,         label: 'Deploy em produção dentro do prazo'     },
  { icon: Check,          label: 'Escopo claro antes de assinar'          },
  { icon: RefreshCw,      label: 'Revisões inclusas — sem surpresas'      },
  { icon: Clock,          label: 'Suporte pós-entrega garantido'          },
  { icon: Eye,            label: 'Transparência total no processo'        },
  { icon: Handshake,      label: 'Parceria de longo prazo, não projeto único' },
  { icon: MessageCircle,  label: 'Comunicação ativa durante todo o projeto' },
]

const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

// Faixa animada é só decorativa: o leitor de tela lê a <ul> abaixo
function Track() {
  const items = [...PROMISES, ...PROMISES]
  return (
    <div
      aria-hidden="true"
      className="marquee-track"
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        'clamp(40px, 5vw, 64px)',
        willChange: 'transform',
        // Longhands (sem o atalho animation) para o play-state continuar vindo do CSS: pausa/hover
        animationName:           'marqueeScroll',
        animationDuration:       '50s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      }}
    >
      {items.map((p, i) => {
        const Icon = p.icon
        return (
          <span
            key={i}
            style={{
              display:     'inline-flex',
              alignItems:  'center',
              gap:         '10px',
              whiteSpace:  'nowrap',
              flexShrink:  0,
            }}
          >
            <Icon
              size={15}
              strokeWidth={1.5}
              style={{ color: 'var(--accent)', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '11px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color:         'var(--text-muted)',
              }}
            >
              {p.label}
            </span>
            <span
              aria-hidden="true"
              style={{
                marginLeft:  '24px',
                width:       '4px',
                height:      '4px',
                borderRadius: '50%',
                background:  'rgba(var(--accent-rgb),0.35)',
                flexShrink:  0,
              }}
            />
          </span>
        )
      })}
    </div>
  )
}

export function PromisesMarquee() {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false)
  // null = visitante não mexeu; aí vale o reduced-motion
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const paused = userPaused ?? reduced

  return (
    <section
      aria-label="O que você leva ao trabalhar conosco"
      style={{
        background:  'rgba(255,255,255,0.022)',
        borderTop:   '1px solid rgba(var(--accent-rgb),0.08)',
        borderBottom:'1px solid rgba(var(--accent-rgb),0.08)',
        padding:     'clamp(32px, 5vw, 56px) 0',
        overflow:    'hidden',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.75rem',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color:         'var(--accent)', // 35% de opacidade não passava de 4,5:1
          textAlign:     'center',
          marginBottom:  'clamp(20px, 3vw, 32px)',
        }}
      >
        O que você leva ao trabalhar conosco
      </p>

      {/* Lista real para leitores de tela */}
      <ul className="sr-only">
        {PROMISES.map((p) => <li key={p.label}>{p.label}</li>)}
      </ul>

      {/* Marquee wrapper */}
      <div
        style={{
          position:   'relative',
          maskImage:  'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
        className={`promises-marquee-root${paused ? ' marquee-paused' : ''}${userPaused === false ? ' marquee-playing' : ''}`}
      >
        <Track />
      </div>

      {/* Pausar/retomar — alvo de 44px, visual discreto */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(12px, 2vw, 20px)' }}>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setUserPaused(!paused)}
          className="promises-marquee-toggle"
          style={{
            minHeight:     44,
            padding:       '0 16px',
            background:    'transparent',
            border:        'none',
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         'var(--text-muted)',
            transition:    'color 0.2s',
          }}
        >
          {paused ? 'Retomar animação' : 'Pausar animação'}
        </button>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .promises-marquee-root:not(.marquee-playing) .marquee-track {
            animation-play-state: paused;
          }
        }
        .promises-marquee-root:hover .marquee-track {
          animation-play-state: paused;
        }
        .promises-marquee-toggle:hover,
        .promises-marquee-toggle:focus-visible { color: var(--text); }
      `}</style>
    </section>
  )
}
