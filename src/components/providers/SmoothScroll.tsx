'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration:    1.2,
      easing:      (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Fica parado enquanto o preloader roda
    lenis.stop()

    const onStart = () => lenis.start()
    const onStop  = () => lenis.stop()
    window.addEventListener('lenis-start', onStart)
    window.addEventListener('lenis-stop',  onStop)

    lenis.on('scroll', ScrollTrigger.update)

    const rafCb = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(rafCb)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(rafCb)
      window.removeEventListener('lenis-start', onStart)
      window.removeEventListener('lenis-stop',  onStop)
    }
  }, [])

  return <>{children}</>
}
