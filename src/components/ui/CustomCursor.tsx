'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMove = (e: MouseEvent) => {
      gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'none' })
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' })
    }

    const onEnterLink = () => {
      gsap.to(ring, { scale: 1.6, borderColor: '#00d6f5', duration: 0.2 })
      gsap.to(dot,  { scale: 0,   duration: 0.2 })
    }

    const onLeaveLink = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(0,214,245,0.5)', duration: 0.2 })
      gsap.to(dot,  { scale: 1, duration: 0.2 })
    }

    window.addEventListener('mousemove', onMove)

    const links = document.querySelectorAll('a, button, [data-cursor]')
    links.forEach(el => {
      el.addEventListener('mouseenter', onEnterLink)
      el.addEventListener('mouseleave', onLeaveLink)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      links.forEach(el => {
        el.removeEventListener('mouseenter', onEnterLink)
        el.removeEventListener('mouseleave', onLeaveLink)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[10000]"
        style={{ background: '#00d6f5', transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999]"
        style={{
          border: '1px solid rgba(0,214,245,0.5)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  )
}
