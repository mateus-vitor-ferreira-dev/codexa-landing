'use client'

import { useEffect, useRef } from 'react'
import { isFinePointer, prefersReducedMotion, rafLoop } from '@/lib/fx/motion'

/* Cursor customizado (só mouse/trackpad):
   - ponto que segue o mouse sem atraso;
   - anel com inércia que ESTICA na direção do movimento (velocidade);
   - muda de forma pelo contexto do que está sob o cursor:
       [data-cursor="texto"] → anel cresce, ganha fundo e mostra o rótulo;
       link/botão            → anel cresce com a cor do tema;
       campo de texto        → anel encolhe (o I-beam do campo fica visível);
   - rastro sutil de partículas.
   Contexto por delegação (pointerover), então funciona com elementos que
   aparecem depois do mount. Com reduced-motion: sem esticar e sem rastro. */

const TRAIL = 7
const INTERACTIVE = 'a, button, [role="button"], summary, label[for], select'
const TEXT_FIELD  = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]'

type Mode = 'idle' | 'link' | 'label' | 'text'

export function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current, ring = ringRef.current
    const label = labelRef.current, trailBox = trailRef.current
    if (!dot || !ring || !label || !trailBox) return

    // Só com mouse: no toque (ou sem ponteiro) o cursor do sistema fica como está
    if (!isFinePointer()) return
    const reduced = prefersReducedMotion()

    // Esconde o cursor do sistema (globals.css) só enquanto este componente existe
    const html = document.documentElement
    html.classList.add('has-custom-cursor')

    const trail = Array.from(trailBox.children) as HTMLElement[]
    const tp = trail.map(() => ({ x: -100, y: -100 }))

    let mx = -100, my = -100            // mouse
    let rx = -100, ry = -100            // anel (com inércia)
    let visible = false, pressed = false
    let mode: Mode = 'idle'
    let target: Element | null = null  // elemento com data-cursor sob o mouse
    let scale = 1, stretch = 1, angle = 0

    const setMode = (m: Mode, text = '') => {
      if (text !== label.textContent) label.textContent = text
      if (m === mode) return
      mode = m
      ring.dataset.mode = m
      label.style.opacity = m === 'label' ? '1' : '0'
      dot.style.opacity   = m === 'idle' ? '1' : '0'
    }

    const resolve = (el: Element | null) => {
      const withLabel = el?.closest('[data-cursor]') ?? null
      target = withLabel
      if (withLabel) return setMode('label', withLabel.getAttribute('data-cursor') ?? '')
      if (el?.closest(TEXT_FIELD)) return setMode('text')
      if (el?.closest(INTERACTIVE)) return setMode('link')
      setMode('idle')
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mx = e.clientX; my = e.clientY
      if (!visible) {
        visible = true
        rx = mx; ry = my
        tp.forEach(p => { p.x = mx; p.y = my })
        html.dataset.cursorVisible = '1'
        trailBox.style.opacity = '1'
        dot.style.visibility = ring.style.visibility = 'visible'
      }
    }
    const onOver  = (e: PointerEvent) => resolve(e.target as Element)
    const onDown  = () => { pressed = true }
    const onUp    = () => { pressed = false }
    const onLeave = () => {
      visible = false
      dot.style.visibility = ring.style.visibility = 'hidden'
      trailBox.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup',   onUp,   { passive: true })
    html.addEventListener('pointerleave', onLeave)

    const stop = rafLoop((_t, dt) => {
      if (!visible) return
      // O rótulo pode mudar com o mouse parado (ex.: FAQ "virar" → "voltar")
      if (target && mode === 'label') {
        const t = target.getAttribute('data-cursor') ?? ''
        if (t !== label.textContent) label.textContent = t
      }

      const k = reduced ? 1 : 1 - Math.pow(0.0008, dt)   // inércia independente do fps
      const px = rx, py = ry
      rx += (mx - rx) * k
      ry += (my - ry) * k

      const want = mode === 'label' ? 2.6 : mode === 'link' ? 1.6 : mode === 'text' ? 0.5 : 1
      scale += ((pressed ? want * 0.82 : want) - scale) * Math.min(1, dt * 14)

      // Esticar: proporcional à velocidade do anel, alinhado à direção
      if (!reduced) {
        const vx = (rx - px) / Math.max(dt, 1e-3), vy = (ry - py) / Math.max(dt, 1e-3)
        const speed = Math.hypot(vx, vy)
        const want  = mode === 'label' ? 1 : 1 + Math.min(speed / 2600, 0.55)
        stretch += (want - stretch) * Math.min(1, dt * 12)
        if (speed > 40) angle = Math.atan2(vy, vx) * 180 / Math.PI
      }

      dot.style.transform   = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      ring.style.transform  = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) rotate(${angle.toFixed(1)}deg) scale(${(scale * stretch).toFixed(3)}, ${(scale / stretch).toFixed(3)})`
      label.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`

      if (!reduced) {
        // Cada partícula persegue a anterior: rastro que encurta ao parar
        let lx = mx, ly = my
        for (let i = 0; i < trail.length; i++) {
          const p = tp[i]
          p.x += (lx - p.x) * 0.42
          p.y += (ly - p.y) * 0.42
          trail[i].style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`
          lx = p.x; ly = p.y
        }
      }
    })

    return () => {
      stop()
      html.classList.remove('has-custom-cursor')
      delete html.dataset.cursorVisible
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup',   onUp)
      html.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="fx-cursor">
      <div ref={trailRef} style={{ opacity: 0, transition: 'opacity .3s' }}>
        {Array.from({ length: TRAIL }, (_, i) => (
          <span
            key={i}
            className="fx-cursor-trail"
            style={{
              width: 5 - i * 0.5, height: 5 - i * 0.5,
              opacity: 0.45 - i * 0.055,
            }}
          />
        ))}
      </div>
      <div ref={ringRef} className="fx-cursor-ring" data-mode="idle" />
      <div ref={labelRef} className="fx-cursor-label" />
      <div ref={dotRef} className="fx-cursor-dot" />
      <style>{`
        .fx-cursor > *, .fx-cursor-trail {
          position: fixed; top: 0; left: 0; pointer-events: none;
        }
        .fx-cursor-dot, .fx-cursor-ring { visibility: hidden; }
        .fx-cursor-dot {
          width: 8px; height: 8px; border-radius: 50%; z-index: 10001;
          background: var(--accent); transition: opacity .2s;
        }
        .fx-cursor-ring {
          width: 34px; height: 34px; border-radius: 50%; z-index: 10000;
          border: 1px solid rgba(var(--accent-rgb), .5);
          transition: background-color .25s, border-color .25s, box-shadow .25s;
        }
        .fx-cursor-ring[data-mode="link"] {
          border-color: var(--accent);
          background: rgba(var(--accent-rgb), .06);
        }
        .fx-cursor-ring[data-mode="label"] {
          border-color: rgba(var(--accent-rgb), .9);
          background: rgba(var(--accent-rgb), .9);
          box-shadow: 0 0 24px rgba(var(--accent-rgb), .45);
        }
        .fx-cursor-ring[data-mode="text"] { border-color: rgba(var(--accent-rgb), .35); }
        .fx-cursor-label {
          z-index: 10002; opacity: 0; transition: opacity .2s;
          font-family: var(--font-mono); font-size: 10px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase; white-space: nowrap;
          color: #06060c;
        }
        .fx-cursor-trail {
          border-radius: 50%; z-index: 9999;
          background: var(--accent);
          box-shadow: 0 0 6px rgba(var(--accent-rgb), .8);
        }
      `}</style>
    </div>
  )
}
