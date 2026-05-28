'use client'

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

function Track() {
  const items = [...PROMISES, ...PROMISES]
  return (
    <div
      aria-hidden="true"
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        'clamp(40px, 5vw, 64px)',
        willChange: 'transform',
        animation:  'marqueeScroll 50s linear infinite',
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
              style={{ color: '#4dd8e0', flexShrink: 0 }}
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
                background:  'rgba(77,216,224,0.35)',
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
  return (
    <section
      aria-label="O que você leva ao trabalhar conosco"
      style={{
        background:  '#0d0614',
        borderTop:   '1px solid rgba(77,216,224,0.08)',
        borderBottom:'1px solid rgba(77,216,224,0.08)',
        padding:     'clamp(32px, 5vw, 56px) 0',
        overflow:    'hidden',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '9px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color:         'rgba(77,216,224,0.35)',
          textAlign:     'center',
          marginBottom:  'clamp(20px, 3vw, 32px)',
        }}
      >
        O que você leva ao trabalhar conosco
      </p>

      {/* Marquee wrapper */}
      <div
        style={{
          position:   'relative',
          maskImage:  'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
        className="promises-marquee-root"
      >
        <Track />
      </div>

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .promises-marquee-root [style*="marqueeScroll"] {
            animation-play-state: paused;
          }
        }
        .promises-marquee-root:hover [style*="marqueeScroll"] {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
