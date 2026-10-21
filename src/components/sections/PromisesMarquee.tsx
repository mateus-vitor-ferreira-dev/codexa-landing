'use client'

import { forwardRef, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleText } from '@/lib/fx/ScrambleText'
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

gsap.registerPlugin(ScrollTrigger)

const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

// Faixa animada é só decorativa: o leitor de tela lê a <ul> abaixo
const Track = forwardRef<HTMLDivElement>(function Track(_props, ref) {
  const items = [...PROMISES, ...PROMISES]
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="marquee-track"
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        'clamp(40px, 5vw, 64px)',
        // o gap também entra depois do último item: a 2ª metade começa exatamente em -50%
        paddingRight: 'clamp(40px, 5vw, 64px)',
        width:      'max-content',
        willChange: 'transform',
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
})

export function PromisesMarquee() {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false)
  // null = visitante não mexeu; aí vale o reduced-motion
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const paused = userPaused ?? reduced
  const trackRef = useRef<HTMLDivElement>(null)
  const rootRef  = useRef<HTMLDivElement>(null)
  const loopRef  = useRef<gsap.core.Tween | null>(null)

  /* Faixa movida pelo GSAP (não CSS) para a velocidade poder reagir à
     rolagem: rolar rápido acelera a faixa, rolar para cima inverte o
     sentido por um instante, e tudo volta suave à velocidade base.
     Mouse em cima desacelera até parar (em vez de travar seco). */
  useEffect(() => {
    const track = trackRef.current, root = rootRef.current
    if (!track || !root) return
    const loop = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 50, ease: 'none', repeat: -1 })
    loopRef.current = loop

    let dir = 1, boost = 0, hover = 1, speed = 1
    // Com reduced-motion a faixa só anda se o visitante pedir, e sem o efeito da rolagem
    const calm = window.matchMedia(REDUCED).matches
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        if (calm) return
        const v = self.getVelocity()            // px/s, com sinal
        if (Math.abs(v) > 30) dir = v < 0 ? -1 : 1
        boost = Math.max(boost, Math.min(Math.abs(v) / 260, 7))
      },
    })
    const tick = () => {
      boost *= 0.92
      const want = dir * (1 + boost) * hover
      speed += (want - speed) * 0.08
      loop.timeScale(speed)
    }
    const onEnter = () => { hover = 0 }
    const onLeave = () => { hover = 1 }
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      st.kill(); loop.kill(); loopRef.current = null
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      gsap.set(track, { clearProps: 'transform' })
    }
  }, [])

  useEffect(() => {
    const loop = loopRef.current
    if (!loop) return
    if (paused) loop.pause()
    else loop.play()
  }, [paused])

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
        <ScrambleText text="O que você leva ao trabalhar conosco" duration={1200} />
      </p>

      {/* Lista real para leitores de tela */}
      <ul className="sr-only">
        {PROMISES.map((p) => <li key={p.label}>{p.label}</li>)}
      </ul>

      {/* Marquee wrapper */}
      <div
        ref={rootRef}
        style={{
          position:   'relative',
          maskImage:  'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
        className="promises-marquee-root"
      >
        <Track ref={trackRef} />
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
        .promises-marquee-toggle:hover,
        .promises-marquee-toggle:focus-visible { color: var(--text); }
      `}</style>
    </section>
  )
}
