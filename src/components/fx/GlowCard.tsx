'use client'

import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { useTilt, type TiltOptions } from '@/lib/fx/useTilt'

/* Card com luz que segue o ponteiro, em três peças que se combinam:

   <GlowCard>   wrapper que inclina (useTilt) e publica --tilt-x/--tilt-y/
                --tilt-active/--tilt-nx/--tilt-ny para tudo que está dentro.
   <GlowLayers> reflexo radial + borda brilhante + borda do holofote da seção
                (SpotlightGroup). Fica dentro do elemento com o fundo e o
                border-radius do card — herda as variáveis do GlowCard.
   <Depth>      camada interna com parallax (ícone/título "flutuando").

   Por que wrapper separado: vários cards já têm GSAP no transform (entrada
   com x/scale/rotateY, lift no hover). O tilt escreve transform direto no
   style, então vai num elemento diferente do animado pelo GSAP e os dois não
   brigam. Com reduced-motion o useTilt não liga e as camadas ficam apagadas. */

const CSS = `
.fx-glow{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:3}
.fx-glow>i{position:absolute;inset:0;border-radius:inherit;display:block}
.fx-glow-reflex{
  background:
    radial-gradient(var(--fx-reflex-size,520px) circle at var(--fx-x) var(--fx-y), rgba(var(--fx-rgb),.16), transparent 45%),
    radial-gradient(180px circle at var(--fx-x) var(--fx-y), rgba(255,255,255,.07), transparent 60%);
  opacity:var(--tilt-active,0);
  transition:opacity .45s ease;
  mix-blend-mode:screen;
}
.fx-glow-ring,.fx-glow-spot{
  padding:var(--fx-ring,1.5px);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask-composite:exclude;
}
.fx-glow-ring{
  background:radial-gradient(240px circle at var(--fx-x) var(--fx-y), rgba(var(--fx-rgb),1), rgba(var(--fx-rgb),.35) 35%, transparent 65%);
  opacity:var(--tilt-active,0);
  transition:opacity .45s ease;
}
.fx-glow-spot{
  background:radial-gradient(var(--spot-r,420px) circle at var(--fx-sx) var(--fx-sy), rgba(var(--fx-rgb),.75), rgba(var(--fx-rgb),.12) 40%, transparent 70%);
  opacity:var(--spot-on,0);
  transition:opacity .5s ease;
}
.fx-glow-fill{
  background:radial-gradient(var(--spot-r,420px) circle at var(--fx-sx) var(--fx-sy), rgba(var(--fx-rgb),.06), transparent 65%);
  opacity:var(--spot-on,0);
  transition:opacity .5s ease;
}
.fx-glow{--fx-x:var(--tilt-x,50%);--fx-y:var(--tilt-y,50%);--fx-sx:var(--spot-x,-999px);--fx-sy:var(--spot-y,-999px)}
.fx-depth{
  transform:translate3d(calc(var(--tilt-nx,0) * var(--fx-z) * .22px), calc(var(--tilt-ny,0) * var(--fx-z) * .22px), 0);
}
@media (prefers-reduced-motion: reduce){ .fx-glow{display:none} .fx-depth{transform:none} }
`

/** Estilos compartilhados — React 19 deduplica e sobe para o <head> */
export function GlowStyles() {
  return <style href="fx-glow" precedence="default">{CSS}</style>
}

/** Converte '#rrggbb' em 'r, g, b'; qualquer outra coisa vira o accent do tema */
export function toRgb(color?: string | null) {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    return `${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}`
  }
  return 'var(--accent-rgb)'
}

interface LayersProps {
  /** cor da luz em '#rrggbb' (padrão: accent do tema) */
  color?: string | null
  /** espessura da borda brilhante (padrão 1.5px) */
  ring?: string
  /** desliga o preenchimento suave do holofote */
  noFill?: boolean
}

export function GlowLayers({ color, ring, noFill }: LayersProps) {
  return (
    <span
      aria-hidden="true"
      className="fx-glow"
      style={{ '--fx-rgb': toRgb(color), ...(ring ? { '--fx-ring': ring } : null) } as CSSProperties}
    >
      <GlowStyles />
      {!noFill && <i className="fx-glow-fill" />}
      <i className="fx-glow-spot" />
      <i className="fx-glow-reflex" />
      <i className="fx-glow-ring" />
    </span>
  )
}

interface CardProps {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** opções do tilt; false = só luz, sem inclinar */
  tilt?: TiltOptions | false
  /** já desenha as camadas de luz aqui (quando o próprio wrapper é o card) */
  layers?: boolean
  color?: string | null
  /** rótulo do cursor customizado sobre o card */
  cursor?: string
}

export function GlowCard({
  children, as: Tag = 'div', className, style, tilt = {}, layers = false, color, cursor,
}: CardProps) {
  const ref = useRef<HTMLElement>(null)
  useTilt(ref, tilt === false ? { rotate: false } : { max: 8, scale: 1.015, ...tilt })

  return (
    <Tag
      ref={ref}
      data-glow-card=""
      data-cursor={cursor}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
      {layers && <GlowLayers color={color} />}
    </Tag>
  )
}

interface DepthProps {
  children: ReactNode
  /** "altura" da camada: quanto maior, mais ela desliza com a inclinação (padrão 30) */
  z?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/** Camada interna com parallax guiado pela inclinação do GlowCard pai */
export function Depth({ children, z = 30, as: Tag = 'div', className, style }: DepthProps) {
  return (
    <Tag
      className={`fx-depth${className ? ` ${className}` : ''}`}
      style={{ '--fx-z': z, ...style } as CSSProperties}
    >
      <GlowStyles />
      {children}
    </Tag>
  )
}
