'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

export interface Theme {
  id:        string
  label:     string
  accent:    string  // '#rrggbb'
  accentDim: string
  rgb:       string  // 'r, g, b'
  three:     number  // 0xrrggbb for Three.js
}

export const THEMES: Theme[] = [
  { id: 'cyan',   label: 'Ciano',        accent: '#00d6f5', accentDim: '#007a8c', rgb: '0, 214, 245',   three: 0x00d6f5 },
  { id: 'green',  label: 'Verde Hacker', accent: '#00ff41', accentDim: '#006b1a', rgb: '0, 255, 65',    three: 0x00ff41 },
  { id: 'yellow', label: 'Amarelo',      accent: '#f5d020', accentDim: '#8a7500', rgb: '245, 208, 32',  three: 0xf5d020 },
  { id: 'red',    label: 'Vermelho',     accent: '#ff3355', accentDim: '#8c001a', rgb: '255, 51, 85',   three: 0xff3355 },
  { id: 'purple', label: 'Roxo',         accent: '#a855f7', accentDim: '#5c1fa8', rgb: '168, 85, 247',  three: 0xa855f7 },
]

/* Automático: a cor acompanha a seção no meio da tela (ordem do DOM, em ciclo pelas
   cores, começando no ciano do Hero). Manual: a cor escolhida fica fixa. */
export type ThemeMode = 'auto' | 'manual'

const STORAGE_KEY = 'codexa:cor'
const SECOES = 'main section, footer'

const rgbOf = (t: Theme) => t.rgb.split(',').map(Number) as [number, number, number]
const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0')

function setVars(r: number, g: number, b: number, dim: string) {
  const s = document.documentElement.style
  const rgb = `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`
  s.setProperty('--accent',        `#${hex(r)}${hex(g)}${hex(b)}`)
  s.setProperty('--accent-dim',    dim)
  s.setProperty('--accent-rgb',    rgb)
  s.setProperty('--accent-glow',   `rgba(${rgb}, 0.12)`)
  s.setProperty('--accent-border', `rgba(${rgb}, 0.2)`)
}

interface ThemeCtx {
  theme:    Theme
  mode:     ThemeMode
  /** Escolha da pessoa: aplica a cor e passa para o modo manual */
  setTheme: (t: Theme) => void
  setMode:  (m: ThemeMode) => void
}
const Ctx = createContext<ThemeCtx>({ theme: THEMES[0], mode: 'auto', setTheme: () => {}, setMode: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setState] = useState<Theme>(THEMES[0])
  const [mode, setModeState] = useState<ThemeMode>('auto')
  // Cor que está nas variáveis CSS agora (o tween parte dela)
  const atual = useRef({ r: 0, g: 214, b: 245 })
  // Destino da última troca: rolar dentro da mesma seção não reinicia a transição
  const destino = useRef<Theme>(THEMES[0])
  // Modo vigente para callbacks já agendados (um quadro do automático não sobrescreve a escolha)
  const modoRef = useRef<ThemeMode>('auto')
  useEffect(() => { modoRef.current = mode }, [mode])

  // Troca a cor com transição das variáveis CSS (instantânea com reduced-motion).
  // O estado React muda na hora: as cenas em three.js leem theme.three.
  const aplicar = useCallback((t: Theme) => {
    if (destino.current.id === t.id) return
    destino.current = t
    setState(t)
    const [r, g, b] = rgbOf(t)
    gsap.killTweensOf(atual.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(atual.current, { r, g, b })
      setVars(r, g, b, t.accentDim)
      return
    }
    gsap.to(atual.current, {
      r, g, b, duration: 0.7, ease: 'power2.inOut',
      onUpdate: () => setVars(atual.current.r, atual.current.g, atual.current.b, t.accentDim),
    })
  }, [])

  const salvar = (m: ThemeMode, t: Theme) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: m, id: t.id })) } catch {}
  }

  const setTheme = useCallback((t: Theme) => {
    modoRef.current = 'manual'
    setModeState('manual')
    aplicar(t)
    salvar('manual', t)
  }, [aplicar])

  const setMode = useCallback((m: ThemeMode) => {
    modoRef.current = m
    setModeState(m)
    salvar(m, destino.current)
  }, [])

  // Recupera a escolha da sessão (só depois de montar: o HTML do servidor sai em ciano)
  // (no quadro seguinte, para não renderizar duas vezes na hidratação)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const salvo = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as { mode?: ThemeMode; id?: string } | null
        if (salvo?.mode === 'manual') {
          const t = THEMES.find(x => x.id === salvo.id)
          if (t) { modoRef.current = 'manual'; setModeState('manual'); aplicar(t) }
        }
      } catch {}
    })
    return () => cancelAnimationFrame(id)
  }, [aplicar])

  // Modo automático: a cada quadro de rolagem, a seção que cruza o meio da tela define a cor
  useEffect(() => {
    if (mode !== 'auto') return
    let raf = 0
    const escolher = () => {
      raf = 0
      if (modoRef.current !== 'auto') return
      const secoes = Array.from(document.querySelectorAll<HTMLElement>(SECOES))
      if (!secoes.length) return
      const meio = window.innerHeight / 2
      let i = secoes.findIndex(el => {
        const r = el.getBoundingClientRect()
        return r.top <= meio && r.bottom > meio
      })
      if (i < 0) i = secoes[0].getBoundingClientRect().top > meio ? 0 : secoes.length - 1
      aplicar(THEMES[i % THEMES.length])
    }
    const agendar = () => { if (!raf) raf = requestAnimationFrame(escolher) }
    agendar()
    window.addEventListener('scroll', agendar, { passive: true })
    window.addEventListener('resize', agendar)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', agendar)
      window.removeEventListener('resize', agendar)
    }
  }, [mode, aplicar])

  return <Ctx.Provider value={{ theme, mode, setTheme, setMode }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
