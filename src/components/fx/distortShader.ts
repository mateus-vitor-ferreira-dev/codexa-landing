/* Shaders do DistortImage (GLSL ES 1.0 — roda em WebGL1 e WebGL2).
   Convenção: vUv vai de (0,0) no canto superior esquerdo a (1,1) no inferior
   direito, igual ao DOM; as texturas sobem sem flipY, então a linha 0 é o topo
   do print. Em repouso (uReveal=1, uHover=0, sem ripples, uMix 0 ou 1) o
   fragment devolve exatamente o texel — a imagem fica idêntica à <img>. */

export const VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const MAX_RIPPLES = 4

export const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform vec4  uCover0;      // xy escala, zw deslocamento (object-fit: cover; object-position: top)
uniform vec4  uCover1;
uniform vec2  uRes;         // tamanho do canvas em px
uniform float uTime;
uniform vec2  uMouse;       // ponteiro em uv (0..1)
uniform float uHover;       // 0..1 — intensidade da distorção líquida
uniform vec2  uVel;         // velocidade do ponteiro em uv/frame (suavizada)
uniform float uReveal;      // 0..1 — transição de entrada
uniform float uMix;         // 0..1 — quanto da textura 1 (tema escuro)
uniform vec4  uRipples[${MAX_RIPPLES}]; // xy posição uv, z idade (s), w força
uniform vec3  uAccent;
uniform vec3  uBg;

/* Simplex 2D (Ashima Arts / Stefan Gustavson, licença MIT) */
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/* Amostra o print com cover + mistura dos dois temas pela máscara do wipe */
vec3 img(vec2 uv, float mask) {
  vec3 a = texture2D(uTex0, uv * uCover0.xy + uCover0.zw).rgb;
  if (mask <= 0.0) return a;
  vec3 b = texture2D(uTex1, uv * uCover1.xy + uCover1.zw).rgb;
  return mix(a, b, mask);
}

void main() {
  vec2 uv = vUv;

  // Caminho rápido do repouso: texel puro, sem nenhum cálculo extra
  bool idle = uReveal >= 1.0 && uHover <= 0.0 && (uMix <= 0.0 || uMix >= 1.0)
           && uRipples[0].w <= 0.0 && uRipples[1].w <= 0.0
           && uRipples[2].w <= 0.0 && uRipples[3].w <= 0.0;
  if (idle) {
    gl_FragColor = vec4(img(uv, uMix), 1.0);
    return;
  }

  vec2 asp = vec2(uRes.x / uRes.y, 1.0);   // espaço "quadrado" para círculos redondos
  vec2 p = uv * asp;
  vec2 m = uMouse * asp;
  vec2 disp = vec2(0.0);
  vec3 glow = vec3(0.0);
  float chroma = 0.0;
  vec2  chromaDir = vec2(1.0, 0.0);

  /* ── (a) distorção líquida que segue o cursor ── */
  if (uHover > 0.0) {
    vec2 toM = p - m;
    float d = length(toM);
    float fall = exp(-d * d * 6.0) * uHover;
    vec2 n = vec2(snoise(p * 2.6 + vec2(0.0, uTime * 0.35)),
                  snoise(p * 2.6 + vec2(17.3, -uTime * 0.3)));
    disp += n * 0.016 * fall;
    // lente: puxa a amostra para o ponteiro (leve lupa)
    disp -= toM * 0.06 * fall;
    // ondulação radial saindo do ponteiro
    float wave = sin(d * 42.0 - uTime * 5.5) * exp(-d * 6.0);
    disp += (toM / max(d, 1e-4)) * wave * 0.0045 * uHover;
    glow += uAccent * fall * 0.06;

    /* ── (b) separação RGB proporcional à velocidade ── */
    float sp = length(uVel);
    chroma += min(sp * 0.9, 0.022) * (0.35 + 0.65 * fall / max(uHover, 1e-4)) * uHover;
    if (sp > 1e-5) chromaDir = uVel / sp;
  }

  /* ── (e) ripples de toque/clique ── */
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    if (r.w <= 0.0) continue;
    vec2 toR = p - r.xy * asp;
    float d = length(toR);
    float front = r.z * 0.85;
    float x = d - front;
    float ring = exp(-x * x * 260.0);
    float amp = r.w * (1.0 - smoothstep(0.0, 1.5, r.z));
    disp += (toR / max(d, 1e-4)) * sin(x * 60.0) * ring * 0.022 * amp;
    glow += uAccent * ring * amp * 0.22;
    chroma += ring * amp * 0.008;
  }

  /* ── (d) wipe líquido entre tema claro e escuro ── */
  float mask = uMix;
  if (uMix > 0.0 && uMix < 1.0) {
    // frente fw vai de -0.13 a 1.13 (ruído ±0.13); t cobre esse intervalo + a borda de 0.07
    float t = uMix * 1.4 - 0.2;
    float fw = uv.x * 0.72 + (1.0 - uv.y) * 0.28 + 0.13 * snoise(p * 2.2 + uTime * 0.6);
    mask = 1.0 - smoothstep(t - 0.07, t + 0.07, fw);
    float edge = 1.0 - abs(mask * 2.0 - 1.0);
    vec2 n = vec2(snoise(p * 5.0 + uTime), snoise(p * 5.0 - uTime + 9.1));
    disp += n * 0.035 * edge;
    glow += uAccent * pow(edge, 3.0) * 0.55;
    chroma += edge * 0.012;
  }

  /* ── (c) transição de entrada: dissolve por ruído + mosaico + scanline ── */
  float revealed = 1.0;
  float front = 0.0;
  vec2 suv = uv + disp / asp;
  if (uReveal < 1.0) {
    float rf = uv.y * 0.7 + 0.3 * (snoise(p * 4.5) * 0.5 + 0.5);
    float tr = uReveal * 1.6 - 0.15;
    revealed = 1.0 - smoothstep(tr - 0.05, tr, rf);
    float behind = clamp((tr - rf) / 0.4, 0.0, 1.0);
    // mosaico que vai ficando fino conforme a frente passa
    float bs = floor(mix(26.0, 1.0, behind * behind));
    if (bs > 1.0) {
      vec2 px = uRes / bs;
      suv = (floor(suv * px) + 0.5) / px;
    }
    float x = (rf - tr) * 34.0;
    front = exp(-x * x);
    chroma += front * 0.02 + (1.0 - behind) * 0.006;
    chromaDir = vec2(0.0, 1.0);
    // cintilação de blocos logo atrás da frente (pixel-sort)
    float row = floor(uv.y * uRes.y / 3.0);
    float sortJ = step(0.82, hash(vec2(row, floor(uTime * 24.0)))) * (1.0 - behind) * revealed;
    suv.x += (hash(vec2(row, 3.7)) - 0.5) * 0.08 * sortJ;
  }

  vec3 col;
  if (chroma > 0.0) {
    vec2 o = chromaDir * chroma / asp;
    col = vec3(img(suv + o, mask).r, img(suv, mask).g, img(suv - o, mask).b);
  } else {
    col = img(suv, mask);
  }
  col += glow;

  if (uReveal < 1.0) {
    // fundo antes da revelação: grade de pontos + scanlines tingidas pelo accent
    vec2 g = fract(uv * uRes / 14.0) - 0.5;
    float dots = smoothstep(0.09, 0.0, length(g)) * 0.35;
    float scan = 0.5 + 0.5 * sin(uv.y * uRes.y * 1.4 - uTime * 18.0);
    vec3 bg = uBg + uAccent * (dots * 0.25 + scan * 0.025);
    col = mix(bg, col, revealed);
    col += uAccent * front * 0.9 + vec3(1.0) * front * 0.25;
  }

  gl_FragColor = vec4(col, 1.0);
}
`
