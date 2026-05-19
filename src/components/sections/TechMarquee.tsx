'use client'

import {
  SiNextdotjs, SiTypescript, SiReact, SiNodedotjs,
  SiPostgresql, SiRedis, SiTailwindcss, SiPrisma,
  SiDocker, SiStripe, SiVercel, SiPython,
  SiMongodb, SiGraphql, SiFigma,
  SiGithub, SiSupabase, SiFirebase,
} from 'react-icons/si'
import { TbBrandReactNative } from 'react-icons/tb'
import type { IconType } from 'react-icons'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Tech {
  name:  string
  icon:  IconType | null
  color: string
}

const ROW_1: Tech[] = [
  { name: 'Next.js',      icon: SiNextdotjs,         color: '#ffffff' },
  { name: 'TypeScript',   icon: SiTypescript,         color: '#3178c6' },
  { name: 'React',        icon: SiReact,              color: '#61dafb' },
  { name: 'Node.js',      icon: SiNodedotjs,          color: '#339933' },
  { name: 'Python',       icon: SiPython,             color: '#ffd43b' },
  { name: 'PostgreSQL',   icon: SiPostgresql,         color: '#4169e1' },
  { name: 'Redis',        icon: SiRedis,              color: '#dc382d' },
  { name: 'Tailwind CSS', icon: SiTailwindcss,        color: '#38bdf8' },
  { name: 'Prisma',       icon: SiPrisma,             color: '#5a67d8' },
  { name: 'MongoDB',      icon: SiMongodb,            color: '#47a248' },
]

const ROW_2: Tech[] = [
  { name: 'React Native', icon: TbBrandReactNative,   color: '#61dafb' },
  { name: 'Docker',       icon: SiDocker,             color: '#2496ed' },
  { name: 'Stripe',       icon: SiStripe,             color: '#635bff' },
  { name: 'Vercel',       icon: SiVercel,             color: '#ffffff' },
  { name: 'Supabase',     icon: SiSupabase,           color: '#3ecf8e' },
  { name: 'Firebase',     icon: SiFirebase,           color: '#ffca28' },
  { name: 'GraphQL',      icon: SiGraphql,            color: '#e535ab' },
  { name: 'Railway',      icon: null,                 color: '#ffffff' },
  { name: 'Figma',        icon: SiFigma,              color: '#f24e1e' },
  { name: 'GitHub',       icon: SiGithub,             color: '#ffffff' },
]

/* ── Tech Chip ─────────────────────────────────────────── */
function TechChip({ tech }: { tech: Tech }) {
  const chipRef = useRef<HTMLDivElement>(null)

  const onEnter = () => {
    gsap.to(chipRef.current, {
      borderColor: tech.color,
      scale: 1.04,
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  const onLeave = () => {
    gsap.to(chipRef.current, {
      borderColor: 'rgba(255,255,255,0.07)',
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  const Icon = tech.icon

  return (
    <div
      ref={chipRef}
      className="flex items-center gap-3 px-5 py-3 rounded-lg select-none cursor-default"
      style={{
        border:     '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
        color:      'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {Icon && (
        <Icon
          size={18}
          style={{ color: tech.color, flexShrink: 0 }}
        />
      )}
      <span
        className="text-sm font-medium"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {tech.name}
      </span>
    </div>
  )
}

/* ── Marquee Row ───────────────────────────────────────── */
function MarqueeRow({ items, reverse = false }: { items: Tech[]; reverse?: boolean }) {
  // Triplicar garante preenchimento em qualquer tela
  const tripled = [...items, ...items, ...items]

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      {/* gap no flex cria espaço só ENTRE itens, causando drift de meia gap no loop.
          Usar marginRight em cada wrapper garante que a largura inclui o espaço,
          tornando translateX(-33.33%) matematicamente exato para 3 cópias. */}
      <div
        className={reverse ? 'marquee-track-reverse' : 'marquee-track'}
        style={{ display: 'flex', width: 'max-content' }}
      >
        {tripled.map((tech, i) => (
          <div key={`${tech.name}-${i}`} style={{ marginRight: '12px', flexShrink: 0 }}>
            <TechChip tech={tech} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Section ───────────────────────────────────────────── */
export function TechMarquee() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.tech-header', {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="py-10 overflow-hidden"
      style={{ background: 'var(--bg-section)' }}
    >
      {/* Header */}
      <div className="tech-header page-container flex items-center gap-4 mb-6">
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
        >
          Stack
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
        >
          Tecnologias que dominamos
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>

      {/* Counter de tecnologias */}
      <div className="tech-header flex justify-center mt-6">
        <span
          className="text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
        >
          {ROW_1.length + ROW_2.length}+ tecnologias no arsenal
        </span>
      </div>
    </section>
  )
}
