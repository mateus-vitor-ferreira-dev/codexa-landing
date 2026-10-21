'use client'

import { useEffect, useRef, type ElementType, type CSSProperties } from 'react'
import { prefersReducedMotion } from './motion'

const CHARS = '!<>-_\\/[]{}=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

interface Props {
  text: string
  /** tag renderizada (padrão span) */
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** duração da decodificação em ms (padrão 900) */
  duration?: number
  /** atraso antes de começar, em ms */
  delay?: number
  /** embaralha de novo no hover (padrão true) */
  replayOnHover?: boolean
}

/* Texto que "decodifica" ao entrar na tela, no mesmo estilo da intro CODEXA.
   O texto final fica no DOM desde o SSR (SEO e leitor de tela leem certo);
   a parte embaralhada é só visual (aria-hidden). Em fonte proporcional a
   largura oscila um pouco durante a decodificação — use em títulos com
   espaço sobrando ou em fonte mono. Com reduced-motion mostra o texto direto. */
export function ScrambleText({
  text, as: Tag = 'span', className, style, duration = 900, delay = 0, replayOnHover = true,
}: Props) {
  const rootRef  = useRef<HTMLElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current, layer = layerRef.current
    if (!root || !layer || prefersReducedMotion()) return

    let raf = 0, timer = 0
    const run = () => {
      cancelAnimationFrame(raf)
      const start = performance.now()
      root.dataset.scrambling = '1'
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration)
        let out = ''
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]
          const lockAt = (i / text.length) * 0.7
          // Cada letra trava na posição final em sequência, da esquerda para a direita
          out += ch === ' ' || p >= lockAt + 0.3
            ? ch
            : CHARS[(Math.random() * CHARS.length) | 0]
        }
        layer.textContent = p >= 1 ? text : out
        if (p < 1) raf = requestAnimationFrame(tick)
        else delete root.dataset.scrambling
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      timer = window.setTimeout(run, delay)
    }, { threshold: 0.6 })
    io.observe(root)

    const onEnter = () => { if (!root.dataset.scrambling) run() }
    if (replayOnHover) root.addEventListener('pointerenter', onEnter)

    return () => {
      io.disconnect(); clearTimeout(timer); cancelAnimationFrame(raf)
      root.removeEventListener('pointerenter', onEnter)
      layer.textContent = text
    }
  }, [text, duration, delay, replayOnHover])

  return (
    <Tag ref={rootRef} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span ref={layerRef} aria-hidden="true">{text}</span>
    </Tag>
  )
}
