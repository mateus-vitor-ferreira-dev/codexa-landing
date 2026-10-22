'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onPreloaderDone } from '@/components/ui/Preloader'
import { ScrambleText } from '@/lib/fx/ScrambleText'
import { useMagnetic } from '@/lib/fx/useMagnetic'

gsap.registerPlugin(ScrollTrigger)

// three.js fica fora do bundle inicial: só baixa quando a esfera vai ser montada
const TravelingOrb = dynamic(() => import('@/components/fx/TravelingOrb'), { ssr: false })

const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/* Esfera 3D viajante em qualquer largura (no celular numa versão leve),
   desde que o visitante não tenha pedido menos movimento */
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(MOTION_OK)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function useShowOrb() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_OK).matches,
    () => false,
  )
}

/* Versão estática da esfera (mesmo tamanho): aparece com reduced-motion, sem
   WebGL e enquanto o three.js carrega, para não deixar buraco no layout */
function OrbFallback() {
  return (
    <div className="hero-orb-fallback relative w-full aspect-square max-w-[500px] mx-auto lg:mx-0" aria-hidden="true">
      {/* Glow */}
      <div
        className="absolute inset-[10%] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.18) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Esfera: anel fino + núcleo em gradiente */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '17%',
          border: '1px solid rgba(var(--accent-rgb),0.22)',
          background:
            'radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb),0.16) 0%, rgba(var(--accent-rgb),0.05) 38%, transparent 70%)',
          boxShadow: 'inset 0 0 60px rgba(var(--accent-rgb),0.12), 0 0 80px rgba(var(--accent-rgb),0.08)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: '30%',
          border: '1px dashed rgba(var(--accent-rgb),0.14)',
        }}
      />
    </div>
  )
}

const WORDS = ['sistemas', 'websites', 'apps', 'automações']

export function Hero() {
  const sectionRef   = useRef<HTMLElement>(null)
  const wordRef      = useRef<HTMLSpanElement>(null)
  const wordIndexRef = useRef(0)
  const slotRef      = useRef<HTMLDivElement>(null)
  const primaryRef   = useRef<HTMLSpanElement>(null)
  const ghostRef     = useRef<HTMLSpanElement>(null)
  const showOrb      = useShowOrb()
  // 'loading' até o primeiro frame WebGL; 'failed' mantém o fallback estático
  const [orbStatus, setOrbStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const onOrbStatus = useCallback((ok: boolean) => setOrbStatus(ok ? 'ready' : 'failed'), [])

  useMagnetic(primaryRef, { strength: 0.3, radius: 36 })
  useMagnetic(ghostRef,   { strength: 0.3, radius: 36 })

  useGSAP(() => {
    // Com reduced-motion nada anima: o conteúdo já aparece no lugar
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      // Entrada começa quando o preloader termina (ou na hora, se ele foi pulado).
      // fromTo com destino explícito: o from() lia a opacidade no meio da transição
      // CSS do .btn-primary e deixava o botão invisível.
      const tl = gsap.timeline({ paused: true })

      tl.fromTo('.hero-tag', { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
      })

      tl.fromTo('.hero-word', { opacity: 0, y: 48 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      }, '-=0.2')

      tl.fromTo('.hero-desc', { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
      }, '-=0.3')

      tl.fromTo('.hero-cta', { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out',
      }, '-=0.25')

      tl.fromTo('.hero-orb', { opacity: 0, scale: 0.88 }, {
        opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out',
      }, '-=0.55')

      tl.fromTo('.hero-scroll', { opacity: 0 }, {
        opacity: 1, duration: 0.45,
      }, '-=0.2')

      return onPreloaderDone(() => { tl.play() })
    }, sectionRef.current ?? undefined)
    return () => mm.revert()
  }, { scope: sectionRef })

  // Rotating word (parado com reduced-motion)
  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return
    const interval = setInterval(() => {
      const el = wordRef.current
      if (!el) return
      gsap.to(el, {
        opacity: 0, y: -14, duration: 0.22, ease: 'power2.in',
        onComplete: () => {
          wordIndexRef.current = (wordIndexRef.current + 1) % WORDS.length
          el.textContent = WORDS[wordIndexRef.current]
          gsap.fromTo(el,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
          )
        },
      })
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  // Pulse no accent dot do tag
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.hero-tag-dot')
    if (!el || !window.matchMedia(MOTION_OK).matches) return
    const tween = gsap.to(el, {
      scale: 1.5, opacity: 0.5, duration: 1.1,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
    return () => { tween.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="gradient-mesh relative min-h-dvh flex flex-col justify-center px-5 md:px-12 xl:px-20 pt-24 pb-16 overflow-hidden"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 75% 60% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      {/* Content grid */}
      <div className="relative z-10 page-container grid grid-cols-1 lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px] gap-12 lg:gap-16 items-center">

        {/* LEFT */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* Tag */}
          <div className="hero-tag inline-flex items-center gap-2 self-start">
            <span
              className="hero-tag-dot w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            {/* Texto em caixa alta direto na fonte mono: a decodificação não muda a largura */}
            <ScrambleText
              text="DESENVOLVIMENTO · IA · AUTOMAÇÃO"
              className="text-xs tracking-[0.18em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}
              duration={1100}
              delay={350}
            />
          </div>

          {/* Headline */}
          <div style={{ fontFamily: 'var(--font-display)' }}>
            {/* Teto de 9.6vw: "transformam" precisa caber inteira em celulares de 320px */}
            <h1 className="font-bold leading-[1.05] tracking-tight" style={{ fontSize: 'min(clamp(2.75rem, 6vw, 4.5rem), 9.6vw)' }}>
              {/* Texto estável para leitor de tela: a palavra rotativa muda a cada 2,6s */}
              <span className="sr-only">Construímos sistemas, websites, apps e automações que transformam seu negócio.</span>

              {/* Parte visual (spans: <div> não é permitido dentro de <h1>) */}
              <span aria-hidden="true" className="block">
                <span className="flex flex-wrap gap-x-3 mb-1">
                  <span className="hero-word-wrap">
                    <span className="hero-word block" style={{ color: 'var(--text)' }}>Construímos</span>
                  </span>
                </span>

                <span className="flex flex-wrap items-baseline gap-x-3 mb-1">
                  <span className="hero-word-wrap" style={{ overflow: 'hidden' }}>
                    <span
                      ref={wordRef}
                      className="hero-word block"
                      style={{ color: 'var(--accent)' }}
                    >
                      {WORDS[0]}
                    </span>
                  </span>
                </span>

                <span className="flex flex-wrap gap-x-3 mb-1">
                  {['que', 'transformam'].map((w) => (
                    <span key={w} className="hero-word-wrap">
                      <span className="hero-word block" style={{ color: 'var(--text)' }}>{w}</span>
                    </span>
                  ))}
                </span>

                <span className="flex flex-wrap gap-x-3">
                  {['seu', 'negócio.'].map((w) => (
                    <span key={w} className="hero-word-wrap">
                      <span
                        className="hero-word block"
                        style={{ color: w === 'negócio.' ? 'var(--text-muted)' : 'var(--text)' }}
                      >
                        {w}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="hero-desc leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', color: 'var(--text-muted)', maxWidth: '440px' }}
          >
            Da ideia ao deploy — desenvolvemos soluções digitais sob medida
            com atendimento próximo, metodologia clara e tecnologia moderna.
          </p>

          {/* CTAs */}
          {/* Ímã num invólucro: o GSAP da entrada anima o <a>, o ímã move o invólucro */}
          <div className="flex flex-wrap items-center gap-5">
            <span ref={primaryRef} className="inline-flex">
            <a
              href="#contato"
              onClick={(e) => { e.preventDefault(); document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="btn-primary hero-cta"
            >
              Iniciar projeto
            </a>
            </span>
            <span ref={ghostRef} className="inline-flex">
            <a
              href="#portfolio"
              onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="btn-ghost hero-cta"
              style={{ minHeight: 44 }} // alvo de toque mínimo sem mudar o visual
            >
              Ver portfólio
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            </span>
          </div>

          {/* Trust line */}
          <p
            className="hero-cta"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-faint)' }}
          >
            Projetos entregues em produção · Código 100% seu · Sem lock-in
          </p>
        </div>

        {/* RIGHT — espaço da esfera. A esfera WebGL não mora aqui: é um canvas
            fixo (TravelingOrb) que nasce sobre este espaço e viaja pela página */}
        <div className="hero-orb flex justify-center lg:justify-end">
          <div ref={slotRef} data-orb-slot="" className="relative w-full aspect-square max-w-[500px] mx-auto lg:mx-0">
            <div
              className="absolute inset-0"
              style={{
                opacity: showOrb && orbStatus === 'ready' ? 0 : 1,
                transition: 'opacity 0.8s ease',
              }}
            >
              <OrbFallback />
            </div>
          </div>
          {showOrb && orbStatus !== 'failed' && <TravelingOrb slotRef={slotRef} onStatus={onOrbStatus} />}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--text-faint)' }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          scroll
        </span>
        <div
          className="w-px h-8 origin-top animate-[grow_1.5s_ease-in-out_infinite]"
          style={{ background: 'linear-gradient(to bottom, var(--text-faint), transparent)' }}
        />
      </div>
    </section>
  )
}
