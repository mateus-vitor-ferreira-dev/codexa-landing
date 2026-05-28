'use client'

import { useTheme, THEMES } from '@/context/ThemeContext'
import { gsap } from 'gsap'

export function ColorSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
        padding: '10px 8px',
        background: 'rgba(10,10,14,0.75)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {THEMES.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => setTheme(t)}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.35, duration: 0.18 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1,    duration: 0.18 })}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: t.accent,
            border: `2px solid ${theme.id === t.id ? '#fff' : 'transparent'}`,
            cursor: 'none',
            outline: 'none',
            boxShadow: theme.id === t.id ? `0 0 10px ${t.accent}` : `0 0 4px ${t.accent}66`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
      ))}
    </div>
  )
}
