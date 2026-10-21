'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { NeuralBackground } from '@/components/fx/NeuralBackground'

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
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )

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

    </>
  )
}
