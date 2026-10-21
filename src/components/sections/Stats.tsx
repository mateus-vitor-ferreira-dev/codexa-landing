'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROJETOS_NO_AR } from '@/lib/numeros'
import { GlowCard, GlowLayers, Depth } from '@/components/fx/GlowCard'
import { SpotlightGroup } from '@/components/fx/SpotlightGroup'
import { ScrambleText } from '@/lib/fx/ScrambleText'
import { prefersReducedMotion } from '@/lib/fx/motion'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: PROJETOS_NO_AR, suffix: '',  label: 'Projetos no ar',    sub: 'Em produção hoje' },
  { value: 30,             suffix: 'd', label: 'Suporte incluso',   sub: 'Pós-entrega'      },
  { value: 24,             suffix: 'h', label: 'Tempo de resposta', sub: 'Garantido'        },
]

/* O número "re-conta" com glitch — dígitos embaralhados, separação RGB,
   tremida — e solta faíscas na cor do tema. Fora do componente: só roda em
   eventos (Math.random é impuro e não pode morar no corpo do render). */
function glitchRecount(el: HTMLElement, card: HTMLElement, stat: typeof STATS[0], done: () => void) {
  const final = String(stat.value)
  const proxy = { v: 0 }

  gsap.to(proxy, {
    v: stat.value, duration: 1.1, ease: 'power3.out',
    onUpdate() {
      const p = this.progress()
      el.textContent = p < 0.35
        ? final.replace(/[0-9]/g, () => String((Math.random() * 10) | 0)) + stat.suffix
        : Math.round(proxy.v) + stat.suffix
    },
    onComplete() {
      el.textContent = final + stat.suffix
      done()
    },
  })
  gsap.fromTo(el,
    { textShadow: '3px 0 rgba(255,0,90,.75), -3px 0 rgba(0,255,240,.75)' },
    { textShadow: '0px 0 rgba(255,0,90,0), 0px 0 rgba(0,255,240,0)', duration: 0.7, ease: 'power2.out' })
  gsap.fromTo(el, { x: -4, skewX: -8 }, { x: 0, skewX: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' })

  // Faíscas: nascem no centro do número e se espalham (o card tem overflow hidden)
  const cr = card.getBoundingClientRect()
  const nr = el.getBoundingClientRect()
  const ox = nr.left - cr.left + nr.width / 2
  const oy = nr.top  - cr.top  + nr.height / 2
  for (let k = 0; k < 16; k++) {
    const dot  = document.createElement('span')
    const size = 2 + Math.random() * 4
    dot.setAttribute('aria-hidden', 'true')
    Object.assign(dot.style, {
      position: 'absolute', left: `${ox}px`, top: `${oy}px`,
      width: `${size}px`, height: `${size}px`, marginLeft: `${-size / 2}px`, marginTop: `${-size / 2}px`,
      borderRadius: '50%', pointerEvents: 'none', zIndex: '4',
      background: k % 4 === 0 ? '#fff' : 'var(--accent)',
      boxShadow: '0 0 10px rgba(var(--accent-rgb),.9)',
    })
    card.appendChild(dot)
    const a = Math.random() * Math.PI * 2
    const d = 50 + Math.random() * 90
    gsap.fromTo(dot,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      {
        x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7,
        opacity: 0, scale: 0.2,
        duration: 0.7 + Math.random() * 0.5, ease: 'power3.out',
        onComplete: () => dot.remove(),
      })
  }
}

export function Stats() {

  const sectionRef  = useRef<HTMLElement>(null)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const busy        = useRef<boolean[]>([])

  // Hover (ou toque): re-conta com glitch; trava para não empilhar replays
  const replay = (i: number, card: HTMLElement) => {
    const el = counterRefs.current[i]
    if (!el || busy.current[i] || prefersReducedMotion()) return
    busy.current[i] = true
    glitchRecount(el, card, STATS[i], () => { busy.current[i] = false })
  }

  useGSAP(() => {
    const mm = gsap.matchMedia()
    // Com reduced-motion: sem entrada, contadores já no valor final
    mm.add('(prefers-reduced-motion: reduce)', () => {
      counterRefs.current.forEach((el, i) => {
        if (el) el.textContent = STATS[i].value + STATS[i].suffix
      })
    })
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Card entrance — stagger lateral
      gsap.fromTo('.stat-card',
        { opacity: 0, y: 36, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play reverse play reverse',
          },
        }
      )

      gsap.fromTo('.stats-heading',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 84%',
            toggleActions: 'play reverse play reverse',
          },
        }
      )

      // Contadores: o HTML já sai com o valor final (sem JS, ou antes da hidratação,
      // aparece o número certo); immediateRender: false evita zerar antes da rolagem
      counterRefs.current.forEach((el, i) => {
        if (!el) return
        const stat = STATS[i]
        const proxy = { val: 0 }
        gsap.fromTo(proxy,
          { val: 0 },
          {
            val: stat.value,
            duration: 1.8,
            ease: 'power2.out',
            delay: i * 0.1,
            immediateRender: false,
            onUpdate() { el.textContent = Math.round(proxy.val) + stat.suffix },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )
      })
    }, sectionRef.current ?? undefined)
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-36" style={{ background: 'transparent' }}>
      <div className="page-container flex flex-col gap-14">

        {/* Heading */}
        <div className="stats-heading flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
              <ScrambleText text="Em números" />
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'var(--text)' }}>
              Resultados que<br />
              <span style={{ color: 'var(--accent)' }}>ficam no ar.</span>
            </h2>
          </div>
          <p className="max-w-xs leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Cada número abaixo representa um compromisso real com o cliente.
          </p>
        </div>

        {/* Stats grid */}
        <SpotlightGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4" radius={360}>
          {STATS.map((stat, i) => (
            // Tilt no wrapper; a entrada do GSAP (y/scale) fica no .stat-card
            <GlowCard key={i} className="h-full rounded-2xl" tilt={{ max: 12 }}>
            <div
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') replay(i, e.currentTarget) }}
              onPointerDown={(e) => { if (e.pointerType !== 'mouse') replay(i, e.currentTarget) }}
              className="stat-card h-full flex flex-col rounded-2xl relative overflow-hidden justify-center items-center text-center"
              style={{
                background:  'linear-gradient(160deg, #101016 0%, #0b0b10 55%, #08080c 100%)',
                border:      '1px solid rgba(255,255,255,0.08)',
                padding:     'clamp(2.25rem, 3.5vw, 3rem) clamp(1.5rem, 3vw, 2.25rem)',
                gap:         '1.25rem',
              }}
            >
              {/* Accent glow corner */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '110px', height: '110px',
                background: 'radial-gradient(circle at top left, rgba(var(--accent-rgb),0.12), transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Leitor de tela lê o valor final; o número animado é só visual */}
              <span className="sr-only">{stat.value}{stat.suffix}</span>
              <Depth z={70}>
              <span
                ref={el => { counterRefs.current[i] = el }}
                aria-hidden="true"
                style={{
                  display:            'inline-block',
                  fontFamily:         'var(--font-body)',
                  fontSize:           'clamp(2.4rem, 4vw, 3.4rem)',
                  fontWeight:         700,
                  color:              'var(--accent)',
                  lineHeight:         1.05,
                  letterSpacing:      '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum" 1, "lnum" 1',
                }}
              >
                {stat.value}{stat.suffix}
              </span>
              </Depth>

              <div className="flex flex-col gap-1">
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
                  fontWeight: 700,
                  color: '#f0f0f6',
                }}>
                  {stat.label}
                </span>
                <ScrambleText text={stat.sub} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.06em',
                }} />
              </div>

              {/* Bottom accent line */}
              <div style={{
                position: 'absolute', bottom: 0, left: '20%', right: '20%',
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(var(--accent-rgb),0.35), transparent)',
              }} />
              <GlowLayers />
            </div>
            </GlowCard>
          ))}
        </SpotlightGroup>
      </div>
    </section>
  )
}
