'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const WA_URL = 'https://wa.me/5535997460058?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20um%20projeto!'

export function WhatsAppButton() {
  const btnRef    = useRef<HTMLAnchorElement>(null)
  const labelRef  = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  // Aparece após scroll de 300px
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fade in/out ao mudar visibilidade
  useEffect(() => {
    const el = btnRef.current
    if (!el) return
    gsap.to(el, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 16,
      pointerEvents: visible ? 'auto' : 'none',
      duration: 0.35,
      ease: 'power2.out',
    })
  }, [visible])

  const onEnter = () => {
    gsap.to(btnRef.current, { scale: 1.08, duration: 0.2, ease: 'power2.out' })
    gsap.to(labelRef.current, {
      opacity: 1, x: 0, width: 'auto', paddingLeft: 10, paddingRight: 14,
      duration: 0.25, ease: 'power2.out',
    })
  }

  const onLeave = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.22, ease: 'power2.out' })
    gsap.to(labelRef.current, {
      opacity: 0, x: 8, width: 0, paddingLeft: 0, paddingRight: 0,
      duration: 0.2, ease: 'power2.in',
    })
  }

  return (
    <a
      ref={btnRef}
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label="Falar no WhatsApp"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        height: 52,
        borderRadius: 100,
        background: '#25d366',
        boxShadow: '0 4px 24px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.3)',
        opacity: 0,
        transform: 'translateY(16px)',
        pointerEvents: 'none',
        cursor: 'none',
        textDecoration: 'none',
      }}
    >
      {/* Ícone */}
      <div style={{
        width: 52, height: 52, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </div>

      {/* Label expansível */}
      <span
        ref={labelRef}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          width: 0,
          opacity: 0,
          transform: 'translateX(8px)',
        }}
      >
        Falar no WhatsApp
      </span>
    </a>
  )
}
