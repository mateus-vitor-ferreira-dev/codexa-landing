'use client'

import dynamic from 'next/dynamic'

/* Fundo "rede neural viva": constelação WebGL que muda de forma a cada seção,
   reage ao cursor/toque e é atravessada por pacotes de dados.
   three.js fica fora do bundle inicial — só baixa depois da hidratação. */
const NeuralCanvas = dynamic(() => import('./neural/NeuralCanvas'), { ssr: false })

export function NeuralBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      <NeuralCanvas />
    </div>
  )
}
