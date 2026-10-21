'use client'

import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion, isFinePointer } from './motion'

export interface MagneticOptions {
  /** fração da distância ao centro que o elemento acompanha (padrão 0.35) */
  strength?: number
  /** raio extra em px além da borda onde o ímã já atua (padrão 40) */
  radius?: number
  /** seletor de um filho que se move um pouco mais (texto/ícone), para dar profundidade */
  inner?: string
}

/* Botão magnético: puxa em direção ao cursor quando ele chega perto e volta
   com elástico ao sair. Só com mouse e sem reduced-motion. */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>, opts: MagneticOptions = {}) {
  const { strength = 0.35, radius = 40, inner } = opts

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !isFinePointer()) return

    const innerEl = inner ? el.querySelector<HTMLElement>(inner) : null
    const xTo  = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo  = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const ixTo = innerEl ? gsap.quickTo(innerEl, 'x', { duration: 0.5, ease: 'power3.out' }) : null
    const iyTo = innerEl ? gsap.quickTo(innerEl, 'y', { duration: 0.5, ease: 'power3.out' }) : null
    let engaged = false

    const onMove = (e: PointerEvent) => {
      // Mede sem o deslocamento atual para o ímã não "fugir" de si mesmo
      const r  = el.getBoundingClientRect()
      const ox = Number(gsap.getProperty(el, 'x')) || 0
      const oy = Number(gsap.getProperty(el, 'y')) || 0
      const cx = r.left - ox + r.width / 2
      const cy = r.top  - oy + r.height / 2
      const dx = e.clientX - cx, dy = e.clientY - cy
      const inside = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius
      if (inside) {
        engaged = true
        xTo(dx * strength); yTo(dy * strength)
        ixTo?.(dx * strength * 0.4); iyTo?.(dy * strength * 0.4)
      } else if (engaged) {
        engaged = false
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
        if (innerEl) gsap.to(innerEl, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.set(el, { x: 0, y: 0 })
      if (innerEl) gsap.set(innerEl, { x: 0, y: 0 })
    }
  }, [ref, strength, radius, inner])
}
