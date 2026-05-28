'use client'

import { useEffect, useRef, useState } from 'react'

const ACCENT     = '#4dd8e0'
const ACCENT_RGB = '77,216,224'

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

interface Props { density?: 'low' | 'medium' | 'high' }

export function BackgroundEffects({ density = 'medium' }: Props) {
  const mult = DENSITY_MULT[density]

  const flashRef  = useRef<HTMLDivElement>(null)
  const binaryRef = useRef<HTMLDivElement>(null)
  const symbolRef = useRef<HTMLDivElement>(null)
  const svgRef    = useRef<SVGSVGElement>(null)
  const [termText, setTermText] = useState('')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dead    = { v: false }
    const cleanups: Array<() => void> = []

    const reg = (id: ReturnType<typeof setInterval>) => { cleanups.push(() => clearInterval(id)); return id }

    // ── Layer 2: Flashing grid cells ─────────────────────────────
    if (!reduced && flashRef.current) {
      const c = flashRef.current
      reg(setInterval(() => {
        if (dead.v) return
        const W = window.innerWidth, H = window.innerHeight
        const el = document.createElement('div')
        const col = Math.floor(Math.random() * Math.floor(W / 60))
        const row = Math.floor(Math.random() * Math.floor(H / 60))
        el.style.cssText = `position:absolute;left:${col*60}px;top:${row*60}px;width:60px;height:60px;background:rgba(${ACCENT_RGB},.08);opacity:0;animation:bgCellFlash 4s ease-out forwards;`
        c.appendChild(el)
        setTimeout(() => { try { el.remove() } catch {} }, 4200)
      }, Math.round(1200 / mult)))
    }

    // ── Layer 3: Vertical binary drops ───────────────────────────
    if (!reduced && binaryRef.current) {
      const c = binaryRef.current
      const spawnBinary = () => {
        if (dead.v) return
        const len = 8 + Math.floor(Math.random() * 12)
        const text = Array.from({ length: len }, () => Math.random() > .5 ? '1' : '0').join('')
        const dur  = 15 + Math.random() * 15
        const el   = document.createElement('div')
        el.style.cssText = `position:absolute;left:${Math.random() * window.innerWidth}px;top:0;font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(${ACCENT_RGB},.15);writing-mode:vertical-rl;letter-spacing:6px;will-change:transform;animation:bgBinaryDrop ${dur}s linear forwards;`
        el.textContent = text
        c.appendChild(el)
        setTimeout(() => { try { el.remove() } catch {} }, (dur + 1) * 1000)
      }
      for (let i = 0; i < Math.round(12 * mult); i++) {
        setTimeout(spawnBinary, Math.random() * 5000)
      }
      reg(setInterval(spawnBinary, Math.round(2500 / mult)))
    }

    // ── Layer 4: Node network ────────────────────────────────────
    let nodes: Array<{ x: number; y: number }> = []
    let edges: Array<[number, number]> = []
    const NS = 'http://www.w3.org/2000/svg'

    const buildNetwork = () => {
      const svg = svgRef.current
      if (!svg || dead.v) return
      const W = window.innerWidth, H = window.innerHeight
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      nodes = []; edges = []

      let tries = 0
      while (nodes.length < 14 && tries < 400) {
        tries++
        const x = Math.random() * W, y = Math.random() * H
        if (x > W * .25 && x < W * .75 && y > H * .25 && y < H * .75) continue
        nodes.push({ x, y })
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          if (dx*dx + dy*dy >= 280*280) continue
          edges.push([i, j])
          const line = document.createElementNS(NS, 'line')
          line.setAttribute('x1', String(nodes[i].x)); line.setAttribute('y1', String(nodes[i].y))
          line.setAttribute('x2', String(nodes[j].x)); line.setAttribute('y2', String(nodes[j].y))
          line.setAttribute('stroke', `rgba(${ACCENT_RGB},.12)`)
          line.setAttribute('stroke-width', '.5')
          svg.appendChild(line)
        }
      }

      nodes.forEach((node, i) => {
        const circle = document.createElementNS(NS, 'circle')
        circle.setAttribute('cx', String(node.x)); circle.setAttribute('cy', String(node.y))
        circle.setAttribute('r', '2'); circle.setAttribute('fill', `rgba(${ACCENT_RGB},.5)`)
        ;(['r', 'opacity'] as const).forEach((attr, ai) => {
          const anim = document.createElementNS(NS, 'animate')
          anim.setAttribute('attributeName', attr)
          anim.setAttribute('values', ai === 0 ? '2;3;2' : '.3;.7;.3')
          anim.setAttribute('dur', '3s')
          anim.setAttribute('begin', `${(i * .3).toFixed(1)}s`)
          anim.setAttribute('repeatCount', 'indefinite')
          circle.appendChild(anim)
        })
        svg.appendChild(circle)
      })
    }

    const firePulse = () => {
      const svg = svgRef.current
      if (!svg || dead.v || edges.length === 0) return
      const [fi, ti] = edges[Math.floor(Math.random() * edges.length)]
      const from = nodes[fi], to = nodes[ti]
      if (!from || !to) return
      const dot = document.createElementNS(NS, 'circle')
      dot.setAttribute('r', '3'); dot.setAttribute('fill', ACCENT)
      dot.style.filter = `drop-shadow(0 0 4px ${ACCENT})`
      svg.appendChild(dot)
      const dur = 1200 + Math.random() * 800, t0 = performance.now()
      const tick = (now: number) => {
        if (dead.v) { try { dot.remove() } catch {} ; return }
        const t = Math.min((now - t0) / dur, 1)
        const s = t * t * (3 - 2 * t)
        dot.setAttribute('cx', String(from.x + (to.x - from.x) * s))
        dot.setAttribute('cy', String(from.y + (to.y - from.y) * s))
        dot.setAttribute('opacity', String(t < .2 ? t / .2 : t > .8 ? (1 - t) / .2 : 1))
        if (t < 1) requestAnimationFrame(tick); else try { dot.remove() } catch {}
      }
      requestAnimationFrame(tick)
    }

    if (!reduced) {
      buildNetwork()
      reg(setInterval(firePulse, 600))
      let resizeT: ReturnType<typeof setTimeout>
      const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(buildNetwork, 250) }
      window.addEventListener('resize', onResize)
      cleanups.push(() => { clearTimeout(resizeT); window.removeEventListener('resize', onResize) })
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
          `font-family:'JetBrains Mono',monospace;font-size:${size}px;color:rgba(${ACCENT_RGB},.18);` +
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

    if (reduced) {
      setTermText(COMMANDS[COMMANDS.length - 1])
    } else {
      let cmdIdx = 0
      const typeNext = () => {
        if (dead.v) return
        const cmd = COMMANDS[cmdIdx % COMMANDS.length]
        let ci = 0
        const typeChar = () => {
          if (dead.v) return
          setTermText(cmd.slice(0, ci + 1)); ci++
          if (ci < cmd.length) {
            termTimer = setTimeout(typeChar, 60 + Math.random() * 40)
          } else {
            termTimer = setTimeout(() => {
              if (dead.v) return
              let ei = cmd.length
              const erase = () => {
                if (dead.v) return
                ei--; setTermText(cmd.slice(0, ei))
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
  }, [mult])

  return (
    <>
      <style>{`
        @keyframes bgCellFlash {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          100% { opacity: 0; }
        }
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

      {/* Layers 1–5: decorative backdrop */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
      >
        {/* Layer 1: static grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: [
            `linear-gradient(rgba(${ACCENT_RGB},.025) 1px, transparent 1px)`,
            `linear-gradient(90deg, rgba(${ACCENT_RGB},.025) 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: '60px 60px',
        }} />

        <div ref={flashRef}  style={{ position: 'absolute', inset: 0 }} />
        <div ref={binaryRef} style={{ position: 'absolute', inset: 0 }} />
        <svg ref={svgRef} aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div ref={symbolRef} style={{ position: 'absolute', inset: 0 }} />
      </div>

      {/* Layer 6: terminal — own stacking context above sections */}
      <div
        aria-hidden="true"
        style={{
          position:  'fixed',
          bottom:    '24px',
          left:      '24px',
          zIndex:    2,
          width:     '280px',
          background: 'rgba(15,8,22,.85)',
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
          <span style={{ color: ACCENT, userSelect: 'none', flexShrink: 0 }}>$</span>
          <span style={{ color: 'rgba(255,255,255,.75)', wordBreak: 'break-all', flex: 1 }}>{termText}</span>
          <span style={{
            display: 'inline-block', width: 7, height: 14,
            background: ACCENT, flexShrink: 0, alignSelf: 'center',
            animation: 'bgCursorBlink 1s step-end infinite',
          }} />
        </div>
      </div>
    </>
  )
}
