'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useReducedMotion } from '@/lib/fx/motion'
import { createNeuralEngine, type NeuralEngine } from './engine'

/* Parte pesada do fundo (three.js + motor). Carregada só no cliente,
   via dynamic import, pelo NeuralBackground. */
export default function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const engine = useRef<NeuralEngine | null>(null)
  const { theme } = useTheme()
  const reduced = useReducedMotion()
  const colorRef = useRef(theme.three)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const e = createNeuralEngine(canvas, { color: colorRef.current, reduced })
    if (!e) { canvas.style.display = 'none'; return }
    engine.current = e
    if (process.env.NODE_ENV !== 'production' || new URLSearchParams(location.search).has('fxstats')) {
      (window as unknown as { __neural?: NeuralEngine }).__neural = e
    }
    return () => { e.dispose(); engine.current = null }
  }, [reduced])

  // cor acompanha o seletor de cores ao vivo
  useEffect(() => {
    colorRef.current = theme.three
    engine.current?.setColor(theme.three)
  }, [theme.three])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="neural-bg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    />
  )
}
