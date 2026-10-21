'use client'

import Image from 'next/image'
import { useEffect, useRef, type RefObject } from 'react'
import { pointer, trackPointer, rafLoop, useReducedMotion } from '@/lib/fx/motion'
import { VERT, FRAG, MAX_RIPPLES } from './distortShader'

/* ── Orçamento de contextos WebGL ─────────────────────────────
   Cada card só cria o próprio contexto quando está perto da tela e o
   destrói (loseContext) ao sair. O teto evita estourar o limite de ~16
   contextos do navegador mesmo em rolagens muito rápidas; quem não
   consegue vaga simplesmente fica com a <img> estática. */
const MAX_LIVE = 4
let liveContexts = 0
/* Quem ficou sem vaga entra na fila e tenta de novo quando uma vaga abre */
const waiting = new Set<() => void>()
const acquire = () => (liveContexts < MAX_LIVE ? (++liveContexts, true) : false)
const release = () => {
  liveContexts = Math.max(0, liveContexts - 1)
  const next = waiting.values().next().value
  if (next) { waiting.delete(next); queueMicrotask(next) }
}

const DPR_MAX = 1.5
const REVEAL_S = 1.6   // duração da transição de entrada
const WIPE_S   = 1.3   // duração do wipe claro ↔ escuro
const BG = [10 / 255, 10 / 255, 14 / 255]   // mesma cor da barra do mockup

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOut   = (x: number) => 1 - Math.pow(1 - x, 3)

interface Props {
  src: string
  alt: string
  /** segunda imagem (ex.: tema escuro) — a troca vira um wipe em shader */
  src2?: string
  alt2?: string
  /** mostra a segunda imagem */
  showAlt?: boolean
  /** cor de destaque do case (#rrggbb) para brilhos da transição */
  accent: string
  sizes: string
  /** elemento que recebe hover/toque (o overlay do card fica por cima do canvas) */
  hostRef: RefObject<HTMLElement | null>
}

/* Print de case renderizado em WebGL por cima da <img> real.
   A <img> continua no DOM (SEO, alt, fallback sem WebGL e reduced-motion);
   o canvas é opaco e só aparece enquanto há efeito acontecendo — em repouso
   ele some com um fade e quem fica visível é a própria <img>, nítida no DPR
   real da tela. Efeitos: entrada por dissolve/mosaico/scanline, distorção
   líquida e lupa seguindo o cursor, separação RGB pela velocidade, ripple no
   toque/clique e wipe líquido entre os dois temas. */
export function DistortImage({ src, alt, src2, alt2, showAlt = false, accent, sizes, hostRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const img1Ref = useRef<HTMLDivElement>(null)
  const img2Ref = useRef<HTMLDivElement>(null)
  const altRef  = useRef(showAlt)
  const glApi   = useRef<{ setAlt: (v: boolean) => void; live: () => boolean } | null>(null)
  const reduced = useReducedMotion()

  /* Troca de tema: com WebGL vivo o shader faz o wipe; sem ele, crossfade CSS */
  useEffect(() => {
    altRef.current = showAlt
    glApi.current?.setAlt(showAlt)
  }, [showAlt])

  /* Fallback sem WebGL: zoom suave da <img> no hover (o shader faz a lupa) */
  useEffect(() => {
    const host = hostRef.current
    if (!host || reduced) return
    const wraps = [img1Ref.current, img2Ref.current].filter(Boolean) as HTMLDivElement[]
    const on  = () => { if (!glApi.current?.live()) wraps.forEach((w) => { w.style.transform = 'scale(1.06)' }) }
    const off = () => wraps.forEach((w) => { w.style.transform = '' })
    host.addEventListener('pointerenter', on)
    host.addEventListener('pointerleave', off)
    return () => { host.removeEventListener('pointerenter', on); host.removeEventListener('pointerleave', off) }
  }, [hostRef, reduced])

  /* Motor WebGL */
  useEffect(() => {
    const root = rootRef.current
    const host = hostRef.current
    if (!root || !host || reduced) return

    const accentRgb = hexToRgb(accent)
    const srcs = src2 ? [src, src2] : [src]
    const untrack = trackPointer()

    // Estado de visibilidade (atualizado pelos IntersectionObservers)
    let ratio = 0
    let near = false

    // Estado da animação (sobrevive à recriação do contexto)
    let hovering = false
    let hover = 0
    const mouse = { x: 0.5, y: 0.5 }
    const prevMouse = { x: 0.5, y: 0.5 }
    const vel = { x: 0, y: 0 }
    const ripples = Array.from({ length: MAX_RIPPLES }, () => ({ x: 0, y: 0, age: 0, w: 0 }))
    let rippleIdx = 0
    const rp = new Float32Array(MAX_RIPPLES * 4)   // buffer dos uniforms, reaproveitado
    let reveal = 1, revealing = false, revealPending = false
    let mixP = altRef.current ? 1 : 0       // progresso linear do wipe
    let mixTarget = mixP

    // Recursos GL (recriados a cada entrada)
    let canvas: HTMLCanvasElement | null = null
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
    let prog: WebGLProgram | null = null
    let U: Record<string, WebGLUniformLocation | null> = {}
    let texSizes: [number, number][] = []
    let ro: ResizeObserver | null = null
    let ready = false
    let gen = 0
    let stopLoop: (() => void) | null = null
    let shown = false
    let W = 1, H = 1
    let time = 0

    const setShown = (v: boolean) => {
      if (!canvas || v === shown) return
      shown = v
      canvas.style.transition = v ? 'none' : 'opacity .35s ease'
      canvas.style.opacity = v ? '1' : '0'
    }

    const cover = (i: number): [number, number, number, number] => {
      const [iw, ih] = texSizes[i] ?? texSizes[0]
      const box = W / H, im = iw / ih
      // object-fit: cover + object-position: top (50% 0%)
      return im > box ? [box / im, 1, (1 - box / im) / 2, 0] : [1, im / box, 0, 0]
    }

    const draw = () => {
      if (!gl || !prog || !ready) return
      const c0 = cover(0), c1 = cover(1)
      gl.uniform4f(U.uCover0, c0[0], c0[1], c0[2], c0[3])
      gl.uniform4f(U.uCover1, c1[0], c1[1], c1[2], c1[3])
      gl.uniform2f(U.uRes, canvas!.width, canvas!.height)
      gl.uniform1f(U.uTime, time)
      gl.uniform2f(U.uMouse, mouse.x, mouse.y)
      gl.uniform1f(U.uHover, hover)
      gl.uniform2f(U.uVel, vel.x, vel.y)
      gl.uniform1f(U.uReveal, reveal >= 1 ? 1 : easeOut(reveal))
      gl.uniform1f(U.uMix, mixP <= 0 ? 0 : mixP >= 1 ? 1 : easeInOut(mixP))
      ripples.forEach((r, i) => { rp[i * 4] = r.x; rp[i * 4 + 1] = r.y; rp[i * 4 + 2] = r.age; rp[i * 4 + 3] = r.w })
      gl.uniform4fv(U.uRipples, rp)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const busy = () =>
      revealing || hovering || hover > 0 || mixP !== mixTarget ||
      ripples.some((r) => r.w > 0) || Math.abs(vel.x) + Math.abs(vel.y) > 1e-4

    const tick = (_t: number, dt: number) => {
      time += dt
      const k = 1 - Math.exp(-dt * 7)

      // Ponteiro → uv do canvas (uma leitura de layout por frame, antes de escrever)
      if (hovering && canvas) {
        const r = canvas.getBoundingClientRect()
        const tx = (pointer.x - r.left) / r.width
        const ty = (pointer.y - r.top) / r.height
        prevMouse.x = mouse.x; prevMouse.y = mouse.y
        mouse.x += (tx - mouse.x) * 0.3
        mouse.y += (ty - mouse.y) * 0.3
        vel.x += ((mouse.x - prevMouse.x) - vel.x) * 0.25
        vel.y += ((mouse.y - prevMouse.y) - vel.y) * 0.25
      } else {
        vel.x *= 0.85; vel.y *= 0.85
      }
      if (Math.abs(vel.x) + Math.abs(vel.y) < 1e-4) { vel.x = 0; vel.y = 0 }

      hover += ((hovering ? 1 : 0) - hover) * k * 0.8
      if (!hovering && hover < 0.003) hover = 0

      for (const r of ripples) {
        if (r.w <= 0) continue
        r.age += dt
        if (r.age > 1.5) r.w = 0
      }

      if (revealing) {
        reveal = Math.min(1, reveal + dt / REVEAL_S)
        if (reveal >= 1) revealing = false
      }

      if (mixP !== mixTarget) {
        const step = dt / WIPE_S
        mixP = mixTarget > mixP ? Math.min(mixTarget, mixP + step) : Math.max(mixTarget, mixP - step)
      }

      draw()
      setShown(true)

      if (!busy()) {
        // Em repouso: a <img> real assume (DPR nativo, sem custo de GPU)
        stopLoop?.(); stopLoop = null
        if (!revealPending) setShown(false)
      }
    }

    const wake = () => {
      if (!ready || stopLoop) return
      stopLoop = rafLoop(tick)
    }

    const startReveal = () => {
      if (!revealPending) return
      revealPending = false
      revealing = true
      reveal = 0
      wake()
    }

    /* ── Criação / destruição do contexto ── */
    const create = () => {
      if (gl) return
      if (!acquire()) { waiting.add(retry); return }
      waiting.delete(retry)
      const myGen = ++gen
      canvas = document.createElement('canvas')
      canvas.setAttribute('aria-hidden', 'true')
      canvas.dataset.distort = ''
      Object.assign(canvas.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%',
        display: 'block', opacity: '0', pointerEvents: 'none',
      })
      shown = false
      const opts: WebGLContextAttributes = {
        alpha: false, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'default',
      }
      gl = (canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null)
        ?? (canvas.getContext('webgl', opts) as WebGLRenderingContext | null)
      if (!gl) { canvas = null; release(); return }
      const g = gl
      const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && g instanceof WebGL2RenderingContext

      const sh = (type: number, code: string) => {
        const s = g.createShader(type)!
        g.shaderSource(s, code); g.compileShader(s)
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn('[DistortImage]', g.getShaderInfoLog(s))
        return s
      }
      prog = g.createProgram()!
      g.attachShader(prog, sh(g.VERTEX_SHADER, VERT))
      g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG))
      g.linkProgram(prog)
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) { destroy(); return }
      g.useProgram(prog)

      // Um triângulo que cobre a tela inteira
      const buf = g.createBuffer()
      g.bindBuffer(g.ARRAY_BUFFER, buf)
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
      const loc = g.getAttribLocation(prog, 'aPos')
      g.enableVertexAttribArray(loc)
      g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0)

      U = {}
      for (const n of ['uTex0', 'uTex1', 'uCover0', 'uCover1', 'uRes', 'uTime', 'uMouse', 'uHover',
        'uVel', 'uReveal', 'uMix', 'uRipples', 'uAccent', 'uBg']) U[n] = g.getUniformLocation(prog, n)
      g.uniform1i(U.uTex0, 0)
      g.uniform1i(U.uTex1, 1)
      g.uniform3f(U.uAccent, accentRgb[0], accentRgb[1], accentRgb[2])
      g.uniform3f(U.uBg, BG[0], BG[1], BG[2])

      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); destroy() }, { once: true })
      root.appendChild(canvas)

      ro = new ResizeObserver(([e]) => {
        if (!canvas || !gl) return
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX)
        W = Math.max(1, e.contentRect.width); H = Math.max(1, e.contentRect.height)
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
        if (ready && !stopLoop) draw()
      })
      ro.observe(root)

      // Texturas: mesmas URLs da <img> (export estático sem otimização → cache do navegador)
      Promise.all(srcs.map((s) => {
        const im = new window.Image()
        im.decoding = 'async'
        im.src = s
        return im.decode().then(() => im)
      })).then((imgs) => {
        if (myGen !== gen || !gl) return
        texSizes = []
        imgs.forEach((im, i) => {
          const t = g.createTexture()
          g.activeTexture(g.TEXTURE0 + i)
          g.bindTexture(g.TEXTURE_2D, t)
          g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false)
          g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, im)
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
          if (isGL2) {
            // print de 1400px exibido a ~600px: mipmap evita serrilhado na redução
            g.generateMipmap(g.TEXTURE_2D)
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR)
          } else {
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
          }
          texSizes.push([im.naturalWidth, im.naturalHeight])
        })
        if (imgs.length === 1) {
          // Sem segunda imagem o wipe nunca liga; a unidade 1 reaproveita a
          // mesma textura só para não ficar um sampler sem textura válida
          g.activeTexture(g.TEXTURE0)
          const t0 = g.getParameter(g.TEXTURE_BINDING_2D) as WebGLTexture | null
          g.activeTexture(g.TEXTURE1)
          g.bindTexture(g.TEXTURE_2D, t0)
        }
        ready = true
        root.dataset.gl = 'live'
        // Já está bem visível? Entra direto, sem transição (evita piscar a <img>)
        if (ratio >= 0.25) {
          reveal = 1; revealPending = false
          draw()
        } else {
          reveal = 0; revealPending = true
          draw(); setShown(true)     // canvas opaco no estado "antes", aguardando a entrada
        }
        if (busy()) wake()
      }).catch(() => { if (myGen === gen) destroy() })
    }

    const destroy = () => {
      gen++
      stopLoop?.(); stopLoop = null
      ro?.disconnect(); ro = null
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext()
        release()
      }
      canvas?.remove()
      canvas = null; gl = null; prog = null; ready = false; shown = false
      revealing = false; revealPending = false; reveal = 1
      delete root.dataset.gl
    }

    // Vaga liberada por outro card: só cria se este ainda estiver perto da tela
    const retry = () => { if (near) create() }

    /* ── Visibilidade ── */
    const ioNear = new IntersectionObserver(([e]) => {
      near = e.isIntersecting
      if (near) create(); else { waiting.delete(retry); destroy() }
    }, { rootMargin: '240px 0px' })
    const ioView = new IntersectionObserver(([e]) => {
      ratio = e.intersectionRatio
      if (ratio >= 0.25) startReveal()
    }, { threshold: [0, 0.25, 0.5] })
    ioNear.observe(root)
    ioView.observe(root)

    /* ── Interação ── */
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      hovering = true
      if (canvas) {
        const r = canvas.getBoundingClientRect()
        mouse.x = prevMouse.x = (e.clientX - r.left) / r.width
        mouse.y = prevMouse.y = (e.clientY - r.top) / r.height
      }
      wake()
    }
    const onLeave = () => { hovering = false; wake() }
    const onDown = (e: PointerEvent) => {
      if (!canvas) return
      const r = canvas.getBoundingClientRect()
      const rp = ripples[rippleIdx++ % MAX_RIPPLES]
      rp.x = (e.clientX - r.left) / r.width
      rp.y = (e.clientY - r.top) / r.height
      rp.age = 0
      rp.w = e.pointerType === 'mouse' ? 0.7 : 1
      wake()
    }
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown, { passive: true })

    glApi.current = {
      setAlt: (v) => { mixTarget = v ? 1 : 0; wake() },
      live: () => ready,
    }

    return () => {
      ioNear.disconnect(); ioView.disconnect()
      waiting.delete(retry)
      near = false
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      destroy()
      untrack()
      glApi.current = null
    }
  }, [src, src2, accent, hostRef, reduced])

  const imgStyle = { objectFit: 'cover' as const, objectPosition: 'top' }
  const wrapStyle = {
    position: 'absolute' as const, inset: 0, transformOrigin: 'center top',
    transition: 'transform .5s cubic-bezier(.22,1,.36,1), opacity .7s ease',
  }

  return (
    <div ref={rootRef} style={{ position: 'absolute', inset: 0 }}>
      <div ref={img1Ref} style={wrapStyle}>
        <Image src={src} alt={alt} fill sizes={sizes} style={imgStyle} />
      </div>
      {src2 && (
        <div ref={img2Ref} style={{ ...wrapStyle, opacity: showAlt ? 1 : 0 }}>
          <Image src={src2} alt={alt2 ?? alt} fill sizes={sizes} style={imgStyle} />
        </div>
      )}
    </div>
  )
}
