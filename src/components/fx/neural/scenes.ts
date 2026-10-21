/* Formas-alvo da rede neural, uma por seção da landing.
   Cada forma é uma função pura (i, ctx, out) que escreve em `out` a posição
   alvo do nó i em pixels CSS da viewport, um alfa (0..1) e um brilho extra.
   Nada aloca: o motor reaproveita o mesmo `ctx` e o mesmo `out` em todo frame. */

export const TAU = Math.PI * 2

export interface SceneCtx {
  W: number; H: number
  /** tempo em segundos */
  t: number
  /** nós ativos */
  n: number
  /** espaçamento médio entre nós (px) = sqrt(área / n) */
  u: number
  /** margem fora da tela onde os nós ainda existem */
  m: number
  mobile: boolean
  /** rolagem em px (contínua) — usada por formas guiadas pela rolagem */
  scroll: number
  r1: Float32Array; r2: Float32Array; r3: Float32Array
  depth: Float32Array
  /** posição do campo de fluxo (curl noise) — estado mantido pelo motor */
  hx: Float32Array; hy: Float32Array
  /** área onde fica a esfera do Hero (halo) */
  orbX: number; orbY: number; orbR: number
  /** 1 no topo do Hero, 0 depois que ele sai da tela */
  ringW: number
}

export interface SceneOut { x: number; y: number; a: number; b: number }

export type ShapeFn = (i: number, c: SceneCtx, o: SceneOut) => void

/** Parâmetros visuais de cada cena (interpolados junto com a forma) */
export interface SceneParams {
  /** distância máxima de ligação, em múltiplos de u */
  link: number
  /** intensidade das linhas */
  lineA: number
  /** intensidade dos nós */
  pointA: number
  /** grau máximo por nó (limita poluição visual) */
  maxDeg: number
  /** fração dos pacotes de dados ativos */
  packets: number
  /** quanto apagar a rede atrás do bloco de texto principal (0..1) */
  quiet: number
}

const TILT = -0.32
const COS_T = Math.cos(TILT), SIN_T = Math.sin(TILT)

/* ── hero: constelação orgânica + halo em volta da esfera ───── */
const hero: ShapeFn = (i, c, o) => {
  const fx = c.hx[i], fy = c.hy[i]
  o.a = 1; o.b = 0
  const r3 = c.r3[i]
  if (r3 < 0.26 && c.ringW > 0.001) {
    const r1 = c.r1[i], r2 = c.r2[i], t = c.t
    let x: number, y: number, b = 0
    if (r3 < 0.13) {
      // halo circular largo, girando devagar e ondulando
      const th  = r1 * TAU + t * 0.045
      const rad = c.orbR * (1.16 + r2 * 0.16 + 0.035 * Math.sin(th * 3 + t * 0.7))
      x = c.orbX + Math.cos(th) * rad
      y = c.orbY + Math.sin(th) * rad
    } else {
      // anel inclinado (tipo Saturno): a metade da frente brilha mais
      const th = r1 * TAU - t * 0.09
      const rx = c.orbR * (1.42 + r2 * 0.1), ry = rx * 0.24
      const ex = Math.cos(th) * rx, ey = Math.sin(th) * ry
      x = c.orbX + ex * COS_T - ey * SIN_T
      y = c.orbY + ex * SIN_T + ey * COS_T
      b = Math.sin(th) > 0 ? 0.35 : 0
    }
    const w = c.ringW
    o.x = fx + (x - fx) * w
    o.y = fy + (y - fy) * w
    o.b = b * w
  } else {
    o.x = fx; o.y = fy
  }
}

/* ── servicos: malha triangular que respira e é varrida por um brilho ── */
const lattice: ShapeFn = (i, c, o) => {
  const { W, H, m, t } = c
  const s = latticeSpacing(c)
  const cols = Math.ceil((W + 2 * m) / s) + 1
  const row = Math.floor(i / cols), col = i % cols
  let x = -m + col * s + (row & 1) * s * 0.5
  let y = -m + row * s * 0.866
  const cx = W * 0.5, cy = H * 0.5
  const dx = x - cx, dy = y - cy
  const rho = Math.sqrt(dx * dx + dy * dy) + 1e-3
  const breathe = s * 0.2 * Math.sin(t * 1.3 - rho * 0.011)
  x += (dx / rho) * breathe
  y += (dy / rho) * breathe
  o.x = x; o.y = y; o.a = 1
  // varredura diagonal, como um scanner passando pela grade
  const sweep = 0.5 + 0.5 * Math.sin(x * 0.006 + y * 0.004 - t * 1.6)
  o.b = Math.pow(sweep, 14) * 0.9
}

export function latticeSpacing(c: SceneCtx) {
  return Math.sqrt(((c.W + 2 * c.m) * (c.H + 2 * c.m)) / (c.n * 0.866))
}

/* ── como-funciona: hélice dupla horizontal (linha do tempo) com estações ── */
const STATIONS = [0.14, 0.38, 0.62, 0.86]
const helix: ShapeFn = (i, c, o) => {
  const { W, H, m, t } = c
  const r1 = c.r1[i], r2 = c.r2[i]
  const cy = H * 0.56
  const A  = Math.min(H * 0.15, 130)
  o.a = 1; o.b = 0
  if (i % 9 === 0) {
    // estações (etapas do processo): nós orbitando cada marco da linha
    const k  = (i / 9) % STATIONS.length | 0
    const th = r1 * TAU + t * (0.6 + r2 * 0.6)
    const rad = 14 + r2 * (c.mobile ? 18 : 30)
    o.x = W * STATIONS[k] + Math.cos(th) * rad
    o.y = cy + Math.sin(th) * rad
    const pulse = 0.5 + 0.5 * Math.sin(t * 2 - k * 1.3)
    o.b = Math.pow(pulse, 6) * 0.8
    return
  }
  const span = W + 2 * m
  const strand = i & 1
  const raw = r1 * span + t * 38 + c.scroll * 0.45
  const x = (raw % span) - m
  const ph = (x / (c.mobile ? W * 0.9 : W * 0.42)) * TAU + t * 0.5
  const s = Math.sin(ph + strand * Math.PI)
  const jitter = (r2 - 0.5) * A * 0.32
  o.x = x
  o.y = cy + A * s + jitter
  // frente da hélice (cos > 0) mais brilhante: sensação de 3D
  o.b = Math.max(0, Math.cos(ph + strand * Math.PI)) * 0.35
  o.a = 0.55 + 0.45 * Math.max(0, Math.cos(ph + strand * Math.PI))
}

/* ── cases: deriva livre e apagada — as imagens dos projetos são o destaque ── */
const drift: ShapeFn = (i, c, o) => {
  o.x = c.hx[i]; o.y = c.hy[i]
  o.a = 0.7; o.b = 0
}

/* ── depoimentos: ondas senoidais sobrepostas (vozes) ─────────── */
const waves: ShapeFn = (i, c, o) => {
  const { W, H, m, t } = c
  const L = c.mobile ? 4 : 5
  const k = i % L
  const per = Math.ceil(c.n / L)
  const j = Math.floor(i / L)
  const x = -m + (j / per) * (W + 2 * m)
  const gap = H * (c.mobile ? 0.13 : 0.1)
  const A = H * 0.07 * (0.65 + 0.35 * Math.sin(t * 0.35 + k * 1.1))
  const ph = x * (TAU / (W * (c.mobile ? 0.9 : 0.55))) + t * (0.7 + k * 0.12) + k * 0.8
  o.x = x
  o.y = H * 0.5 + (k - (L - 1) / 2) * gap + A * Math.sin(ph)
  o.a = 0.85
  o.b = Math.pow(Math.max(0, Math.sin(ph)), 8) * 0.5
}

/* ── faq: nuvem dispersa com nós piscando (dúvidas surgindo) ──── */
const cloud: ShapeFn = (i, c, o) => {
  const { W, H, t, u } = c
  const r1 = c.r1[i], r2 = c.r2[i], r3 = c.r3[i]
  o.x = r1 * W + Math.sin(t * 0.31 + r3 * 20) * u * 0.7
  o.y = r2 * H + Math.cos(t * 0.27 + r1 * 17) * u * 0.7
  o.a = 0.9
  o.b = Math.pow(Math.max(0, Math.sin(t * (0.7 + r3 * 1.6) + r1 * 40)), 22) * 1.8
}

/* ── garantias: escudo com check e anéis concêntricos ─────────── */
const shield: ShapeFn = (i, c, o) => {
  const { W, H, t } = c
  const cx = W * 0.5, cy = H * 0.5
  const R = Math.min(W, H) * (c.mobile ? 0.44 : 0.42)
  const r1 = c.r1[i], r2 = c.r2[i]
  o.a = 1; o.b = 0
  const sel = c.r3[i]
  if (sel < 0.52) {
    // anéis concêntricos girando em sentidos alternados
    const q = i % 4
    const rad = R * (0.72 + q * 0.2) * (1 + 0.01 * Math.sin(t * 1.5 + q))
    const th = r1 * TAU + t * 0.1 * (q & 1 ? 1 : -1) / (1 + q * 0.4)
    o.x = cx + Math.cos(th) * rad
    o.y = cy + Math.sin(th) * rad
    o.b = Math.pow(0.5 + 0.5 * Math.sin(rad * 0.025 - t * 2.4), 10) * 0.7
    return
  }
  const sc = 1 + 0.025 * Math.sin(t * 1.4)
  const w = R * 0.5 * sc, h = R * 0.62 * sc
  if (sel < 0.6) {
    // check (✓) dentro do escudo
    const s = r2
    let x: number, y: number
    if (s < 0.35) { const k = s / 0.35; x = -0.32 + k * 0.24; y = 0.02 + k * 0.26 }
    else          { const k = (s - 0.35) / 0.65; x = -0.08 + k * 0.44; y = 0.28 - k * 0.52 }
    o.x = cx + x * w * 1.4; o.y = cy + y * h
    o.b = 0.5
    return
  }
  // contorno do escudo: topo levemente curvo, laterais descendo até a ponta
  const s = r2
  if (s < 0.3) {
    const k = s / 0.3 * 2 - 1
    o.x = cx + k * w
    o.y = cy - 0.62 * h + 0.1 * h * k * k
  } else {
    const side = s < 0.65 ? 1 : -1
    const v = (s < 0.65 ? (s - 0.3) / 0.35 : (s - 0.65) / 0.35)
    o.x = cx + side * w * Math.pow(Math.cos(v * Math.PI / 2), 0.75)
    o.y = cy - 0.52 * h + v * 1.5 * h
  }
  o.b = 0.15
}

/* ── contato/form: espiral convergindo para o centro (CTA) ─────── */
const converge: ShapeFn = (i, c, o) => {
  const { W, H, t } = c
  const cx = W * 0.5, cy = H * 0.5
  const Rmax = Math.sqrt(W * W + H * H) * 0.55
  const Rmin = Math.min(W, H) * 0.06
  const f = (c.r1[i] + t * 0.055) % 1
  const rad = Rmin + (Rmax - Rmin) * Math.pow(1 - f, 1.4)
  const arms = 6
  const arm = Math.floor(c.r2[i] * arms) / arms * TAU
  const th = arm + (c.r3[i] - 0.5) * 0.5 + (1 - rad / Rmax) * 2.6 + t * 0.05
  o.x = cx + Math.cos(th) * rad
  o.y = cy + Math.sin(th) * rad * 0.85
  // some ao chegar ao centro (o texto/CTA fica limpo) e nasce na borda
  o.a = smooth(Rmin, Rmin + Math.min(W, H) * 0.22, rad) * smooth(Rmax, Rmax * 0.8, rad)
  o.b = (1 - rad / Rmax) * 0.5
}

/* ── footer: a rede se dissolve subindo ─────────────────────── */
const dissolve: ShapeFn = (i, c, o) => {
  o.x = c.hx[i] + Math.sin(c.t * 0.8 + c.r1[i] * 30) * 30
  o.y = c.hy[i] - 60 - c.r2[i] * 120
  o.a = 0.35
  o.b = 0
}

function smooth(e0: number, e1: number, x: number) {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return k * k * (3 - 2 * k)
}

export interface SceneDef { id: string; shape: ShapeFn; params: SceneParams }

/* Ordem = ordem das seções na página */
export const SCENES: SceneDef[] = [
  { id: 'hero',          shape: hero,     params: { link: 2.5, lineA: 0.30, pointA: 0.9,  maxDeg: 6, packets: 0.8, quiet: 0.65 } },
  { id: 'servicos',      shape: lattice,  params: { link: 1.6, lineA: 0.24, pointA: 0.7, maxDeg: 6, packets: 0.6, quiet: 0.7 } },
  { id: 'como-funciona', shape: helix,    params: { link: 1.9, lineA: 0.26, pointA: 0.9,  maxDeg: 4, packets: 1.0, quiet: 0.7 } },
  { id: 'cases',         shape: drift,    params: { link: 1.8, lineA: 0.12, pointA: 0.6,  maxDeg: 3, packets: 0.3, quiet: 0.75 } },
  { id: 'depoimentos',   shape: waves,    params: { link: 1.6, lineA: 0.24, pointA: 0.85, maxDeg: 4, packets: 0.7, quiet: 0.7 } },
  { id: 'faq',           shape: cloud,    params: { link: 2.1, lineA: 0.16, pointA: 0.9,  maxDeg: 4, packets: 0.4, quiet: 0.75 } },
  { id: 'garantias',     shape: shield,   params: { link: 1.5, lineA: 0.24, pointA: 0.85, maxDeg: 4, packets: 0.6, quiet: 0.65 } },
  { id: 'contato',       shape: converge, params: { link: 2.0, lineA: 0.24, pointA: 0.9,  maxDeg: 5, packets: 0.9, quiet: 0.7 } },
  { id: 'form-contato',  shape: converge, params: { link: 2.0, lineA: 0.2,  pointA: 0.8,  maxDeg: 5, packets: 0.9, quiet: 0.8 } },
  { id: 'footer',        shape: dissolve, params: { link: 1.6, lineA: 0.08, pointA: 0.3,  maxDeg: 3, packets: 0.1, quiet: 0 } },
]

export const SCENE_INDEX: Record<string, number> = Object.fromEntries(SCENES.map((s, i) => [s.id, i]))
