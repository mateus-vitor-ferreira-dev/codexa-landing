'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const CONFIG = {
  POINT_COUNT:         180,
  RADIUS:              1.3,
  MAX_LINE_DIST:       0.55,
  PULSE_COUNT:         4,
  CYAN:                0x4dd8e0,
  MOUSE_SENSITIVITY_X: Math.PI * 0.4,
  MOUSE_SENSITIVITY_Y: Math.PI * 0.8,
  LERP_FACTOR:         0.06,
  IDLE_TIMEOUT_SEC:    2,
} as const

function makePointTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0,   'rgba(255,255,255,1)')
  grad.addColorStop(0.4, 'rgba(77,216,224,0.8)')
  grad.addColorStop(1,   'rgba(77,216,224,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function buildSpherePoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < CONFIG.POINT_COUNT; i++) {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / CONFIG.POINT_COUNT)
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
    pts.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * CONFIG.RADIUS,
      Math.sin(phi) * Math.sin(theta) * CONFIG.RADIUS,
      Math.cos(phi)                   * CONFIG.RADIUS,
    ))
  }
  return pts
}

export default function Orb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas || !container) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Scene ────────────────────────────────────────────────────
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 3.2

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const setSize = () => {
      const s = Math.min(container.clientWidth, container.clientHeight)
      renderer.setSize(s, s, false)
      camera.aspect = 1
      camera.updateProjectionMatrix()
    }
    setSize()

    // ── Fibonacci sphere points ──────────────────────────────────
    const points = buildSpherePoints()

    // Points cloud
    const ptGeom  = new THREE.BufferGeometry()
    const ptPos   = new Float32Array(CONFIG.POINT_COUNT * 3)
    points.forEach((p, i) => { ptPos[i*3]=p.x; ptPos[i*3+1]=p.y; ptPos[i*3+2]=p.z })
    ptGeom.setAttribute('position', new THREE.BufferAttribute(ptPos, 3))

    const ptTex  = makePointTexture()
    const ptMat  = new THREE.PointsMaterial({
      size: 0.06, map: ptTex, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff,
    })
    const ptCloud = new THREE.Points(ptGeom, ptMat)

    // Line segments between close points
    const linePos: number[] = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < CONFIG.MAX_LINE_DIST) {
          linePos.push(points[i].x, points[i].y, points[i].z,
                       points[j].x, points[j].y, points[j].z)
        }
      }
    }
    const lineGeom = new THREE.BufferGeometry()
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: CONFIG.CYAN, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const lines = new THREE.LineSegments(lineGeom, lineMat)

    // Inner core sphere
    const coreGeom = new THREE.SphereGeometry(0.4, 32, 32)
    const coreMat  = new THREE.MeshBasicMaterial({
      color: CONFIG.CYAN, transparent: true, opacity: 0.04,
      blending: THREE.AdditiveBlending,
    })
    const core = new THREE.Mesh(coreGeom, coreMat)

    // Orb group (points + lines + core rotate together)
    const orb = new THREE.Group()
    orb.add(ptCloud, lines, core)
    scene.add(orb)

    // ── Pulses ───────────────────────────────────────────────────
    interface Pulse {
      mesh:     THREE.Mesh
      geom:     THREE.SphereGeometry
      mat:      THREE.MeshBasicMaterial
      start:    THREE.Vector3
      end:      THREE.Vector3
      progress: number
      speed:    number
    }

    const pulses: Pulse[] = []
    const pulseMeshGeom = new THREE.SphereGeometry(0.04, 12, 12)

    for (let i = 0; i < CONFIG.PULSE_COUNT; i++) {
      const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      const mesh = new THREE.Mesh(pulseMeshGeom, mat)
      scene.add(mesh)
      pulses.push({
        mesh, mat,
        geom:     pulseMeshGeom,
        start:    points[Math.floor(Math.random() * points.length)].clone(),
        end:      points[Math.floor(Math.random() * points.length)].clone(),
        progress: Math.random(),
        speed:    0.005 + Math.random() * 0.005,
      })
    }

    // ── Mouse tracking ───────────────────────────────────────────
    let targetRotX       = 0
    let targetRotY       = 0
    let hasMouseMoved    = false
    let lastMouseMoveTime = 0

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth)  * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      targetRotY       = nx * CONFIG.MOUSE_SENSITIVITY_Y
      targetRotX       = ny * CONFIG.MOUSE_SENSITIVITY_X
      hasMouseMoved    = true
      lastMouseMoveTime = performance.now()
    }

    if (!reduced) window.addEventListener('mousemove', onMouseMove)

    // ── Resize ───────────────────────────────────────────────────
    const ro = new ResizeObserver(setSize)
    ro.observe(container)

    // ── Render loop ──────────────────────────────────────────────
    const clock = new THREE.Clock()
    let raf     = 0
    let visible = true

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.1 })
    io.observe(canvas)

    if (reduced) {
      // Single static frame
      orb.rotation.y = 0.4
      renderer.render(scene, camera)
    } else {
      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!visible) return

        const elapsed  = clock.getElapsedTime()
        const now      = performance.now()
        const idleTime = (now - lastMouseMoveTime) / 1000

        orb.rotation.y += (targetRotY - orb.rotation.y) * CONFIG.LERP_FACTOR
        orb.rotation.x += (targetRotX - orb.rotation.x) * CONFIG.LERP_FACTOR

        if (!hasMouseMoved || idleTime > CONFIG.IDLE_TIMEOUT_SEC) {
          const factor = hasMouseMoved ? Math.min((idleTime - CONFIG.IDLE_TIMEOUT_SEC) / 1.5, 1) : 1
          targetRotY += 0.002 * factor
        }

        orb.rotation.z = Math.sin(elapsed * 0.3) * 0.05
        coreMat.opacity = 0.04 + Math.sin(elapsed * 1.5) * 0.02

        // Update pulses
        for (const p of pulses) {
          p.progress += p.speed
          if (p.progress >= 1) {
            p.start.copy(p.end)
            p.end.copy(points[Math.floor(Math.random() * points.length)])
            p.progress = 0
          }
          const pos = p.start.clone().lerp(p.end, p.progress)
          pos.normalize().multiplyScalar(CONFIG.RADIUS)
          p.mesh.position.copy(pos).applyEuler(orb.rotation)

          const fade = Math.sin(p.progress * Math.PI)
          p.mat.opacity = fade * 0.9
          p.mesh.scale.setScalar(0.5 + fade * 0.5)
        }

        renderer.render(scene, camera)
      }
      animate()
    }

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('mousemove', onMouseMove)

      ptGeom.dispose();   ptMat.dispose();   ptTex.dispose()
      lineGeom.dispose(); lineMat.dispose()
      coreGeom.dispose(); coreMat.dispose()
      pulseMeshGeom.dispose()
      for (const p of pulses) p.mat.dispose()

      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto lg:mx-0">
      {/* Glow */}
      <div
        className="absolute inset-[10%] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(77,216,224,0.18) 0%, transparent 60%)',
          filter: 'blur(40px)',
          animation: 'glowPulse 4s ease-in-out infinite',
        }}
      />

      <canvas ref={canvasRef} className="relative w-full h-full" />

      {/* Label */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] tracking-[3px] uppercase whitespace-nowrap"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: '#4dd8e0', boxShadow: '0 0 8px #4dd8e0', animation: 'glowPulse 2s ease-in-out infinite' }}
        />
        Núcleo · processando
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
