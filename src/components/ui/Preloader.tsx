'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LETTERS    = ['C', 'O', 'D', 'E', 'X', 'A']
const HACK_CHARS = '!<>-_\\/[]{}=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const SEEN_KEY   = 'codexa:preloader-seen'
const OVERLAY_ID = 'codexa-preloader'

/* Contrato com o resto da página: quem precisa esperar o preloader
   (ex.: animação de entrada do Hero) usa onPreloaderDone. O evento
   'lenis-start' continua sendo disparado para SmoothScroll e ColorSwitcher. */
let done = false
const listeners = new Set<() => void>()

export function onPreloaderDone(cb: () => void) {
  if (done) { cb(); return () => {} }
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

function markDone() {
  done = true
  listeners.forEach(cb => cb())
  listeners.clear()
  window.dispatchEvent(new Event('lenis-start'))
}

// Pula se já viu nesta sessão ou se pediu menos movimento
function shouldSkip() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  try { return sessionStorage.getItem(SEEN_KEY) === '1' } catch { return false }
}

/* Roda antes da hidratação: esconde o overlay já no primeiro paint
   para quem vai pular, evitando o "flash" da tela de carregamento */
const SKIP_SCRIPT = `try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('${SEEN_KEY}')==='1'){var e=document.getElementById('${OVERLAY_ID}');if(e)e.style.display='none'}}catch(_){}`

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const overlayRef    = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  // Decisão tomada uma vez por montagem (o StrictMode roda o efeito duas vezes)
  const skipRef       = useRef<boolean | null>(null)

  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    if (skipRef.current === null) skipRef.current = shouldSkip()

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      document.body.style.overflow = ''
      overlay.style.display = 'none'
      markDone()
      onCompleteRef.current?.()
    }

    // Pulado: some na hora. Adia um tick para que os listeners de
    // 'lenis-start' (SmoothScroll, ColorSwitcher) já estejam registrados
    if (skipRef.current) {
      overlay.style.display = 'none'
      const t = setTimeout(finish, 0)
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    }

    // Primeira visita da sessão: marca como visto já no início
    done = false
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch {}
    document.body.style.overflow = 'hidden'

    // Scramble curto nas letras (~350 ms), em paralelo com a subida
    const els = overlay.querySelectorAll<HTMLElement>('.pre-letter-char')
    const TARGET = 'CODEXA'
    const FRAMES = 12
    let frame = 0
    const scrambleId = setInterval(() => {
      TARGET.split('').forEach((char, i) => {
        const el = els[i]
        if (!el) return
        const lockAt = Math.floor((i / TARGET.length) * FRAMES * 0.65)
        el.textContent = frame >= lockAt
          ? char
          : HACK_CHARS[Math.floor(Math.random() * HACK_CHARS.length)]
      })
      if (frame >= FRAMES) clearInterval(scrambleId)
      frame++
    }, 30)

    // Duração total ≈ 0,9 s. O context permite reverter tudo no cleanup
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish })

      // ── 1. Letras sobem com stagger + tagline ────────────────
      tl.from(overlay.querySelectorAll('.pre-letter'), {
        y: '115%',
        duration: 0.35,
        stagger: 0.03,
        ease: 'power3.out',
      })
      tl.from(overlay.querySelector('.pre-tag'), {
        opacity: 0, y: 6, duration: 0.25, ease: 'power2.out',
      }, 0.15)

      // ── 2. Saída: clip-path sobe (cortina para cima) ─────────
      tl.to(overlay, {
        clipPath: 'inset(100% 0 0% 0)',
        duration: 0.4,
        ease: 'power3.inOut',
      }, '+=0.05')
    }, overlay)

    return () => {
      ctx.revert()
      clearInterval(scrambleId)
      // Nunca deixa a página travada, mesmo se desmontar no meio
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      id={OVERLAY_ID}
      aria-hidden="true"
      suppressHydrationWarning
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex:     9998,
        background: '#080810',
        clipPath:   'inset(0 0 0% 0)',
      }}
    >
      {/* Noise idêntico ao do body */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px 200px',
        }}
      />

      {/* Glow de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 60%, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)',
        }}
      />

      {/* Conteúdo central */}
      <div className="relative flex flex-col items-center" style={{ gap: '2.5rem' }}>

        {/* CODEXA_ — cada letra em overflow:hidden para o slide-up */}
        <div className="flex items-baseline">
          {LETTERS.map((letter, i) => (
            <div key={i} style={{ overflow: 'hidden', lineHeight: 1.1 }}>
              <span
                className="pre-letter pre-letter-char block"
                style={{
                  fontFamily:    'var(--font-display)',
                  // O teto em vw garante que CODEXA_ caiba em celulares pequenos (320px)
                  fontSize:      'min(clamp(3.5rem, 9vw, 6.5rem), 10.5vw)',
                  fontWeight:    800,
                  color:         '#fff',
                  letterSpacing: '0.1em',
                }}
              >
                {letter}
              </span>
            </div>
          ))}

          {/* Cursor _ com pulse */}
          <div style={{ overflow: 'hidden', lineHeight: 1.1, marginLeft: '0.1em' }}>
            <span
              className="pre-letter block animate-pulse"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   'min(clamp(2.5rem, 7vw, 5rem), 7.5vw)',
                fontWeight: 700,
                color:      'var(--accent)',
              }}
            >
              _
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          className="pre-tag"
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.65rem',
            letterSpacing: '0.28em',
            color:         'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}
        >
          soluções digitais sob medida
        </p>

      </div>
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
    </div>
  )
}
