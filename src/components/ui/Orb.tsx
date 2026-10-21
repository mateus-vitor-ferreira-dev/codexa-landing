import * as THREE from 'three'

/* ── Motor da esfera Codexa ──────────────────────────────────────
   A logo da empresa em WebGL: rede geodésica (esfera de Fibonacci) com
   nós brilhantes, arestas com "pacotes de energia" correndo, casca
   geodésica densa, núcleo com fresnel, halo e anel de satélites.
   Toda a deformação (respirar, expandir, explodir, onda de choque,
   dissolver) roda no shader: a CPU só atualiza uniforms por frame.
   Quem posiciona a esfera na página é o TravelingOrb; aqui é só o visual. */

export const ORB_RADIUS = 1.3
/** O canvas é BOX_RATIO vezes o diâmetro da esfera: folga para explosão, anel e halo */
export const BOX_RATIO  = 1.6

const FOV = 45

export interface OrbOptions {
  /** quantidade de nós da rede (logo: ~190; celular: ~110) */
  points: number
  /** versão leve: menos segmentos na casca e no núcleo */
  lite: boolean
}

/** Estado lido a cada frame; o TravelingOrb escreve aqui sem alocar nada */
export interface OrbState {
  expand:  number   // nós afastados do centro + maiores
  wire:    number   // casca geodésica densa + linha de varredura
  noise:   number   // superfície orgânica ("respira")
  ring:    number   // anel de satélites orbitando
  energy:  number   // fluxo nas arestas, cintilar dos nós
  hover:   number   // cursor sobre a esfera
  explode: number   // nós lançados para fora (mola no TravelingOrb)
  dissolve: number  // desfaz em partículas (rodapé)
  flash:   number   // clarão curto (clique, entrada de seção)
  sizeBoost: number // nós maiores quando a esfera está pequena na tela
  rotX: number; rotY: number; rotZ: number
}

export interface OrbEngine {
  state: OrbState
  setColor(hex: number): void
  /** onda de choque partindo do ponto da superfície voltado para (x, y, z) no espaço da câmera */
  wave(x: number, y: number, z: number, amp: number): void
  /** tamanho CSS do canvas e densidade de pixels efetiva */
  setSize(cssPx: number, pixelRatio: number): void
  render(time: number, dt: number): void
  dispose(): void
}

/* ── GLSL compartilhado: a mesma deformação em nós, arestas e casca,
   para a rede nunca "descolar" das linhas ───────────────────────── */
const COMMON = /* glsl */`
  uniform float uTime;
  uniform float uExpand;
  uniform float uNoise;
  uniform float uExplode;
  uniform float uDissolve;
  uniform float uWave;
  uniform float uWaveAmp;
  uniform vec3  uWaveAxis;

  float waveAt(vec3 n) {
    if (uWaveAmp < 0.001) return 0.0;
    // frente de onda vai do polo uWaveAxis (+1) ao oposto (-1)
    float d = dot(n, uWaveAxis) - (1.0 - 2.2 * uWave);
    return exp(-d * d * 22.0) * uWaveAmp;
  }

  vec3 displace(vec3 pos, vec3 dir, float seed, out float wave) {
    vec3 n = normalize(pos);
    wave = waveAt(n);
    float br = sin(uTime * 1.4 + seed * 6.2831) * 0.5 + 0.5;
    float nz = sin(n.x * 3.1 + uTime * 0.8) * sin(n.y * 3.7 - uTime * 0.6) * sin(n.z * 2.9 + uTime * 0.7);
    float r  = 1.0 + uExpand * (0.08 + 0.08 * br) + uNoise * 0.17 * nz + wave * 0.11;
    vec3 p = pos * r;
    float ex = uExplode + uDissolve * 1.1;
    p += dir * ex * (0.45 + seed * 0.75);
    return p;
  }
`

const POINT_VS = /* glsl */`
  ${COMMON}
  attribute vec3  aDir;
  attribute float aSeed;
  uniform float uSize;
  uniform float uPx;
  uniform float uHover;
  uniform float uEnergy;
  uniform float uFlash;
  uniform float uMul;
  uniform float uSizeBoost;
  varying float vAlpha;
  varying float vHot;

  void main() {
    float wave;
    vec3 p = displace(position, aDir, aSeed, wave);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 vn = normalize(normalMatrix * normalize(position));
    float front = smoothstep(-0.75, 0.9, vn.z);
    float tw  = sin(uTime * 2.3 + aSeed * 40.0) * 0.5 + 0.5;
    float spark = step(0.9, aSeed) * tw * uEnergy;
    vHot = clamp(wave * 1.4 + uFlash * 0.7 + uHover * 0.35 + spark, 0.0, 1.6);
    gl_PointSize = uSize * uSizeBoost * (1.0 + vHot * 0.9 + uExpand * 0.45 + tw * 0.2) * uPx / -mv.z;
    gl_Position = projectionMatrix * mv;
    float fade = 1.0 - smoothstep(aSeed * 0.5, aSeed * 0.5 + 0.5, uDissolve);
    vAlpha = (0.25 + 0.75 * front) * uMul * fade;
  }
`

const POINT_FS = /* glsl */`
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vHot;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c) * 4.0;
    if (d2 > 1.0) discard;
    float core = exp(-d2 * 10.0);
    float glow = exp(-d2 * 3.2) * 0.5;
    vec3 col = mix(uColor, vec3(1.0), clamp(core * 0.85 + vHot * 0.3, 0.0, 1.0));
    gl_FragColor = vec4(col, (core + glow) * vAlpha);
  }
`

const LINE_VS = /* glsl */`
  ${COMMON}
  attribute vec3  aDir;
  attribute float aSeed;
  attribute float aParam;
  attribute float aLine;
  varying float vParam;
  varying float vLine;
  varying float vFront;
  varying float vWave;
  void main() {
    float wave;
    vec3 p = displace(position, aDir, aSeed, wave);
    vec3 vn = normalize(normalMatrix * normalize(position));
    vFront = smoothstep(-0.8, 0.85, vn.z);
    vParam = aParam;
    vLine  = aLine;
    vWave  = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const LINE_FS = /* glsl */`
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uHover;
  uniform float uExpand;
  uniform float uFlash;
  uniform float uExplode;
  uniform float uDissolve;
  varying float vParam;
  varying float vLine;
  varying float vFront;
  varying float vWave;
  void main() {
    // pacote de energia correndo pela aresta (só em parte das arestas)
    float head = fract(uTime * (0.22 + vLine * 0.4) + vLine * 13.0);
    float on   = step(0.8 - uEnergy * 0.3, fract(vLine * 7.31));
    float flow = smoothstep(0.14, 0.0, abs(vParam - head)) * on;
    float a = (0.13 + uHover * 0.16 + uExpand * 0.05 + uFlash * 0.25) * (0.25 + 0.75 * vFront);
    a += flow * 0.85 * vFront + vWave * 0.7;
    a *= 1.0 - smoothstep(0.03, 0.4, max(uExplode, 0.0));
    a *= 1.0 - smoothstep(0.0, 0.5, uDissolve);
    vec3 col = mix(uColor, vec3(1.0), clamp(flow * 0.65 + vWave * 0.5, 0.0, 1.0));
    gl_FragColor = vec4(col, a);
  }
`

const SHELL_VS = /* glsl */`
  ${COMMON}
  attribute vec3  aDir;
  attribute float aSeed;
  varying float vFront;
  varying float vY;
  varying float vWave;
  void main() {
    float wave;
    vec3 p = displace(position, aDir, aSeed, wave);
    vec3 n = normalize(position);
    vec3 vn = normalize(normalMatrix * n);
    vFront = smoothstep(-0.8, 0.85, vn.z);
    vY = n.y;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const SHELL_FS = /* glsl */`
  uniform vec3  uColor;
  uniform float uWire;
  uniform float uScan;
  uniform float uExplode;
  uniform float uDissolve;
  varying float vFront;
  varying float vY;
  varying float vWave;
  void main() {
    float scan = smoothstep(0.06, 0.0, abs(vY - uScan));
    float a = uWire * ((0.05 + 0.1 * vFront) + scan * 0.55 * (0.3 + 0.7 * vFront) + vWave * 0.4);
    a *= 1.0 - smoothstep(0.02, 0.35, max(uExplode, 0.0));
    a *= 1.0 - smoothstep(0.0, 0.4, uDissolve);
    gl_FragColor = vec4(mix(uColor, vec3(1.0), scan * 0.5), a);
  }
`

const CORE_VS = /* glsl */`
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const CORE_FS = /* glsl */`
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uHover;
  uniform float uFlash;
  uniform float uDissolve;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.4);
    float beat = 0.5 + 0.5 * sin(uTime * (1.4 + uEnergy * 1.6));
    float k = 0.16 + uEnergy * 0.12 * beat + uHover * 0.2 + uFlash * 0.6;
    float a = (0.05 + f * 0.75) * k * (1.0 - uDissolve);
    gl_FragColor = vec4(mix(uColor, vec3(1.0), f * 0.3), a);
  }
`

const HALO_VS = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

const HALO_FS = /* glsl */`
  uniform vec3  uColor;
  uniform float uHover;
  uniform float uFlash;
  uniform float uEnergy;
  uniform float uDissolve;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = exp(-d * d * 3.5) * smoothstep(1.0, 0.55, d);
    a *= (0.11 + uEnergy * 0.05 + uHover * 0.1 + uFlash * 0.28) * (1.0 - uDissolve);
    gl_FragColor = vec4(uColor, a);
  }
`

/* Esfera de Fibonacci: distribuição uniforme dos nós (a mesma da logo) */
function fibonacci(n: number, r: number) {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / n)
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
    out[i * 3]     = Math.sin(phi) * Math.cos(theta) * r
    out[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r
    out[i * 3 + 2] = Math.cos(phi) * r
  }
  return out
}

/* Direção de explosão: a normal com um desvio aleatório, para os nós
   não saírem todos em linha reta como um balão */
function explodeDirs(pos: Float32Array, rand: () => number, jitter = 0.55) {
  const n = pos.length / 3
  const dirs = new Float32Array(n * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).normalize()
    v.x += (rand() - 0.5) * jitter; v.y += (rand() - 0.5) * jitter; v.z += (rand() - 0.5) * jitter
    v.normalize()
    dirs[i * 3] = v.x; dirs[i * 3 + 1] = v.y; dirs[i * 3 + 2] = v.z
  }
  return dirs
}

/* PRNG determinístico: a esfera sai igual em toda visita */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createOrb(canvas: HTMLCanvasElement, opts: OrbOptions): OrbEngine {
  const R = ORB_RADIUS
  const rand = mulberry32(20240607)

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, premultipliedAlpha: true,
    powerPreference: opts.lite ? 'low-power' : 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50)
  // Distância em que a esfera ocupa exatamente 1/BOX_RATIO da altura do canvas
  camera.position.z = (R * BOX_RATIO) / Math.tan(THREE.MathUtils.degToRad(FOV / 2))

  // ── Uniforms compartilhados (o mesmo objeto {value} em todos os materiais)
  const U = {
    uTime:     { value: 0 },
    uExpand:   { value: 0 },
    uNoise:    { value: 0 },
    uExplode:  { value: 0 },
    uDissolve: { value: 0 },
    uWave:     { value: 0 },
    uWaveAmp:  { value: 0 },
    uWaveAxis: { value: new THREE.Vector3(0, 1, 0) },
    uColor:    { value: new THREE.Color(0x00d6f5) },
    uEnergy:   { value: 0.5 },
    uHover:    { value: 0 },
    uFlash:    { value: 0 },
    uWire:     { value: 0 },
    uScan:     { value: 0 },
    uPx:       { value: 500 },
    uSizeBoost:{ value: 1 },
  }

  const additive = {
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  } as const

  // ── Nós
  const N = opts.points
  const nodePos  = fibonacci(N, R)
  const nodeDir  = explodeDirs(nodePos, rand)
  const nodeSeed = new Float32Array(N).map(() => rand())
  const nodeGeom = new THREE.BufferGeometry()
  nodeGeom.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))
  nodeGeom.setAttribute('aDir',     new THREE.BufferAttribute(nodeDir, 3))
  nodeGeom.setAttribute('aSeed',    new THREE.BufferAttribute(nodeSeed, 1))
  const nodeMat = new THREE.ShaderMaterial({
    vertexShader: POINT_VS, fragmentShader: POINT_FS, ...additive,
    uniforms: { ...U, uSize: { value: 0.085 }, uMul: { value: 1 } },
  })
  const nodes = new THREE.Points(nodeGeom, nodeMat)

  // ── Arestas entre nós vizinhos (limiar escala com a densidade)
  const maxDist = 0.55 * Math.sqrt(180 / N)
  const lp: number[] = [], ld: number[] = [], ls: number[] = [], lpar: number[] = [], lid: number[] = []
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = nodePos[i * 3] - nodePos[j * 3]
      const dy = nodePos[i * 3 + 1] - nodePos[j * 3 + 1]
      const dz = nodePos[i * 3 + 2] - nodePos[j * 3 + 2]
      if (dx * dx + dy * dy + dz * dz >= maxDist * maxDist) continue
      const id = rand()
      // alterna o sentido para os pacotes não correrem todos na mesma direção
      const [a, b] = rand() < 0.5 ? [i, j] : [j, i]
      for (const [k, par] of [[a, 0], [b, 1]] as const) {
        lp.push(nodePos[k * 3], nodePos[k * 3 + 1], nodePos[k * 3 + 2])
        ld.push(nodeDir[k * 3], nodeDir[k * 3 + 1], nodeDir[k * 3 + 2])
        ls.push(nodeSeed[k]); lpar.push(par); lid.push(id)
      }
    }
  }
  const lineGeom = new THREE.BufferGeometry()
  lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3))
  lineGeom.setAttribute('aDir',     new THREE.Float32BufferAttribute(ld, 3))
  lineGeom.setAttribute('aSeed',    new THREE.Float32BufferAttribute(ls, 1))
  lineGeom.setAttribute('aParam',   new THREE.Float32BufferAttribute(lpar, 1))
  lineGeom.setAttribute('aLine',    new THREE.Float32BufferAttribute(lid, 1))
  const lineMat = new THREE.ShaderMaterial({
    vertexShader: LINE_VS, fragmentShader: LINE_FS, ...additive, uniforms: U,
  })
  const lines = new THREE.LineSegments(lineGeom, lineMat)

  // ── Casca geodésica densa (icosaedro subdividido em arame)
  const ico = new THREE.IcosahedronGeometry(R * 0.97, opts.lite ? 2 : 3)
  const shellGeom = new THREE.WireframeGeometry(ico)
  ico.dispose()
  {
    const p = shellGeom.getAttribute('position').array as Float32Array
    shellGeom.setAttribute('aDir',  new THREE.BufferAttribute(explodeDirs(p, rand, 0.3), 3))
    // semente pela posição: vértices repetidos recebem o mesmo valor e a malha não rasga
    const seeds = new Float32Array(p.length / 3)
    for (let i = 0; i < seeds.length; i++) {
      const h = Math.sin(p[i * 3] * 12.9898 + p[i * 3 + 1] * 78.233 + p[i * 3 + 2] * 37.719) * 43758.5453
      seeds[i] = h - Math.floor(h)
    }
    shellGeom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    // aDir também precisa ser igual em vértices repetidos: usa a normal pura
    const dirs = shellGeom.getAttribute('aDir').array as Float32Array
    for (let i = 0; i < seeds.length; i++) {
      const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2]
      const l = Math.hypot(x, y, z) || 1
      dirs[i * 3] = x / l; dirs[i * 3 + 1] = y / l; dirs[i * 3 + 2] = z / l
    }
  }
  const shellMat = new THREE.ShaderMaterial({
    vertexShader: SHELL_VS, fragmentShader: SHELL_FS, ...additive, uniforms: U,
  })
  const shell = new THREE.LineSegments(shellGeom, shellMat)
  const shellPivot = new THREE.Group()
  shellPivot.add(shell)

  // ── Núcleo (fresnel)
  const coreGeom = new THREE.SphereGeometry(R * 0.42, opts.lite ? 24 : 40, opts.lite ? 16 : 28)
  const coreMat  = new THREE.ShaderMaterial({
    vertexShader: CORE_VS, fragmentShader: CORE_FS, ...additive, uniforms: U,
  })
  const core = new THREE.Mesh(coreGeom, coreMat)

  // ── Anel de satélites (duas órbitas inclinadas)
  const RING_N = opts.lite ? 70 : 140
  const ringPos = new Float32Array(RING_N * 3)
  for (let i = 0; i < RING_N; i++) {
    const second = i % 3 === 0
    const a = (i / RING_N) * Math.PI * 2 * (second ? 3 : 1.5) + rand() * 0.08
    const rr = R * (second ? 1.22 : 1.36) + (rand() - 0.5) * 0.05
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr
    // órbita secundária inclinada
    ringPos[i * 3]     = x
    ringPos[i * 3 + 1] = second ? z * 0.55 : (rand() - 0.5) * 0.03
    ringPos[i * 3 + 2] = second ? z * 0.83 : z
  }
  const ringGeom = new THREE.BufferGeometry()
  ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPos, 3))
  ringGeom.setAttribute('aDir',  new THREE.BufferAttribute(explodeDirs(ringPos, rand, 0.8), 3))
  ringGeom.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(RING_N).map(() => rand()), 1))
  const ringMat = new THREE.ShaderMaterial({
    vertexShader: POINT_VS, fragmentShader: POINT_FS, ...additive,
    uniforms: { ...U, uSize: { value: 0.05 }, uMul: { value: 0 } },
  })
  const ring = new THREE.Points(ringGeom, ringMat)
  const ringPivot = new THREE.Group()
  ringPivot.rotation.set(0.42, 0, -0.22)
  ringPivot.add(ring)

  // ── Halo (plano voltado para a câmera, fora do grupo que gira)
  const haloGeom = new THREE.PlaneGeometry(R * 3.1, R * 3.1)
  const haloMat  = new THREE.ShaderMaterial({
    vertexShader: HALO_VS, fragmentShader: HALO_FS, ...additive, uniforms: U,
  })
  const halo = new THREE.Mesh(haloGeom, haloMat)
  halo.renderOrder = -1

  const group = new THREE.Group()
  group.add(core, shellPivot, lines, nodes)
  scene.add(halo, group, ringPivot)

  const state: OrbState = {
    expand: 0, wire: 0, noise: 0, ring: 0, energy: 0.5, hover: 0, explode: 0,
    dissolve: 0, flash: 0, sizeBoost: 1, rotX: 0, rotY: 0, rotZ: 0,
  }

  let waveT = 1
  let waveAmp = 0
  const tmpV = new THREE.Vector3()
  const tmpQ = new THREE.Quaternion()
  let cssSize = 0, pr = 0

  return {
    state,
    setColor(hex) { U.uColor.value.setHex(hex) },
    wave(x, y, z, amp) {
      // eixo no espaço do objeto: a onda nasce do lado voltado para o clique
      tmpV.set(x, y, z).normalize().applyQuaternion(tmpQ.copy(group.quaternion).invert())
      U.uWaveAxis.value.copy(tmpV)
      waveT = 0
      waveAmp = amp
    },
    setSize(px, ratio) {
      if (Math.abs(px - cssSize) < 0.5 && Math.abs(ratio - pr) < 0.001) return
      cssSize = px; pr = ratio
      renderer.setPixelRatio(ratio)
      renderer.setSize(px, px, false)
      camera.aspect = 1
      camera.updateProjectionMatrix()
      // pixels por unidade do mundo na distância 1 (gl_PointSize = tamanho * uPx / z)
      U.uPx.value = (px * ratio) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)))
    },
    render(time, dt) {
      const s = state
      U.uTime.value     = time
      U.uExpand.value   = s.expand
      U.uNoise.value    = s.noise
      U.uExplode.value  = s.explode
      U.uDissolve.value = s.dissolve
      U.uEnergy.value   = s.energy
      U.uHover.value    = s.hover
      U.uFlash.value    = s.flash
      U.uWire.value     = s.wire
      U.uSizeBoost.value = s.sizeBoost
      U.uScan.value     = Math.sin(time * 0.7) * 0.95
      ringMat.uniforms.uMul.value = s.ring

      if (waveT < 1) {
        waveT = Math.min(1, waveT + dt * 0.85)
        U.uWave.value = waveT
        U.uWaveAmp.value = waveAmp * (1 - waveT * 0.6)
      } else U.uWaveAmp.value = 0

      group.rotation.set(s.rotX, s.rotY, s.rotZ)
      shellPivot.rotation.y = -time * 0.05
      ringPivot.rotation.y = time * 0.35
      ringPivot.rotation.x = 0.42 + s.rotX * 0.5

      // pula objetos invisíveis (sem custo de draw call)
      shell.visible = s.wire > 0.01
      ring.visible  = s.ring > 0.01

      renderer.render(scene, camera)
    },
    dispose() {
      nodeGeom.dispose(); nodeMat.dispose()
      lineGeom.dispose(); lineMat.dispose()
      shellGeom.dispose(); shellMat.dispose()
      coreGeom.dispose(); coreMat.dispose()
      ringGeom.dispose(); ringMat.dispose()
      haloGeom.dispose(); haloMat.dispose()
      renderer.dispose()
    },
  }
}
