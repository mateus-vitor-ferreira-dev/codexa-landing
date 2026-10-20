'use client'

import { useEffect } from 'react'
import { contarCliqueWhatsApp } from '@/lib/analytics'

// Hosts dos links de WhatsApp (wa.me e o formato antigo api.whatsapp.com)
const HOSTS_WHATSAPP = new Set(['wa.me', 'api.whatsapp.com'])

/**
 * Escuta cliques no documento inteiro e conta os que vão para o WhatsApp, assim
 * todo link de WhatsApp (inclusive os que vierem a ser criados) entra na contagem
 * sem código em cada componente. A origem vem do data-origem mais próximo do link
 * (no próprio <a> ou num elemento que o contém, como o <footer>).
 */
export function RastreioWhatsApp() {
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      // Clique normal ou com o botão do meio (abrir em nova aba)
      if (e.type === 'auxclick' && e.button !== 1) return
      const alvo = e.target
      if (!(alvo instanceof Element)) return
      const link = alvo.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return
      let host: string
      try { host = new URL(link.href).hostname } catch { return }
      if (!HOSTS_WHATSAPP.has(host)) return
      const origem = link.closest('[data-origem]')?.getAttribute('data-origem') ?? undefined
      contarCliqueWhatsApp(origem)
    }
    document.addEventListener('click', aoClicar, { capture: true })
    document.addEventListener('auxclick', aoClicar, { capture: true })
    return () => {
      document.removeEventListener('click', aoClicar, { capture: true })
      document.removeEventListener('auxclick', aoClicar, { capture: true })
    }
  }, [])

  return null
}
