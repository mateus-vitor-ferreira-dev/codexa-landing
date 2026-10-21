'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { prefersReducedMotion, isFinePointer } from '@/lib/fx/motion'

interface Props {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** raio do holofote nas bordas dos cards, em px (padrão 420) */
  radius?: number
  /** desenha também o halo suave no fundo da grade (padrão true) */
  halo?: boolean
}

/* Holofote de grade: enquanto o mouse passa sobre o grupo, cada
   [data-glow-card] recebe --spot-x/--spot-y (posição do cursor relativa a ele,
   em px) e o grupo liga --spot-on — que os filhos herdam. As <GlowLayers>
   usam isso para acender a borda dos cards vizinhos na direção do cursor.
   Leitura de layout só dentro de um rAF por frame (sem layout thrashing).
   Só com mouse e sem reduced-motion: no toque não existe "hover". */
export function SpotlightGroup({
  children, as: Tag = 'div', className, style, radius = 420, halo = true,
}: Props) {
  const ref  = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion() || !isFinePointer()) return

    let raf = 0, cx = 0, cy = 0, inside = false
    let cards: HTMLElement[] = []

    const update = () => {
      raf = 0
      if (!inside) return
      // Todas as leituras primeiro, depois todas as escritas
      const rr = root.getBoundingClientRect()
      const rects = cards.map(c => c.getBoundingClientRect())
      root.style.setProperty('--spot-gx', `${(cx - rr.left).toFixed(0)}px`)
      root.style.setProperty('--spot-gy', `${(cy - rr.top).toFixed(0)}px`)
      cards.forEach((c, i) => {
        c.style.setProperty('--spot-x', `${(cx - rects[i].left).toFixed(0)}px`)
        c.style.setProperty('--spot-y', `${(cy - rects[i].top).toFixed(0)}px`)
      })
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cx = e.clientX; cy = e.clientY
      schedule()
    }
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      inside = true
      cards = Array.from(root.querySelectorAll<HTMLElement>('[data-glow-card]'))
      root.style.setProperty('--spot-on', '1')
      onMove(e)
    }
    const onLeave = () => {
      inside = false
      root.style.setProperty('--spot-on', '0')
    }
    // Rolando com o mouse parado o conteúdo passa por baixo do cursor
    const onScroll = () => { if (inside) schedule() }

    root.style.setProperty('--spot-r', `${radius}px`)
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointermove',  onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointermove',  onMove)
      root.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      root.style.removeProperty('--spot-on')
    }
  }, [radius])

  return (
    <Tag ref={ref} className={className} style={{ position: 'relative', ...style }}>
      {halo && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', inset: '-80px', pointerEvents: 'none', zIndex: 0,
            // inset negativo: o halo vaza um pouco para fora da grade, sem barra de rolagem
            // (a página usa overflow-x: clip no <main>)
            background: 'radial-gradient(520px circle at calc(var(--spot-gx, -999px) + 80px) calc(var(--spot-gy, -999px) + 80px), rgba(var(--accent-rgb),0.07), transparent 70%)',
            opacity: 'var(--spot-on, 0)' as unknown as number,
            transition: 'opacity .6s ease',
          }}
        />
      )}
      {children}
    </Tag>
  )
}
