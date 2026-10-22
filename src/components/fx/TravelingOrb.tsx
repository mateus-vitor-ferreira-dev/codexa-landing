'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createOrb, BOX_RATIO, type OrbEngine } from '@/components/ui/Orb'
import { useTheme } from '@/context/ThemeContext'
import { onPreloaderDone } from '@/components/ui/Preloader'
import { pointer, trackPointer, onScene, rafLoop, isFinePointer } from '@/lib/fx/motion'

gsap.registerPlugin(ScrollTrigger)

/* ── Esfera viajante ─────────────────────────────────────────────
   Um único canvas fixo (portal no <body>, z-index 5: acima do fundo,
   abaixo do <main> que tem z 10) — o texto sempre passa POR CIMA da
   esfera, então ela nunca tapa leitura nem rouba clique.
   A rolagem vira uma "linha do tempo" de keyframes medidos a partir das
   <section> reais: cada seção tem uma pose (posição, tamanho, opacidade
   e "humor": expandir, arame, ruído, anel, energia, giro). O scrub é do
   GSAP (quickTo sobre a posição da rolagem) e as transições usam ease
   do GSAP; tudo é amostrado no mesmo rAF que desenha o WebGL. */

// Índices do vetor de pose
const X = 0, Y = 1, D = 2, OP = 3, EXP = 4, WIRE = 5, NOISE = 6, RING = 7, ENERGY = 8, SPIN = 9, DISS = 10
const NF = 11

type Pose = Partial<Record<'x' | 'y' | 'd' | 'op' | 'expand' | 'wire' | 'noise' | 'ring' | 'energy' | 'spin' | 'dissolve', number>>

interface Keyframe { s: number; v: Float32Array; key: string }

const easeMove = gsap.parseEase('power2.inOut')

function poseVec(p: Pose) {
  const v = new Float32Array(NF)
  v[X] = p.x ?? 0; v[Y] = p.y ?? 0; v[D] = p.d ?? 100; v[OP] = p.op ?? 1
  v[EXP] = p.expand ?? 0; v[WIRE] = p.wire ?? 0; v[NOISE] = p.noise ?? 0; v[RING] = p.ring ?? 0
  v[ENERGY] = p.energy ?? 0.5; v[SPIN] = p.spin ?? 0; v[DISS] = p.dissolve ?? 0
  return v
}

/* Identifica a seção: pelo id quando existe; as que não têm id
   (manifesto, marquee, números, garantias, CTA pinado) por conteúdo */
function sectionKey(sec: HTMLElement) {
  if (sec.id) return sec.id
  if (sec.querySelector('#garantias-titulo')) return 'garantias'
  if (sec.querySelector('.cta-buttons')) return 'cta'
  const label = sec.getAttribute('aria-label') ?? ''
  if (/filosofia/i.test(label)) return 'manifesto'
  if (/leva/i.test(label)) return 'promessas'
  return 'numeros'
}

/* Humor de cada seção (expandir, arame, ruído, anel…). A posição e o
   tamanho saem de freeLane: a esfera só ocupa uma faixa lateral em que a
   seção não tem conteúdo, para nunca passar por trás de texto ou card.
   No celular ela some depois do Hero: lá o conteúdo ocupa a largura toda. */
function poseFor(key: string, W: number, H: number, mobile: boolean): Pose {
  if (mobile) return { x: W / 2, y: H * 0.4, d: 120, op: 0 }
  switch (key) {
    case 'manifesto':     return { op: 0.5, noise: 0.45, energy: 0.35, spin: -0.05 }
    case 'promessas':     return { op: 0.7, energy: 0.6 }
    case 'numeros':       return { op: 0.75, energy: 0.7, expand: 0.4 }
    case 'servicos':      return { op: 0.75, expand: 1, energy: 0.75, spin: 0.1 }
    case 'como-funciona': return { op: 0.75, wire: 1, energy: 0.6, spin: 0.2 }
    case 'portfolio':     return { op: 0.8, ring: 1, energy: 0.9, spin: 0.35 }
    case 'depoimentos':   return { op: 0.7, noise: 1, energy: 0.5, spin: -0.1 }
    case 'faq':           return { op: 0.65, energy: 0.45 }
    case 'garantias':     return { op: 0.7, wire: 0.8, energy: 0.6 }
    case 'contato':       return { op: 0.7, energy: 1, spin: 0.25 }
    // CTA final: só um brilho grande e apagado atrás do texto
    case 'cta':           return { x: W / 2, y: H * 0.5, d: Math.min(H * 0.95, W * 0.66), op: 0.12, energy: 0.5, expand: 0.45, noise: 0.3 }
    case 'form-contato':  return { x: W / 2, y: H * 0.5, d: H * 0.3, op: 0 }
    default:              return { op: 0.65 }
  }
}

// Posição no layout, sem transforms (cards que ainda vão entrar de lado contam no lugar final)
function layoutLeft(el: HTMLElement) {
  let x = 0
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) x += e.offsetLeft
  return x
}

// [data-orb-avoid]: blocos de conteúdo feitos de <span>/<div> (faixa de promessas, painel de números…)
const CONTENT = 'h1,h2,h3,h4,h5,p,a,button,img,canvas,li,blockquote,form,input,textarea,[data-glow-card],[data-orb-avoid]'
const LANE_PAD = 28, MIN_D = 72

/* Maior faixa vertical da viewport sem conteúdo da seção. Como a esfera fica
   parada enquanto a seção rola por baixo, vale a seção inteira, não só a tela. */
function freeLane(sec: HTMLElement, W: number) {
  const spans: [number, number][] = []
  for (const el of sec.querySelectorAll<HTMLElement>(CONTENT)) {
    if (!el.offsetWidth || !el.offsetHeight || el.closest('[aria-hidden="true"]')) continue
    const l = layoutLeft(el)
    spans.push([Math.max(0, l - LANE_PAD), Math.min(W, l + el.offsetWidth + LANE_PAD)])
  }
  spans.sort((a, b) => a[0] - b[0])
  let best = { x0: 0, x1: 0 }, end = 0
  for (const [a, b] of [...spans, [W, W] as [number, number]]) {
    if (a - end > best.x1 - best.x0) best = { x0: end, x1: a }
    end = Math.max(end, b)
  }
  return best
}

/* Encaixa a pose na faixa livre; sem faixa larga o bastante, a esfera some */
function fitLane(p: Pose, sec: HTMLElement, W: number, H: number): Pose {
  const { x0, x1 } = freeLane(sec, W)
  const d = Math.min(x1 - x0, H * 0.3)
  if (d < MIN_D) return { ...p, x: x0 < W / 2 ? 0 : W, y: H * 0.5, d: MIN_D, op: 0 }
  return { ...p, x: (x0 + x1) / 2, y: H * 0.55, d }
}

interface Props {
  /** espaço reservado no Hero: a esfera nasce ali */
  slotRef: RefObject<HTMLDivElement | null>
  /** true quando o primeiro frame foi desenhado; false se não houver WebGL */
  onStatus: (ok: boolean) => void
}

export default function TravelingOrb({ slotRef, onStatus }: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<OrbEngine | null>(null)
  const statusRef = useRef(onStatus)
  const { theme } = useTheme()

  useEffect(() => { statusRef.current = onStatus }, [onStatus])

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current
    if (!wrap || !canvas) return

    const mobile = window.innerWidth < 768
    let engine: OrbEngine
    try {
      engine = createOrb(canvas, { points: mobile ? 110 : 190, lite: mobile })
    } catch {
      statusRef.current(false)
      return
    }
    engineRef.current = engine
    engine.setColor(theme.three)
    const st = engine.state
    const maxDPR = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
    const fine = isFinePointer()
    const untrack = trackPointer()

    // ── Linha do tempo de rolagem ─────────────────────────────────
    let kfs: Keyframe[] = []
    let boxBase = 300
    let W = window.innerWidth, H = window.innerHeight
    const cur = new Float32Array(NF)
    let curKey = 'hero'
    // estado da interação / loop (declarado antes do rebuild e do onScene, que já usam)
    let hover = 0, flash = 0
    let ex = 0, exV = 0
    let offX = 0, offY = 0
    let rotX = 0, tiltY = 0, autoY = 0.4, spin = 0.15
    let posX = 0, posY = 0, radius = 0, visibleOp = 0
    let bursts = 0
    let lastPR = -1, lastT = '', lastO = -1, ready = false

    const rebuild = () => {
      W = window.innerWidth; H = window.innerHeight
      const isMobile = W < 768
      const slot = slotRef.current
      const main = document.getElementById('conteudo')
      if (!slot || !main) return
      const sy = window.scrollY
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - H)

      const list: Keyframe[] = []
      const push = (s: number, p: Pose, key: string) => {
        // garante ordem crescente (seções curtas podem sobrepor faixas)
        const prev = list[list.length - 1]
        const ss = prev ? Math.max(s, prev.s + 1) : s
        list.push({ s: ss, v: poseVec(p), key })
      }

      // Hero: nasce no espaço reservado e rola junto com a página por um trecho
      const sr = slot.getBoundingClientRect()
      const slotD = slot.offsetWidth * 0.87
      const slotX = sr.left + sr.width / 2
      const slotY = sr.top + sr.height / 2 + sy
      const heroPose: Pose = { x: slotX, y: slotY, d: slotD, op: 1, energy: 0.6 }
      if (isMobile && slotY > H * 0.75) {
        // Celular: o espaço da esfera fica abaixo da dobra. Ela aparece já na
        // primeira tela, translúcida atrás do título no canto direito, e desce
        // para o seu lugar conforme a página rola
        const s1 = slotY - H * 0.5
        push(0, { x: W * 0.84, y: H * 0.27, d: W * 0.62, op: 0.4, energy: 0.7, noise: 0.3 }, 'hero-in')
        push(s1, { ...heroPose, y: H * 0.5 }, 'hero')
        push(s1 + H * 0.3, { ...heroPose, y: H * 0.2 }, 'hero')
      } else {
        const track = H * 0.22
        push(0, heroPose, 'hero')
        push(track, { ...heroPose, y: slotY - track }, 'hero')
      }

      // Seções de primeiro nível do <main> (as aninhadas não contam)
      const secs = Array.from(main.querySelectorAll<HTMLElement>('section'))
        .filter(s => s.parentElement?.closest('section') === null && s.closest('#hero') === null && !s.contains(slot))
      for (const sec of secs) {
        const key = sectionKey(sec)
        // seção pinada: mede o pin-spacer, que inclui o trecho preso
        const box = sec.parentElement?.classList.contains('pin-spacer') ? sec.parentElement : sec
        const r = box.getBoundingClientRect()
        const top = r.top + sy, h = r.height
        const T = Math.min(H * 0.3, h * 0.28)
        const a = top - H * 0.5 + T, b = top + h - H * 0.5 - T
        const base = poseFor(key, W, H, isMobile)
        const pose = base.x === undefined ? fitLane(base, sec, W, H) : base

        if (b > a) { push(a, pose, key); push(b, pose, key) }
        else push((a + b) / 2, pose, key)
      }

      // Rodapé: a esfera se dissolve em partículas
      const footer = document.querySelector('footer')
      if (footer) {
        const ft = footer.getBoundingClientRect().top + sy
        const end = Math.min(ft - H * 0.4, maxScroll - 4)
        const last = list[list.length - 1]
        const from = last ? last.v : poseVec(heroPose)
        const fade: Pose = {
          x: from[X], y: from[Y] - H * 0.08, d: from[D] * 1.15, op: 0,
          dissolve: 1, energy: 0.2, ring: from[RING],
        }
        push(Math.min(ft - H * 0.95, end - 120), {
          x: from[X], y: from[Y], d: from[D], op: from[OP], expand: from[EXP], wire: from[WIRE],
          noise: from[NOISE], ring: from[RING], energy: from[ENERGY], spin: from[SPIN],
        }, 'footer')
        push(end, fade, 'footer')
      }

      kfs = list
      // canvas no maior tamanho usado; nas outras poses só escala para baixo
      let maxD = 0
      for (const k of kfs) maxD = Math.max(maxD, k.v[D])
      boxBase = Math.ceil(Math.min(maxD, Math.max(W, H)) * BOX_RATIO)
      wrap.style.width = wrap.style.height = `${boxBase}px`
      canvas.style.width = canvas.style.height = `${boxBase}px`
      lastPR = -1
    }

    // Amostra a pose na posição de rolagem s (sem alocar)
    const sample = (s: number) => {
      const n = kfs.length
      if (!n) return
      if (s <= kfs[0].s) { cur.set(kfs[0].v); curKey = kfs[0].key; return }
      if (s >= kfs[n - 1].s) { cur.set(kfs[n - 1].v); curKey = kfs[n - 1].key; return }
      for (let i = 0; i < n - 1; i++) {
        const a = kfs[i], b = kfs[i + 1]
        if (s >= a.s && s < b.s) {
          const raw = (s - a.s) / (b.s - a.s)
          // o trecho em que a esfera acompanha o Hero é linear (cola na página)
          const t = a.key === 'hero' && b.key === 'hero' ? raw : easeMove(raw)
          for (let k = 0; k < NF; k++) cur[k] = a.v[k] + (b.v[k] - a.v[k]) * t
          curKey = raw < 0.5 ? a.key : b.key
          return
        }
      }
    }

    // Scrub do GSAP: a posição usada pela esfera persegue a rolagem real
    const scroll = { s: window.scrollY }
    const scrollTo = gsap.quickTo(scroll, 's', { duration: 0.85, ease: 'power3.out' })
    let velTarget = 0
    const trigger = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => { scrollTo(self.scroll()); velTarget = self.getVelocity() },
    })
    ScrollTrigger.addEventListener('refresh', rebuild)
    rebuild()

    // Conteúdo que muda de altura (FAQ abrindo, fontes) desloca as seções
    let roTimer = 0
    const ro = new ResizeObserver(() => { clearTimeout(roTimer); roTimer = window.setTimeout(rebuild, 180) })
    const main = document.getElementById('conteudo')
    if (main) ro.observe(main)

    // ── Entrada: os nós chegam de fora e se montam depois do preloader
    const intro = { a: 0, ex: 1.6 }
    let introTween: gsap.core.Tween | null = null
    const offIntro = onPreloaderDone(() => {
      introTween = gsap.to(intro, { a: 1, ex: 0, duration: 1.9, ease: 'expo.out', delay: 0.25 })
    })

    // ── Pulso ao entrar numa seção (do fundo publicado ou do próprio cálculo)
    let lastPulseKey = 'hero', lastPulseAt = 0
    const sectionPulse = (key: string) => {
      if (key === lastPulseKey) return
      lastPulseKey = key
      const now = performance.now()
      if (now - lastPulseAt < 500) return
      lastPulseAt = now
      const a = Math.random() * Math.PI * 2
      engine.wave(Math.cos(a), Math.sin(a), 0.5, 0.9)
      flash = Math.max(flash, 0.55)
    }
    const offScene = onScene(s => sectionPulse(s.id === 'form-contato' ? 'form-contato' : s.id))

    // ── Interação: clique/toque sobre a esfera (ela é pointer-events:none,
    // então o acerto é pelo raio projetado na tela)
    const onDown = (e: PointerEvent) => {
      if (visibleOp < 0.05) return
      const dx = e.clientX - posX, dy = e.clientY - posY
      if (dx * dx + dy * dy > radius * radius * 1.1) return
      // explosão: impulso numa mola amortecida; os nós voltam e quicam
      exV += 4.2
      flash = 1
      engine.wave(dx, -dy, radius * 0.7, 1.2)
      wrap.dataset.bursts = String(++bursts)
    }
    window.addEventListener('pointerdown', onDown, { passive: true })

    // ── Loop
    const stopLoop = rafLoop((t, dt) => {
      if (!kfs.length) return
      sample(scroll.s)
      if (curKey !== 'footer') sectionPulse(curKey === 'hero-in' ? 'hero' : curKey)

      const k = 1 - Math.exp(-dt * 6)
      const d = cur[D] * (0.86 + 0.14 * intro.a)
      const op = cur[OP] * intro.a
      radius = d / 2

      // atração leve pelo cursor (só com mouse)
      const cx = cur[X] + offX, cy = cur[Y] + offY
      const dx = pointer.x - cx, dy = pointer.y - cy
      const dist = Math.hypot(dx, dy)
      let tx = 0, ty = 0, hoverT = 0
      if (pointer.active && op > 0.05) {
        if (dist < radius) hoverT = 1
        const reach = radius * 2.6
        if (fine && dist < reach) {
          const f = (1 - dist / reach) * 0.16
          tx = dx * f; ty = dy * f
        }
      }
      offX += (tx - offX) * (1 - Math.exp(-dt * 4))
      offY += (ty - offY) * (1 - Math.exp(-dt * 4))
      hover += (hoverT - hover) * k
      posX = cur[X] + offX; posY = cur[Y] + offY; visibleOp = op

      // giro: base da seção + velocidade da rolagem (com sinal)
      velTarget *= Math.exp(-dt * 3)
      const spinT = 0.15 + cur[SPIN] + Math.max(-3, Math.min(3, velTarget / 1200)) * 0.9
      spin += (spinT - spin) * (1 - Math.exp(-dt * 3))
      autoY += spin * dt
      const tiltXT = pointer.active ? -pointer.ny * 0.4 : 0
      const tiltYT = pointer.active ?  pointer.nx * 0.55 : 0
      rotX  += (tiltXT - rotX) * (1 - Math.exp(-dt * 3))
      tiltY += (tiltYT - tiltY) * (1 - Math.exp(-dt * 3))

      // mola da explosão (pode passar um pouco para dentro: "implode" e volta)
      exV += (-26 * ex - 5.2 * exV) * dt
      ex  += exV * dt
      flash *= Math.exp(-dt * 2.6)

      const ts = t / 1000
      st.expand = cur[EXP]; st.wire = cur[WIRE]; st.noise = cur[NOISE]; st.ring = cur[RING]
      st.energy = cur[ENERGY] + hover * 0.4; st.dissolve = cur[DISS]
      st.hover = hover; st.flash = flash
      st.explode = Math.max(-0.12, ex) + intro.ex
      st.rotX = rotX + Math.sin(ts * 0.31) * 0.08
      st.rotY = autoY + tiltY
      st.rotZ = Math.sin(ts * 0.23) * 0.06

      // posiciona o canvas (só escreve no DOM quando muda)
      const scale = (d * BOX_RATIO) / boxBase
      st.sizeBoost = Math.min(2.2, Math.max(1, Math.pow(0.55 / Math.max(scale, 0.05), 0.45)))
      const tf = `translate3d(${(posX - boxBase / 2).toFixed(1)}px,${(posY - boxBase / 2).toFixed(1)}px,0) scale(${scale.toFixed(4)})`
      if (tf !== lastT) { wrap.style.transform = tf; lastT = tf }
      const o = Math.round(op * 100) / 100
      if (o !== lastO) { wrap.style.opacity = String(o); wrap.style.visibility = o < 0.01 ? 'hidden' : 'visible'; lastO = o }

      // fora da tela ou invisível: não desenha
      if (o < 0.01 || posY + radius * 1.6 < 0 || posY - radius * 1.6 > H || posX + radius * 1.6 < 0 || posX - radius * 1.6 > W) return

      // densidade de pixels proporcional ao tamanho na tela (buffer pequeno quando a esfera é pequena)
      const target = Math.min(maxDPR, Math.max(0.25, (maxDPR * scale * 1.1)), 1500 / boxBase)
      if (lastPR < 0 || Math.abs(target - lastPR) / lastPR > 0.18) {
        lastPR = target
        engine.setSize(boxBase, target)
      }
      engine.render(ts, dt)
      if (!ready) { ready = true; statusRef.current(true) }
    })

    return () => {
      stopLoop()
      untrack()
      offIntro(); offScene()
      introTween?.kill()
      trigger.kill()
      ScrollTrigger.removeEventListener('refresh', rebuild)
      ro.disconnect(); clearTimeout(roTimer)
      window.removeEventListener('pointerdown', onDown)
      engine.dispose()
      engineRef.current = null
    }
    // A cor do tema entra pelo efeito abaixo; aqui monta uma vez só
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotRef])

  useEffect(() => { engineRef.current?.setColor(theme.three) }, [theme.three])

  return createPortal(
    <div
      ref={wrapRef}
      aria-hidden="true"
      data-traveling-orb=""
      style={{
        position: 'fixed', left: 0, top: 0, zIndex: 5,
        pointerEvents: 'none', opacity: 0, visibility: 'hidden',
        transformOrigin: '50% 50%', willChange: 'transform, opacity',
        contain: 'strict',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>,
    document.body,
  )
}
