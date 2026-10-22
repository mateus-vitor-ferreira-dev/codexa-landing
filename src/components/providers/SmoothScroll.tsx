'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  /* O ScrollTrigger só recalcula as posições no load e no resize da janela.
     Se a página muda de altura depois (aba com texto maior, imagem tardia,
     Fast Refresh), as entradas e o pin do CTA final ficam fora do lugar e
     sobram telas vazias. Recalcula sempre que a altura do body muda. */
  useEffect(() => {
    let last = document.body.offsetHeight
    let timer = 0
    const ro = new ResizeObserver(() => {
      const h = document.body.offsetHeight
      if (h === last) return
      last = h
      clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    })
    ro.observe(document.body)
    return () => { ro.disconnect(); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    // Smooth scroll só em desktop com mouse — mobile/tablet usam scroll nativo.
    // Com reduced-motion também fica o scroll nativo, sem inércia
    if (typeof window !== 'undefined' && (
      window.innerWidth < 1024 ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )) return

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
