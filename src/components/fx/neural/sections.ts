import { SCENE_INDEX } from './scenes'

/* Mapa das seções da página → cenas da rede.
   As posições são medidas no documento (top/bottom absolutos) só quando o
   layout muda (resize, refresh do ScrollTrigger, ResizeObserver, timer lento);
   no frame a gente só lê window.scrollY — zero layout thrashing. */

export interface Region { scene: number; id: string; top: number; bottom: number }

export interface SectionTracker {
  regions: Region[]
  heroBottom: number
  measure(): void
  /** coordenada contínua de cena (índice de região + mistura) para a linha central */
  coord(scrollY: number, H: number): number
  /** região dominante e progresso dentro dela */
  dominant(scrollY: number, H: number, out: { region: number; progress: number }): void
}

function sceneIdOf(el: HTMLElement, k: number): string {
  if (el.tagName === 'FOOTER') return 'footer'
  if (el.id && el.id in SCENE_INDEX) return el.id
  if (el.getAttribute('aria-labelledby') === 'garantias-titulo') return 'garantias'
  if (k === 0) return 'hero'
  return ''
}

export function createSectionTracker(): SectionTracker {
  const t: SectionTracker = {
    regions: [{ scene: 0, id: 'hero', top: 0, bottom: 1 }],
    heroBottom: 1,

    measure() {
      const els = Array.from(document.querySelectorAll<HTMLElement>('main section, body > footer, footer'))
      const sy = window.scrollY
      const out: Region[] = []
      let prev = 'hero'
      let k = 0
      const seen = new Set<HTMLElement>()
      for (const el of els) {
        if (seen.has(el)) continue
        seen.add(el)
        // ignora seções aninhadas dentro de outra seção
        if (el.tagName === 'SECTION' && el.parentElement?.closest('section')) continue
        let id = sceneIdOf(el, k++)
        if (!id) id = prev // seções sem id herdam a cena anterior (manifesto, números…)
        // seção com pin do ScrollTrigger: mede o espaçador, que tem a altura real no fluxo
        const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
        const r = box.getBoundingClientRect()
        const top = r.top + sy, bottom = r.bottom + sy
        const last = out[out.length - 1]
        if (last && last.id === id) last.bottom = Math.max(last.bottom, bottom)
        else out.push({ scene: SCENE_INDEX[id], id, top, bottom })
        prev = id
      }
      if (out.length) {
        out.sort((a, b) => a.top - b.top)
        t.regions = out
        t.heroBottom = out[0].id === 'hero'
          ? (els[0]?.getBoundingClientRect().bottom ?? window.innerHeight) + sy
          : window.innerHeight
      }
    },

    coord(scrollY, H) {
      const R = t.regions
      const c = scrollY + H * 0.5
      const Z = H * 0.42
      let k = 0
      while (k + 1 < R.length && R[k + 1].top <= c) k++
      // perto da fronteira com a próxima região
      if (k + 1 < R.length) {
        const b = R[k + 1].top
        if (c > b - Z) return k + (c - (b - Z)) / (2 * Z)
      }
      // perto da fronteira com a anterior
      if (k > 0) {
        const b = R[k].top
        if (c < b + Z) return k - 1 + (c - (b - Z)) / (2 * Z)
      }
      return k
    },

    dominant(scrollY, H, out) {
      const R = t.regions
      const c = scrollY + H * 0.5
      let k = 0
      while (k + 1 < R.length && R[k + 1].top <= c) k++
      const top = R[k].top
      const bottom = k + 1 < R.length ? R[k + 1].top : R[k].bottom
      out.region = k
      out.progress = Math.min(1, Math.max(0, (c - top) / Math.max(1, bottom - top)))
    },
  }
  return t
}
