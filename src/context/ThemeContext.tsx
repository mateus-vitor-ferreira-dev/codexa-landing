'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface Theme {
  id:        string
  label:     string
  accent:    string  // '#rrggbb'
  accentDim: string
  rgb:       string  // 'r, g, b'
  three:     number  // 0xrrggbb for Three.js
}

export const THEMES: Theme[] = [
  { id: 'cyan',   label: 'Cyan',         accent: '#00d6f5', accentDim: '#007a8c', rgb: '0, 214, 245',   three: 0x00d6f5 },
  { id: 'green',  label: 'Verde Hacker', accent: '#00ff41', accentDim: '#006b1a', rgb: '0, 255, 65',    three: 0x00ff41 },
  { id: 'yellow', label: 'Amarelo',      accent: '#f5d020', accentDim: '#8a7500', rgb: '245, 208, 32',  three: 0xf5d020 },
  { id: 'red',    label: 'Vermelho',     accent: '#ff3355', accentDim: '#8c001a', rgb: '255, 51, 85',   three: 0xff3355 },
  { id: 'purple', label: 'Roxo',         accent: '#a855f7', accentDim: '#5c1fa8', rgb: '168, 85, 247',  three: 0xa855f7 },
]

function applyTheme(t: Theme) {
  const s = document.documentElement.style
  s.setProperty('--accent',        t.accent)
  s.setProperty('--accent-dim',    t.accentDim)
  s.setProperty('--accent-rgb',    t.rgb)
  s.setProperty('--accent-glow',   `rgba(${t.rgb}, 0.12)`)
  s.setProperty('--accent-border', `rgba(${t.rgb}, 0.2)`)
}

interface ThemeCtx { theme: Theme; setTheme: (t: Theme) => void }
const Ctx = createContext<ThemeCtx>({ theme: THEMES[0], setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setState] = useState<Theme>(THEMES[0])
  const setTheme = useCallback((t: Theme) => { setState(t); applyTheme(t) }, [])
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
