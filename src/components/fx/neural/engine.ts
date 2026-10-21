import * as THREE from 'three'
import { pointer, publishScene, rafLoop, trackPointer } from '@/lib/fx/motion'
import { SCENES, type SceneCtx, type SceneOut, type SceneParams } from './scenes'
import { createSectionTracker } from './sections'
import { POINT_VERT, POINT_FRAG, LINE_VERT, LINE_FRAG } from './shaders'

/* Motor da rede neural do fundo.
   Simulação em CPU (Float32Array fixos, zero alocação por frame) e desenho
   em dois draw calls: pontos (nós + pacotes) e segmentos instanciados.
   Coordenadas sempre em pixels CSS da viewport. */

export interface EngineOptions {
  color: number
  reduced: boolean
}

export interface NeuralEngine {
  setColor(hex: number): void
  dispose(): void
  /** estatística simples para depuração/medição (ms médios do tick) */
  stats(): { nodes: number; lines: number; ms: number; scene: string; regions: string }
}

const MARGIN = 70
const PACKET_TRAIL = 4          // cabeça + 3 rastros
const MAX_SHOCKS = 4
const POINTER_LINES = 22

function smoothstep(x: number) { const k = x < 0 ? 0 : x > 1 ? 1 : x; return k * k * (3 - 2 * k) }

export function createNeuralEngine(canvas: HTMLCanvasElement, opts: EngineOptions): NeuralEngine | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'default' })
  } catch {
    return null // sem WebGL: o fundo simplesmente não aparece
  }

  const reduced = opts.reduced
  const mobile = window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches
  const N = mobile ? 220 : 640
  const PMAX = mobile ? 14 : 36
  const MAXL = N * 3 + POINTER_LINES
  const NPTS = N + PMAX * PACKET_TRAIL
  const dprMax = mobile ? 1 : 1.5

  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.Camera() // os shaders ignoram matrizes

  /* ── estado dos nós ─────────────────────────────────────── */
  const px = new Float32Array(N), py = new Float32Array(N)
  const vx = new Float32Array(N), vy = new Float32Array(N)
  const dx = new Float32Array(N), dy = new Float32Array(N)      // posição exibida (com parallax)
  const na = new Float32Array(N)                                  // alfa do nó (da cena)
  const sb = new Float32Array(N)                                  // brilho da cena
  const glow = new Float32Array(N)                                // brilho transitório (cursor/choque/pacote)
  const depth = new Float32Array(N)
  const r1 = new Float32Array(N), r2 = new Float32Array(N), r3 = new Float32Array(N)
  const hx = new Float32Array(N), hy = new Float32Array(N)
  const deg = new Uint8Array(N)
  const nbr = new Int32Array(N * 4), nbrN = new Uint8Array(N)

  let W = window.innerWidth, H = window.innerHeight
  for (let i = 0; i < N; i++) {
    r1[i] = Math.random(); r2[i] = Math.random(); r3[i] = Math.random()
    depth[i] = Math.pow(Math.random(), 1.6)
    hx[i] = -MARGIN + Math.random() * (W + 2 * MARGIN)
    hy[i] = -MARGIN + Math.random() * (H + 2 * MARGIN)
    px[i] = hx[i]; py[i] = hy[i]
  }

  /* ── geometria dos pontos ───────────────────────────────── */
  const pPos = new Float32Array(NPTS * 3)
  const pSize = new Float32Array(NPTS), pBright = new Float32Array(NPTS), pAlpha = new Float32Array(NPTS)
  const pGeo = new THREE.BufferGeometry()
  const dyn = <T extends THREE.BufferAttribute>(a: T) => { a.setUsage(THREE.DynamicDrawUsage); return a }
  const aPos = dyn(new THREE.BufferAttribute(pPos, 3))
  const aSize = dyn(new THREE.BufferAttribute(pSize, 1))
  const aBright = dyn(new THREE.BufferAttribute(pBright, 1))
  const aAlpha = dyn(new THREE.BufferAttribute(pAlpha, 1))
  pGeo.setAttribute('position', aPos)
  pGeo.setAttribute('aSize', aSize)
  pGeo.setAttribute('aBright', aBright)
  pGeo.setAttribute('aAlpha', aAlpha)

  const color = new THREE.Color(opts.color)
  const common = {
    uRes: { value: new THREE.Vector2(W, H) },
    uQuiet: { value: new THREE.Vector4(0, 0, 0, 0) },
    uQuietStr: { value: 0 },
    uFade: { value: 0 },
    uColor: { value: color },
  }
  const pMat = new THREE.ShaderMaterial({
    vertexShader: POINT_VERT, fragmentShader: POINT_FRAG,
    uniforms: { ...common, uDpr: { value: 1 }, uStretch: { value: 0 } },
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(pGeo, pMat)
  points.frustumCulled = false

  /* ── geometria das linhas (quads instanciados) ──────────── */
  const lGeo = new THREE.InstancedBufferGeometry()
  lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0]), 3))
  lGeo.setIndex([0, 1, 2, 2, 1, 3])
  const lA = new Float32Array(MAXL * 2), lB = new Float32Array(MAXL * 2)
  const lAlpha = new Float32Array(MAXL), lHot = new Float32Array(MAXL), lWidth = new Float32Array(MAXL)
  const iA = dyn(new THREE.InstancedBufferAttribute(lA, 2))
  const iB = dyn(new THREE.InstancedBufferAttribute(lB, 2))
  const iAlpha = dyn(new THREE.InstancedBufferAttribute(lAlpha, 1))
  const iHot = dyn(new THREE.InstancedBufferAttribute(lHot, 1))
  const iWidth = dyn(new THREE.InstancedBufferAttribute(lWidth, 1))
  lGeo.setAttribute('aA', iA); lGeo.setAttribute('aB', iB)
  lGeo.setAttribute('aAlpha', iAlpha); lGeo.setAttribute('aHot', iHot); lGeo.setAttribute('aWidth', iWidth)
  lGeo.instanceCount = 0
  const lMat = new THREE.ShaderMaterial({
    vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
    uniforms: { ...common },
    // o flip de Y do toClip inverte o sentido dos triângulos: sem culling
    side: THREE.DoubleSide,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  const lines = new THREE.Mesh(lGeo, lMat)
  lines.frustumCulled = false
  scene.add(lines)
  scene.add(points)

  /* ── grade espacial (contagem + prefixo, sem objetos) ───── */
  let gCap = 0
  let cellStart = new Int32Array(0), cellFill = new Int32Array(0)
  const sorted = new Int32Array(N), cellOf = new Int32Array(N)
  const ptrIdx = new Int32Array(POINTER_LINES)

  /* ── pacotes de dados ───────────────────────────────────── */
  const pkA = new Int32Array(PMAX), pkB = new Int32Array(PMAX)
  const pkT = new Float32Array(PMAX), pkS = new Float32Array(PMAX)
  for (let k = 0; k < PMAX; k++) { pkA[k] = -1; pkS[k] = 150 + Math.random() * 160 }

  /* ── ondas de choque ────────────────────────────────────── */
  const shX = new Float32Array(MAX_SHOCKS), shY = new Float32Array(MAX_SHOCKS), shT = new Float32Array(MAX_SHOCKS).fill(-1e9)
  let shNext = 0, lastPressSeen = pointer.lastPress

  /* ── seções / cena ──────────────────────────────────────── */
  const tracker = createSectionTracker()
  let orbDocX = 0, orbDocY = 0, orbR = 0, heroH = 1
  const measure = () => {
    tracker.measure()
    const sy = window.scrollY
    const orb = document.querySelector<HTMLElement>('.hero-orb')
    const r = orb?.getBoundingClientRect()
    if (r && r.width > 0) {
      const s = Math.min(r.width, r.height || r.width, 500)
      orbDocX = r.left + r.width * 0.5
      orbDocY = r.top + r.height * 0.5 + sy
      orbR = s * 0.5 * (mobile ? 0.8 : 0.92)
    } else {
      orbDocX = W * 0.74; orbDocY = H * 0.5; orbR = Math.min(W, H) * 0.28
    }
    heroH = Math.max(1, tracker.heroBottom)
  }

  const ctx: SceneCtx = {
    W, H, t: 0, n: N, u: 1, m: MARGIN, mobile, scroll: 0,
    r1, r2, r3, depth, hx, hy, orbX: 0, orbY: 0, orbR: 1, ringW: 1,
  }
  const oA: SceneOut = { x: 0, y: 0, a: 0, b: 0 }
  const oB: SceneOut = { x: 0, y: 0, a: 0, b: 0 }
  const P: SceneParams = { link: 0, lineA: 0, pointA: 0, maxDeg: 0, packets: 0, quiet: 0 }
  const dom = { region: 0, progress: 0 }

  /* ── tamanho ─────────────────────────────────────────────── */
  let dpr = 1
  const resize = () => {
    const nW = window.innerWidth, nH = window.innerHeight
    if (nW !== W || nH !== H) {
      const sx = nW / W, sy = nH / H
      for (let i = 0; i < N; i++) { hx[i] *= sx; hy[i] *= sy; px[i] *= sx; py[i] *= sy }
      W = nW; H = nH
    }
    dpr = Math.min(window.devicePixelRatio || 1, dprMax)
    renderer.setPixelRatio(dpr)
    renderer.setSize(W, H, false)
    common.uRes.value.set(W, H)
    pMat.uniforms.uDpr.value = dpr
    measure()
  }

  /* ── passo de simulação + montagem dos buffers ───────────── */
  let lastScroll = window.scrollY, scrollVel = 0
  let tickMs = 0, lineCount = 0
  let lastDomId = '', lastDomP = -1
  const t0 = performance.now()

  const step = (now: number, dt: number, interactive: boolean) => {
    const T0 = performance.now()
    const t = (now - t0) / 1000
    const sY = window.scrollY
    if (dt > 0) {
      const raw = (sY - lastScroll) / dt
      scrollVel += (raw - scrollVel) * Math.min(1, dt * 10)
    }
    lastScroll = sY

    // cena: coordenada contínua -> duas cenas vizinhas + mistura com easing
    const coord = tracker.coord(sY, H)
    const R = tracker.regions
    const k = Math.max(0, Math.min(R.length - 1, Math.floor(coord)))
    const k2 = Math.min(R.length - 1, k + 1)
    const mix = smoothstep(coord - k)
    const SA = SCENES[R[k].scene] ?? SCENES[0]
    const SB = SCENES[R[k2].scene] ?? SA
    const blend = SA === SB ? 0 : mix
    const pa = SA.params, pb = SB.params
    P.link = pa.link + (pb.link - pa.link) * blend
    P.lineA = pa.lineA + (pb.lineA - pa.lineA) * blend
    P.pointA = pa.pointA + (pb.pointA - pa.pointA) * blend
    P.maxDeg = pa.maxDeg + (pb.maxDeg - pa.maxDeg) * blend
    P.packets = pa.packets + (pb.packets - pa.packets) * blend
    P.quiet = pa.quiet + (pb.quiet - pa.quiet) * blend
    tracker.dominant(sY, H, dom)
    const domId = R[dom.region].id, domP = Math.round(dom.progress * 1000) / 1000
    if (domId !== lastDomId || domP !== lastDomP) {
      lastDomId = domId; lastDomP = domP
      publishScene({ id: domId, progress: domP })
    }

    ctx.W = W; ctx.H = H; ctx.t = t; ctx.scroll = sY
    ctx.u = Math.sqrt((W * H) / N)
    ctx.orbX = orbDocX; ctx.orbY = orbDocY - sY; ctx.orbR = orbR
    ctx.ringW = smoothstep(1 - sY / (heroH * 0.85))

    // texto principal: no hero fica à esquerda; nas outras seções, coluna central
    const heroW = (SA.id === 'hero' ? 1 - blend : 0) + (SB.id === 'hero' ? blend : 0)
    const q = common.uQuiet.value
    if (mobile) q.set(W * 0.04, H * 0.14, W * 0.96, H * 0.86)
    else {
      const cw = Math.min(W * 0.7, 1080)
      const cx0 = (W - cw) / 2, cx1 = (W + cw) / 2
      const hx0 = Math.max(W * 0.04, (W - 1280) / 2), hx1 = hx0 + Math.min(W * 0.5, 700)
      q.set(cx0 + (hx0 - cx0) * heroW, H * 0.16, cx1 + (hx1 - cx1) * heroW, H * 0.86)
    }
    // no celular o texto ocupa a largura toda: apaga menos para a rede continuar visível
    common.uQuietStr.value = mobile ? P.quiet * 0.5 : P.quiet

    // campo de fluxo (curl de um potencial analítico) — move os nós "livres"
    const W2 = W + 2 * MARGIN, H2 = H + 2 * MARGIN
    if (!reduced) {
      const a1 = 0.0042, b1 = 0.0051, c1 = 0.0033, ta = t * 0.11, tb = t * 0.13, tc = t * 0.08
      for (let i = 0; i < N; i++) {
        const x = hx[i], y = hy[i]
        const s1 = Math.sin(x * a1 + ta), cs1 = Math.cos(x * a1 + ta)
        const s2 = Math.sin(y * b1 - tb), cs2 = Math.cos(y * b1 - tb)
        const c3 = Math.cos((x * 0.7 - y) * c1 - tc)
        const dPdx = a1 * cs1 * cs2 + 0.6 * 0.7 * c1 * c3
        const dPdy = -b1 * s1 * s2 - 0.6 * c1 * c3
        const sp = 3600 * (0.6 + depth[i] * 0.6)
        let nx = x + dPdy * sp * dt + (r1[i] - 0.5) * 6 * dt
        let ny = y - dPdx * sp * dt + (r2[i] - 0.5) * 6 * dt
        if (nx < -MARGIN) nx += W2; else if (nx > W + MARGIN) nx -= W2
        if (ny < -MARGIN) ny += H2; else if (ny > H + MARGIN) ny -= H2
        hx[i] = nx; hy[i] = ny
      }
    }

    // ondas de choque novas (clique/toque)
    if (interactive && pointer.lastPress !== lastPressSeen) {
      lastPressSeen = pointer.lastPress
      shX[shNext] = pointer.x; shY[shNext] = pointer.y; shT[shNext] = t
      shNext = (shNext + 1) % MAX_SHOCKS
    }

    const pAct = interactive && pointer.active
    const pX = pointer.x, pY = pointer.y
    const pR = mobile ? 120 : 170
    const pSpeed = Math.min(60, Math.hypot(pointer.vx, pointer.vy))
    const parX = interactive ? pointer.nx * 16 : 0, parY = interactive ? -pointer.ny * 10 : 0
    const lag = Math.max(-90, Math.min(90, scrollVel * 0.03))
    const decay = Math.exp(-3.2 * dt)
    const shapeA = SA.shape, shapeB = SB.shape
    const K = 26, D = 7.5
    let pLines = 0

    for (let i = 0; i < N; i++) {
      shapeA(i, ctx, oA)
      let tx = oA.x, ty = oA.y, ta = oA.a, tb = oA.b
      if (blend > 0.0005) {
        shapeB(i, ctx, oB)
        tx += (oB.x - tx) * blend; ty += (oB.y - ty) * blend
        ta += (oB.a - ta) * blend; tb += (oB.b - tb) * blend
      }
      na[i] = ta; sb[i] = tb

      if (reduced) { px[i] = tx; py[i] = ty; vx[i] = 0; vy[i] = 0 }
      else {
        let ax = (tx - px[i]) * K - vx[i] * D
        let ay = (ty - py[i]) * K - vy[i] * D
        let g = glow[i] * decay

        if (pAct) {
          const ex = px[i] - pX, ey = py[i] - pY
          const d2 = ex * ex + ey * ey
          if (d2 < pR * pR) {
            const d = Math.sqrt(d2) + 0.001
            const f = (1 - d / pR); const f2 = f * f
            // atração até um anel de ~46px (não colapsa em cima do cursor)
            const pull = d > 46 ? -1400 : 900
            ax += (ex / d) * f2 * pull
            ay += (ey / d) * f2 * pull
            // rastro/turbulência: arrasta na direção do ponteiro e gira em volta
            ax += pointer.vx * f2 * 70 + (-ey / d) * f2 * pSpeed * 30
            ay += pointer.vy * f2 * 70 + (ex / d) * f2 * pSpeed * 30
            g = Math.max(g, f * 0.9)
            if (pLines < POINTER_LINES && f > 0.18) {
              const li = MAXL - 1 - pLines++
              lA[li * 2] = pX; lA[li * 2 + 1] = pY
              lAlpha[li] = f * 0.75; lHot[li] = 1; lWidth[li] = 1.4 + f * 1.4
              ptrIdx[pLines - 1] = i // a ponta do nó é preenchida depois do parallax
            }
          }
        }
        for (let s = 0; s < MAX_SHOCKS; s++) {
          const age = t - shT[s]
          if (age < 0 || age > 1.6) continue
          const rad = age * 950, wdt = 120
          const ex = px[i] - shX[s], ey = py[i] - shY[s]
          const d = Math.sqrt(ex * ex + ey * ey) + 0.001
          const dd = Math.abs(d - rad)
          if (dd < wdt) {
            const k3 = (1 - dd / wdt) * (1 - age / 1.6)
            ax += (ex / d) * k3 * 5200
            ay += (ey / d) * k3 * 5200
            g = Math.max(g, k3 * 1.8)
          }
        }
        glow[i] = g
        vx[i] += ax * dt; vy[i] += ay * dt
        px[i] += vx[i] * dt; py[i] += vy[i] * dt
      }

      const z = depth[i]
      dx[i] = px[i] + parX * z
      dy[i] = py[i] + parY * z - lag * z
    }

    // linhas até o cursor: completa a ponta com a posição exibida do nó
    for (let p = 0; p < pLines; p++) {
      const i = ptrIdx[p], li = MAXL - 1 - p
      lB[li * 2] = dx[i]; lB[li * 2 + 1] = dy[i]
    }

    /* ── ligações via grade espacial ───────────────────────── */
    const L = Math.max(18, P.link * ctx.u)
    const L2 = L * L
    const cs = L
    const gx = Math.ceil(W2 / cs) + 2, gy = Math.ceil(H2 / cs) + 2
    const nCells = gx * gy
    if (nCells + 1 > gCap) {
      gCap = Math.ceil((nCells + 1) * 1.5)
      cellStart = new Int32Array(gCap); cellFill = new Int32Array(gCap)
    }
    cellStart.fill(0, 0, nCells + 1)
    for (let i = 0; i < N; i++) {
      let cx = Math.floor((dx[i] + MARGIN) / cs) + 1, cy = Math.floor((dy[i] + MARGIN) / cs) + 1
      cx = cx < 0 ? 0 : cx >= gx ? gx - 1 : cx
      cy = cy < 0 ? 0 : cy >= gy ? gy - 1 : cy
      const c = cy * gx + cx
      cellOf[i] = c
      cellStart[c + 1]++
      deg[i] = 0; nbrN[i] = 0
    }
    for (let c = 0; c < nCells; c++) cellStart[c + 1] += cellStart[c]
    for (let c = 0; c < nCells; c++) cellFill[c] = cellStart[c]
    for (let i = 0; i < N; i++) sorted[cellFill[cellOf[i]]++] = i

    const maxDeg = Math.round(P.maxDeg)
    const lineBase = P.lineA
    const cap = MAXL - POINTER_LINES
    let nl = 0
    for (let cy = 0; cy < gy && nl < cap; cy++) {
      for (let cx = 0; cx < gx && nl < cap; cx++) {
        const c = cy * gx + cx
        const s0 = cellStart[c], s1 = cellStart[c + 1]
        if (s0 === s1) continue
        for (let a = s0; a < s1; a++) {
          const i = sorted[a]
          if (na[i] < 0.02) continue
          for (let o = 0; o < 5; o++) {
            // vizinhos "para frente": mesma célula, direita, e a linha de baixo
            const ox = o === 0 ? 0 : o === 1 ? 1 : o - 3
            const oy = o < 2 ? 0 : 1
            const nx = cx + ox, ny = cy + oy
            if (nx < 0 || nx >= gx || ny >= gy) continue
            const c2 = ny * gx + nx
            const b0 = o === 0 ? a + 1 : cellStart[c2], b1 = cellStart[c2 + 1]
            for (let b = b0; b < b1; b++) {
              if (deg[i] >= maxDeg) break
              const j = sorted[b]
              if (deg[j] >= maxDeg || na[j] < 0.02) continue
              const ex = dx[j] - dx[i], ey = dy[j] - dy[i]
              const d2 = ex * ex + ey * ey
              if (d2 > L2 || d2 < 1) continue
              const fall = 1 - Math.sqrt(d2) / L
              const hot = Math.max(glow[i], glow[j])
              const al = lineBase * 2.4 * fall * Math.sqrt(fall) * Math.min(na[i], na[j]) *
                (0.45 + 0.55 * (depth[i] + depth[j]) * 0.5) * (1 + hot * 1.6) + (sb[i] + sb[j]) * 0.05 * fall
              lA[nl * 2] = dx[i]; lA[nl * 2 + 1] = dy[i]
              lB[nl * 2] = dx[j]; lB[nl * 2 + 1] = dy[j]
              lAlpha[nl] = al; lHot[nl] = hot; lWidth[nl] = 1.9 + hot * 1.8
              nl++
              deg[i]++; deg[j]++
              if (nbrN[i] < 4) nbr[i * 4 + nbrN[i]++] = j
              if (nbrN[j] < 4) nbr[j * 4 + nbrN[j]++] = i
              if (nl >= cap) break
            }
            if (deg[i] >= maxDeg || nl >= cap) break
          }
        }
      }
    }
    // linhas do cursor ficam no fim do buffer; compacta para logo após as normais
    for (let p = 0; p < pLines; p++) {
      const src = MAXL - 1 - p, dst = nl + p
      lA[dst * 2] = lA[src * 2]; lA[dst * 2 + 1] = lA[src * 2 + 1]
      lB[dst * 2] = lB[src * 2]; lB[dst * 2 + 1] = lB[src * 2 + 1]
      lAlpha[dst] = lAlpha[src]; lHot[dst] = lHot[src]; lWidth[dst] = lWidth[src]
    }
    lineCount = nl + pLines
    lGeo.instanceCount = lineCount

    /* ── pontos (nós) ──────────────────────────────────────── */
    const ptA = P.pointA
    const baseSize = mobile ? 4.5 : 5
    for (let i = 0; i < N; i++) {
      const z = depth[i]
      pPos[i * 3] = dx[i]; pPos[i * 3 + 1] = dy[i]; pPos[i * 3 + 2] = z
      pSize[i] = baseSize + z * 6
      pBright[i] = sb[i] + glow[i]
      pAlpha[i] = ptA * na[i] * (0.55 + 0.45 * z)
    }

    /* ── pacotes percorrendo arestas ───────────────────────── */
    const activeP = reduced ? 0 : Math.round(PMAX * P.packets)
    let np = N
    for (let k2i = 0; k2i < PMAX; k2i++) {
      const base = np
      np += PACKET_TRAIL
      if (k2i >= activeP) {
        for (let s = 0; s < PACKET_TRAIL; s++) pAlpha[base + s] = 0
        continue
      }
      let a = pkA[k2i], b = pkB[k2i]
      if (a < 0 || nbrN[a] === 0) {
        // nasce numa aresta qualquer
        a = (Math.random() * N) | 0
        if (nbrN[a] === 0) { for (let s = 0; s < PACKET_TRAIL; s++) pAlpha[base + s] = 0; pkA[k2i] = -1; continue }
        b = nbr[a * 4 + ((Math.random() * nbrN[a]) | 0)]
        pkA[k2i] = a; pkB[k2i] = b; pkT[k2i] = 0
      }
      const ex = dx[b] - dx[a], ey = dy[b] - dy[a]
      const len = Math.sqrt(ex * ex + ey * ey)
      if (len > L * 1.6) { pkA[k2i] = -1; for (let s = 0; s < PACKET_TRAIL; s++) pAlpha[base + s] = 0; continue }
      let tt = pkT[k2i] + (pkS[k2i] * dt) / Math.max(8, len)
      if (tt >= 1) {
        glow[b] = Math.max(glow[b], 0.7) // o nó "dispara" quando o pacote chega
        const n2 = nbrN[b]
        if (n2 > 0) {
          let next = nbr[b * 4 + ((Math.random() * n2) | 0)]
          if (next === a && n2 > 1) next = nbr[b * 4 + ((nbr[b * 4] === a ? 1 : 0))]
          pkA[k2i] = b; pkB[k2i] = next
        } else pkA[k2i] = -1
        tt = 0
      }
      pkT[k2i] = tt
      const fade = Math.min(na[a], na[b])
      for (let s = 0; s < PACKET_TRAIL; s++) {
        const ts = Math.max(0, tt - s * 0.07)
        const o = (base + s) * 3
        pPos[o] = dx[a] + ex * ts; pPos[o + 1] = dy[a] + ey * ts; pPos[o + 2] = 1
        pSize[base + s] = (mobile ? 6 : 7) * (1 - s * 0.18)
        pBright[base + s] = 1.6 - s * 0.35
        pAlpha[base + s] = fade * (1 - s * 0.24) * 0.95
      }
    }
    pGeo.setDrawRange(0, np)

    pMat.uniforms.uStretch.value = reduced ? 0 : Math.min(2.4, Math.abs(scrollVel) / 1600)

    aPos.needsUpdate = true; aSize.needsUpdate = true; aBright.needsUpdate = true; aAlpha.needsUpdate = true
    iA.needsUpdate = true; iB.needsUpdate = true; iAlpha.needsUpdate = true; iHot.needsUpdate = true; iWidth.needsUpdate = true

    tickMs = tickMs * 0.95 + (performance.now() - T0) * 0.05
  }

  /* ── ciclo de vida ───────────────────────────────────────── */
  let stopLoop: (() => void) | null = null
  let stopPointer: (() => void) | null = null
  let ro: ResizeObserver | null = null
  let resizeT: ReturnType<typeof setTimeout> | undefined
  let lost = false

  const renderStatic = () => {
    common.uFade.value = 1
    step(performance.now(), 0, false)
    renderer.render(scene, camera)
  }

  const onResize = () => {
    clearTimeout(resizeT)
    resizeT = setTimeout(() => { resize(); if (reduced) renderStatic() }, 120)
  }
  const onLost = (e: Event) => { e.preventDefault(); lost = true; canvas.style.opacity = '0' }
  const onRestored = () => { lost = false; canvas.style.opacity = ''; resize(); if (reduced) renderStatic() }

  resize()
  window.addEventListener('resize', onResize)
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)
  // o layout muda depois da hidratação (fontes, imagens, pin do ScrollTrigger)
  const measureTimer = setInterval(measure, 2000)
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => measure())
    const main = document.querySelector('main')
    if (main) ro.observe(main)
  }

  if (reduced) {
    // movimento reduzido: um quadro estático da cena hero, sem loop e sem ponteiro
    renderStatic()
  } else {
    stopPointer = trackPointer()
    stopLoop = rafLoop((now, dt) => {
      if (lost) return
      common.uFade.value = Math.min(1, common.uFade.value + dt * 0.9)
      step(now, dt, true)
      renderer.render(scene, camera)
    })
  }

  return {
    setColor(hex) {
      color.setHex(hex)
      if (reduced) renderStatic()
    },
    stats: () => ({ nodes: N, lines: lineCount, ms: tickMs, scene: lastDomId, regions: tracker.regions.map(r => `${r.id}:${Math.round(r.top)}-${Math.round(r.bottom)}`).join(' ') }),
    dispose() {
      stopLoop?.(); stopPointer?.()
      clearInterval(measureTimer); clearTimeout(resizeT)
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      pGeo.dispose(); lGeo.dispose(); pMat.dispose(); lMat.dispose()
      renderer.dispose()
    },
  }
}
