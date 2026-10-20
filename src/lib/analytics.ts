// Token do Cloudflare Web Analytics (o beacon só entra na página quando ele existe).
// Onde pegar: painel do Cloudflare → Web Analytics → Add site → digitalcodexa.com →
// copiar o "token" do snippet (o valor dentro de data-cf-beacon). Não é segredo: vai
// no HTML de qualquer forma. Vazio = sem beacon.
export const CF_WEB_ANALYTICS_TOKEN = ''

// Endpoint da API que conta conversões (POST público, sem dado pessoal)
const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.digitalcodexa.com'
export const URL_EVENTOS = `${API}/eventos`

/**
 * Conta um clique em link de WhatsApp. Não espera resposta nem atrasa a navegação,
 * e qualquer falha (API fora, bloqueador, navegador antigo) é ignorada.
 *
 * O Blob vai como text/plain de propósito: com application/json o navegador exigiria
 * preflight (OPTIONS), que o sendBeacon não faz. A API lê o corpo como texto com JSON.
 */
export function contarCliqueWhatsApp(origem?: string) {
  try {
    const corpo = JSON.stringify(origem ? { tipo: 'whatsapp_click', origem } : { tipo: 'whatsapp_click' })
    if (navigator.sendBeacon?.(URL_EVENTOS, new Blob([corpo], { type: 'text/plain' }))) return
    // Sem sendBeacon (ou fila cheia): fetch com keepalive sobrevive à troca de página
    fetch(URL_EVENTOS, {
      method: 'POST', body: corpo, keepalive: true, mode: 'no-cors', credentials: 'omit',
      headers: { 'Content-Type': 'text/plain' },
    }).catch(() => {})
  } catch { /* contagem é opcional */ }
}
