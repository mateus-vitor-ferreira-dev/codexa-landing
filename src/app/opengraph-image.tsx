import { ImageResponse } from 'next/og'

export const alt = 'Codexa — Soluções digitais sob medida'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#09090b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '72px 88px',
          position: 'relative',
          fontFamily: '"Arial Black", "Arial", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '640px',
            height: '640px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,214,245,0.13) 0%, transparent 68%)',
            display: 'flex',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #00d6f5 0%, rgba(0,214,245,0.25) 55%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '52px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00d6f5',
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: '15px',
              letterSpacing: '0.28em',
              color: '#71717a',
              fontFamily: '"Courier New", monospace',
            }}
          >
            CODEXA
          </span>
          <span style={{ color: '#00d6f5', fontSize: '17px', fontWeight: 700 }}>_</span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '82px',
              fontWeight: 900,
              color: '#f4f4f5',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
            }}
          >
            Soluções digitais
          </span>
          <span
            style={{
              fontSize: '82px',
              fontWeight: 900,
              color: '#00d6f5',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            sob medida.
          </span>
        </div>

        {/* Services row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '52px' }}>
          {['Sites', 'Sistemas Web', 'Apps', 'Automações com IA'].map((s) => (
            <div
              key={s}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                border: '1px solid rgba(0,214,245,0.22)',
                background: 'rgba(0,214,245,0.05)',
                color: '#a1a1aa',
                fontSize: '16px',
                letterSpacing: '0.03em',
                display: 'flex',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <span
            style={{
              fontSize: '13px',
              color: '#52525b',
              letterSpacing: '0.22em',
              fontFamily: '"Courier New", monospace',
            }}
          >
            LAVRAS, MG — BRASIL
          </span>
          <div
            style={{
              width: '1px',
              height: '14px',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              color: '#52525b',
              letterSpacing: '0.12em',
              fontFamily: '"Courier New", monospace',
            }}
          >
            codexa.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
