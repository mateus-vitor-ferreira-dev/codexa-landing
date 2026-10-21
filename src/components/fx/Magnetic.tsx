'use client'

import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useMagnetic, type MagneticOptions } from '@/lib/fx/useMagnetic'

interface Props extends MagneticOptions {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** 'inline-block' (padrão) ou 'block' para botões de largura total */
  display?: CSSProperties['display']
}

/* Wrapper do ímã: o useMagnetic escreve x/y via GSAP neste span, nunca no
   botão em si — assim o botão pode continuar com o próprio transform
   (translateX(-50%), scale no hover, autoAlpha/y de entrada) sem conflito. */
export function Magnetic({ children, className, style, display = 'inline-block', ...opts }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  useMagnetic(ref, opts)
  return (
    <span ref={ref} className={className} style={{ display, ...style }}>
      {children}
    </span>
  )
}
