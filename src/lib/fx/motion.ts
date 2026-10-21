'use client'

import { useSyncExternalStore } from 'react'

/* Base compartilhada dos efeitos interativos: preferência de movimento,
   tipo de ponteiro e a posição do ponteiro (mouse ou dedo) num só lugar,
   para o fundo, a esfera e os cards lerem o mesmo estado sem cada um
   registrar seus próprios listeners. */

const REDUCED = '(prefers-reduced-motion: reduce)'
const FINE    = '(pointer: fine)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED).matches

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia(FINE).matches

function subscribeQuery(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }
}

const subscribeReduced = subscribeQuery(REDUCED)
const subscribeFine    = subscribeQuery(FINE)

/** true quando o visitante pediu menos movimento (no SSR assume false) */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, prefersReducedMotion, () => false)
}

/** true com mouse/trackpad; false no toque */
export function useFinePointer() {
  return useSyncExternalStore(subscribeFine, isFinePointer, () => false)
}

/* ── Ponteiro global ─────────────────────────────────────────
   x/y em pixels da viewport; nx/ny normalizados em -1..1 (y para cima,
   como no WebGL); vx/vy é a velocidade suavizada em px/frame.
   active fica false quando o ponteiro sai da janela ou o dedo solta. */
export interface PointerState {
  x: number; y: number
  nx: number; ny: number
  vx: number; vy: number
  active: boolean
  /** timestamp (performance.now) do último clique/toque — para pulsos */
  lastPress: number
}

export const pointer: PointerState = {
  x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0, active: false, lastPress: -Infinity,
}

let listening = 0
let lastX = 0, lastY = 0

function onMove(e: PointerEvent) {
  const W = window.innerWidth, H = window.innerHeight
  pointer.vx = pointer.vx * 0.8 + (e.clientX - lastX) * 0.2
  pointer.vy = pointer.vy * 0.8 + (e.clientY - lastY) * 0.2
  lastX = e.clientX; lastY = e.clientY
  pointer.x  = e.clientX
  pointer.y  = e.clientY
  pointer.nx = (e.clientX / W) * 2 - 1
  pointer.ny = -((e.clientY / H) * 2 - 1)
  pointer.active = true
}
function onDown(e: PointerEvent) { onMove(e); pointer.lastPress = performance.now() }
function onLeave() { pointer.active = false }
function onUp(e: PointerEvent) { if (e.pointerType !== 'mouse') pointer.active = false }

/** Liga os listeners do ponteiro global (contagem de referência). Devolve o cleanup. */
export function trackPointer() {
  if (listening++ === 0) {
    window.addEventListener('pointermove',  onMove, { passive: true })
    window.addEventListener('pointerdown',  onDown, { passive: true })
    window.addEventListener('pointerup',    onUp,   { passive: true })
    window.addEventListener('pointercancel', onLeave, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
  }
  return () => {
    if (--listening === 0) {
      window.removeEventListener('pointermove',  onMove)
      window.removeEventListener('pointerdown',  onDown)
      window.removeEventListener('pointerup',    onUp)
      window.removeEventListener('pointercancel', onLeave)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }
}

/* ── Cena atual ──────────────────────────────────────────────
   O fundo publica qual seção domina a tela (id da <section>) e o
   progresso dentro dela; a esfera viajante e outros efeitos assinam. */
export interface SceneState { id: string; progress: number }
type SceneListener = (s: SceneState) => void

const sceneListeners = new Set<SceneListener>()
export let currentScene: SceneState = { id: 'hero', progress: 0 }

export function publishScene(s: SceneState) {
  if (s.id === currentScene.id && Math.abs(s.progress - currentScene.progress) < 0.001) return
  currentScene = s
  sceneListeners.forEach(l => l(s))
}

export function onScene(l: SceneListener) {
  sceneListeners.add(l)
  l(currentScene)
  return () => { sceneListeners.delete(l) }
}

/** Loop de animação que pausa com a aba oculta. Devolve o cleanup. */
export function rafLoop(tick: (t: number, dt: number) => void) {
  let id = 0, last = performance.now(), running = true
  const frame = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    tick(t, dt)
    id = requestAnimationFrame(frame)
  }
  const onVis = () => {
    if (document.hidden) { cancelAnimationFrame(id); running = false }
    else if (!running)   { running = true; last = performance.now(); id = requestAnimationFrame(frame) }
  }
  id = requestAnimationFrame(frame)
  document.addEventListener('visibilitychange', onVis)
  return () => { cancelAnimationFrame(id); document.removeEventListener('visibilitychange', onVis) }
}
