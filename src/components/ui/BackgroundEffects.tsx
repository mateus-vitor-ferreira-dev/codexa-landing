'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { NeuralBackground } from '@/components/fx/NeuralBackground'

const COMMANDS = [
  'npm run build',
  'git push origin main',
  'docker compose up -d',
  'pnpm deploy --prod',
  'kubectl apply -f .',
  'next build && next start',
  'prisma migrate deploy',
  'vercel --prod',
  'yarn test --coverage',
]

const CODE_SYMS = ['{ }', '< />', '=>', '&&', '||', '( )', '[ ]', ';', '/*', '*/', '!=', '===']
const DENSITY_MULT = { low: 0.5, medium: 1, high: 1.5 } as const

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_MOTION)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

interface Props { density?: 'low' | 'medium' | 'high' }

export function BackgroundEffects({ density = 'medium' }: Props) {
  const mult = DENSITY_MULT[density]

  const binaryRef = useRef<HTMLDivElement>(null)
  const symbolRef = useRef<HTMLDivElement>(null)
  const [typedText, setTypedText] = useState('')
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
  // Com movimento reduzido o terminal fica parado no último comando
  const termText = reduced ? COMMANDS[COMMANDS.length - 1] : typedText

  useEffect(() => {
    const dead    = { v: false }
    const cleanups: Array<() => void> = []

    const reg = (id: ReturnType<typeof setInterval>) => { cleanups.push(() => clearInterval(id)); return id }

    // ── Layer 3: Vertical binary drops ───────────────────────────
    if (!reduced && binaryRef.current) {
      const c = binaryRef.current
      const spawnBinary = () => {
        if (dead.v) return
        const len = 8 + Math.floor(Math.random() * 12)
        const text = Array.from({ length: len }, () => Math.random() > .5 ? '1' : '0').join('')
        const dur  = 15 + Math.random() * 15
        const el   = document.createElement('div')
        el.style.cssText = `position:absolute;left:${Math.random() * window.innerWidth}px;top:0;font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(var(--accent-rgb),.15);writing-mode:vertical-rl;letter-spacing:6px;will-change:transform;animation:bgBinaryDrop ${dur}s linear forwards;`
        el.textContent = text
        c.appendChild(el)
        setTimeout(() => { try { el.remove() } catch {} }, (dur + 1) * 1000)
      }
      for (let i = 0; i < Math.round(12 * mult); i++) {
        setTimeout(spawnBinary, Math.random() * 5000)
      }
      reg(setInterval(spawnBinary, Math.round(2500 / mult)))
    }

    // ── Layer 5: Rising code symbols ─────────────────────────────
    if (!reduced && symbolRef.current) {
      const c = symbolRef.current
      const spawnSym = () => {
        if (dead.v) return
        const sym  = CODE_SYMS[Math.floor(Math.random() * CODE_SYMS.length)]
        const size = 11 + Math.floor(Math.random() * 7)
        const dur  = 20 + Math.random() * 20
        const rot  = ((Math.random() - .5) * 30).toFixed(1)
        const el   = document.createElement('div')
        el.setAttribute('style',
          `--rot:${rot}deg;position:absolute;left:${Math.random() * (window.innerWidth - 60)}px;top:0;` +
          `font-family:'JetBrains Mono',monospace;font-size:${size}px;color:rgba(var(--accent-rgb),.18);` +
          `will-change:transform;animation:bgSymbolRise ${dur}s linear forwards;`
        )
        el.textContent = sym
        c.appendChild(el)
        setTimeout(() => { try { el.remove() } catch {} }, (dur + 1) * 1000)
      }
      for (let i = 0; i < 5; i++) setTimeout(spawnSym, Math.random() * 8000)
      reg(setInterval(spawnSym, Math.round(4500 / mult)))
    }

    // ── Layer 6: Terminal typewriter ──────────────────────────────
    let termTimer: ReturnType<typeof setTimeout> | undefined

    if (!reduced) {
      let cmdIdx = 0
      const typeNext = () => {
        if (dead.v) return
        const cmd = COMMANDS[cmdIdx % COMMANDS.length]
        let ci = 0
        const typeChar = () => {
          if (dead.v) return
          setTypedText(cmd.slice(0, ci + 1)); ci++
          if (ci < cmd.length) {
            termTimer = setTimeout(typeChar, 60 + Math.random() * 40)
          } else {
            termTimer = setTimeout(() => {
              if (dead.v) return
              let ei = cmd.length
              const erase = () => {
                if (dead.v) return
                ei--; setTypedText(cmd.slice(0, ei))
                if (ei > 0) termTimer = setTimeout(erase, 25)
                else { cmdIdx++; termTimer = setTimeout(typeNext, 300) }
              }
              erase()
            }, 1500)
          }
        }
        typeChar()
      }
      termTimer = setTimeout(typeNext, 1000)
      cleanups.push(() => { if (termTimer !== undefined) clearTimeout(termTimer) })
    }

    return () => {
      dead.v = true
      cleanups.forEach(fn => fn())
    }
  }, [mult, reduced])

  return (
    <>
      <style>{`
        @keyframes bgBinaryDrop {
          from { transform: translateY(-220px); }
          to   { transform: translateY(calc(100vh + 220px)); }
        }
        @keyframes bgSymbolRise {
          from { transform: translateY(calc(100vh + 60px)) rotate(var(--rot, 0deg)); }
          to   { transform: translateY(-160px) rotate(var(--rot, 0deg)); }
        }
        @keyframes bgCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Camadas decorativas: grade, rede neural, binários e símbolos */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
      >
        {/* Layer 1: static grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: [
            `linear-gradient(rgba(var(--accent-rgb),.025) 1px, transparent 1px)`,
            `linear-gradient(90deg, rgba(var(--accent-rgb),.025) 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: '60px 60px',
        }} />

        {/* Rede neural viva (WebGL): substitui a rede SVG estática e as células piscando */}
        <NeuralBackground />
        <div ref={binaryRef} style={{ position: 'absolute', inset: 0 }} />
        <div ref={symbolRef} style={{ position: 'absolute', inset: 0 }} />
      </div>

      {/* Layer 6: terminal — own stacking context above sections */}
      <div
        aria-hidden="true"
        className="bg-terminal"
        style={{
          position:  'fixed',
          bottom:    '132px',
          left:      '24px',
          zIndex:    2,
          width:     '280px',
          background: 'rgba(10,10,14,.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border:    '1px solid rgba(255,255,255,.08)',
          borderRadius: '10px',
          overflow:  'hidden',
          fontFamily: '"JetBrains Mono",monospace',
          fontSize:  '12px',
          pointerEvents: 'none',
        }}
      >
        {/* macOS dots */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          background: 'rgba(255,255,255,.03)',
        }}>
          {['#ff5f57','#ffbd2e','#28c840'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
          ))}
          <span style={{ marginLeft: 6, color: 'rgba(255,255,255,.3)', fontSize: 10 }}>codexa@deploy</span>
        </div>

        {/* Body */}
        <div style={{ padding: '10px 14px 14px', display: 'flex', alignItems: 'flex-start', gap: 6, minHeight: 36 }}>
          <span style={{ color: 'var(--accent)', userSelect: 'none', flexShrink: 0 }}>$</span>
          <span style={{ color: 'rgba(255,255,255,.75)', wordBreak: 'break-all', flex: 1 }}>{termText}</span>
          <span style={{
            display: 'inline-block', width: 7, height: 14,
            background: 'var(--accent)', flexShrink: 0, alignSelf: 'center',
            animation: 'bgCursorBlink 1s step-end infinite',
          }} />
        </div>
      </div>
    </>
  )
}
