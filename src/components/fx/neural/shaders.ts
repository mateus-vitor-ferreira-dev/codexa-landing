/* Shaders próprios da rede. Tudo trabalha em pixels CSS da viewport
   (origem no canto superior esquerdo), sem matrizes de câmera. */

const COMMON = /* glsl */ `
  uniform vec2  uRes;        // viewport em px CSS
  uniform vec4  uQuiet;      // retângulo do texto principal (x0, y0, x1, y1) em px CSS
  uniform float uQuietStr;   // quanto apagar dentro dele
  uniform float uFade;       // fade global (entrada/saída)

  vec4 toClip(vec2 p) { return vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0); }

  // 1 fora do retângulo, (1 - uQuietStr) dentro, com borda bem suave
  float quiet(vec2 p) {
    vec2 d = max(uQuiet.xy - p, p - uQuiet.zw);
    float o = max(d.x, d.y);
    return 1.0 - uQuietStr * (1.0 - smoothstep(-80.0, 120.0, o));
  }
`

export const POINT_VERT = /* glsl */ `
  ${COMMON}
  uniform float uDpr;
  uniform float uStretch;
  attribute float aSize;
  attribute float aBright;
  attribute float aAlpha;
  varying float vBright;
  varying float vAlpha;
  varying float vStretch;

  void main() {
    vec2 p = position.xy;
    gl_Position = toClip(p);
    // rolagem rápida: o ponto vira um traço vertical (motion blur falso)
    float st = 1.0 + uStretch * (0.35 + position.z);
    vStretch = st;
    vBright  = aBright;
    vAlpha   = aAlpha * quiet(p) * uFade;
    gl_PointSize = aSize * uDpr * (1.0 + min(aBright, 2.0) * 0.55) * st;
  }
`

export const POINT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vBright;
  varying float vAlpha;
  varying float vStretch;

  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    c.x *= vStretch;                 // achata na horizontal -> traço vertical
    float r2 = dot(c, c);
    if (r2 > 1.0) discard;
    float core = smoothstep(0.16, 0.0, r2);
    float halo = exp(-r2 * 4.5) * 0.5;
    vec3 col = mix(uColor, vec3(1.0), clamp(core * 0.7 + vBright * 0.25, 0.0, 1.0));
    float a = (core + halo) * vAlpha * (0.6 + vBright);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`

/* Linhas como quads instanciados: cada instância é um segmento A→B,
   o quad é expandido na perpendicular e o fragment faz um falloff gaussiano
   (glow de verdade, sem a linha de 1px dura do GL_LINES). */
export const LINE_VERT = /* glsl */ `
  ${COMMON}
  attribute vec2  aA;
  attribute vec2  aB;
  attribute float aAlpha;
  attribute float aHot;
  attribute float aWidth;
  varying float vSide;
  varying float vAlpha;
  varying float vHot;
  varying float vT;

  void main() {
    vec2 d = aB - aA;
    float len = max(length(d), 0.001);
    vec2 n = vec2(-d.y, d.x) / len;
    vec2 p = mix(aA, aB, position.x) + n * position.y * aWidth;
    gl_Position = toClip(p);
    vSide  = position.y;
    vT     = position.x;
    vHot   = aHot;
    vAlpha = aAlpha * quiet(p) * uFade;
  }
`

export const LINE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vSide;
  varying float vAlpha;
  varying float vHot;
  varying float vT;

  void main() {
    float g = exp(-vSide * vSide * 7.0);
    // pontas somem um pouco para não empastar o halo dos nós
    float ends = smoothstep(0.0, 0.06, vT) * smoothstep(1.0, 0.94, vT);
    vec3 col = mix(uColor, vec3(1.0), clamp(vHot * 0.55, 0.0, 0.8));
    float a = g * vAlpha * (0.35 + 0.65 * ends);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`
