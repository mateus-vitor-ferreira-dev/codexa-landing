'use client'

import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion, isFinePointer } from './motion'

export interface TiltOptions {
  /** inclinação máxima em graus (padrão 10) */
  max?: number
  /** escala no hover (padrão 1.02) */
  scale?: number
  /** perspectiva em px (padrão 900) */
  perspective?: number
  /** inclina também pelo giroscópio no celular (padrão true) */
  gyro?: boolean
}

/* Card 3D que inclina seguindo o ponteiro. Além do transform, expõe para o
   CSS as variáveis --tilt-x / --tilt-y (posição do ponteiro em %, para o
   reflexo de luz e a borda brilhante) e --tilt-active (0/1).
   Exemplo de reflexo no card (elemento filho absoluto):
     background: radial-gradient(400px circle at var(--tilt-x) var(--tilt-y),
                 rgba(var(--accent-rgb),.18), transparent 45%);
     opacity: var(--tilt-active);
   No toque inclina durante o arrasto; com reduced-motion não faz nada. */
export function useTilt<T extends HTMLElement>(ref: RefObject<T | null>, opts: TiltOptions = {}) {
  const { max = 10, scale = 1.02, perspective = 900, gyro = true } = opts

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    el.style.setProperty('--tilt-x', '50%')
    el.style.setProperty('--tilt-y', '50%')
    el.style.setProperty('--tilt-active', '0')
    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    let rx = 0, ry = 0, s = 1          // estado atual
    let tx = 0, ty = 0, ts = 1         // alvo
    let raf = 0
    const animate = () => {
      rx += (tx - rx) * 0.12
      ry += (ty - ry) * 0.12
      s  += (ts - s)  * 0.12
      el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(3)})`
      if (Math.abs(tx - rx) + Math.abs(ty - ry) + Math.abs(ts - s) > 0.01) raf = requestAnimationFrame(animate)
      else raf = 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate) }

    const aim = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect()
      const px = (clientX - r.left) / r.width
      const py = (clientY - r.top)  / r.height
      ty = (px - 0.5) * 2 * max
      tx = -(py - 0.5) * 2 * max
      ts = scale
      el.style.setProperty('--tilt-x', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--tilt-y', `${(py * 100).toFixed(1)}%`)
      el.style.setProperty('--tilt-active', '1')
      kick()
    }
    const reset = () => {
      tx = 0; ty = 0; ts = 1
      el.style.setProperty('--tilt-active', '0')
      kick()
    }

    const onMove  = (e: PointerEvent) => aim(e.clientX, e.clientY)
    const onLeave = () => reset()
    el.addEventListener('pointermove',   onMove,  { passive: true })
    el.addEventListener('pointerdown',   onMove,  { passive: true })
    el.addEventListener('pointerleave',  onLeave)
    el.addEventListener('pointercancel', onLeave)
    if (!isFinePointer()) el.addEventListener('pointerup', onLeave)

    // Celular: inclinação do aparelho move o card enquanto ele está na tela.
    // (iOS exige permissão por gesto — lá só o toque funciona.)
    let onOrient: ((e: DeviceOrientationEvent) => void) | null = null
    let io: IntersectionObserver | null = null
    if (gyro && !isFinePointer() && 'DeviceOrientationEvent' in window) {
      let visible = false
      io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (!visible) reset() })
      io.observe(el)
      onOrient = (e) => {
        if (!visible || e.beta == null || e.gamma == null) return
        const gx = Math.max(-1, Math.min(1, e.gamma / 30))
        const gy = Math.max(-1, Math.min(1, (e.beta - 45) / 30))
        ty = gx * max * 0.6
        tx = -gy * max * 0.6
        el.style.setProperty('--tilt-x', `${(50 + gx * 40).toFixed(1)}%`)
        el.style.setProperty('--tilt-y', `${(50 + gy * 40).toFixed(1)}%`)
        el.style.setProperty('--tilt-active', '0.6')
        kick()
      }
      window.addEventListener('deviceorientation', onOrient)
    }

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove',   onMove)
      el.removeEventListener('pointerdown',   onMove)
      el.removeEventListener('pointerleave',  onLeave)
      el.removeEventListener('pointercancel', onLeave)
      el.removeEventListener('pointerup',     onLeave)
      if (onOrient) window.removeEventListener('deviceorientation', onOrient)
      io?.disconnect()
      el.style.transform = ''
      el.style.willChange = ''
    }
  }, [ref, max, scale, perspective, gyro])
}
