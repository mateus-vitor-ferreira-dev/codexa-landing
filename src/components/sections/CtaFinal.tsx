'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTheme } from '@/context/ThemeContext'
import { Magnetic } from '@/components/fx/Magnetic'
import { ScrambleText } from '@/lib/fx/ScrambleText'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.digitalcodexa.com'
// Mesmo número usado no botão flutuante e na seção de contato
const WA_NUMBER = '5535991722707'

// Monta o link do WhatsApp com o que a pessoa já digitou no formulário
function waLink(nome: string, mensagem: string) {
  const partes = [`Olá! Meu nome é ${nome.trim() || '...'}.`]
  if (mensagem.trim()) partes.push(mensagem.trim())
  else partes.push('Tenho interesse em um projeto.')
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(partes.join('\n\n'))}`
}

// Lê a mensagem de erro da API ({ error: string }); validação do zod vem como objeto
async function mensagemDeErro(res: Response) {
  if (res.status === 429) {
    const segundos = Number(res.headers.get('Retry-After'))
    if (Number.isFinite(segundos) && segundos > 0) {
      const minutos = Math.ceil(segundos / 60)
      return `Muitas tentativas de envio. Tente novamente em ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} ou fale com a gente pelo WhatsApp.`
    }
    return 'Muitas tentativas de envio. Tente novamente mais tarde ou fale com a gente pelo WhatsApp.'
  }
  try {
    const data = await res.json() as { error?: unknown }
    if (typeof data.error === 'string' && data.error.trim()) return data.error
  } catch { /* corpo não é JSON */ }
  if (res.status === 400) return 'Confira os dados do formulário e tente novamente.'
  return 'Algo deu errado. Tente novamente ou fale com a gente pelo WhatsApp.'
}

gsap.registerPlugin(ScrollTrigger)

// Formulário no padrão das seções editoriais: campos em linha (só a borda de baixo),
// rótulos mono numerados e acento só na cor do tema. Rótulos a 60% de branco (~7:1)
const FORM_CSS = `
.form-steps { list-style: none; margin: .5rem 0 0; padding: 1.25rem 0 0; border-top: 1px solid rgba(255,255,255,0.08); display: grid; gap: .7rem; }
.form-steps li { font-family: var(--font-mono); font-size: .78rem; color: var(--text-muted); display: flex; gap: .6rem; }
.form-steps li > span:first-child { color: var(--accent); }
.form-steps em { font-family: var(--font-serif); font-size: 1rem; color: var(--text); line-height: 1; }
.form-ed { display: flex; flex-direction: column; border-top: 1px solid rgba(255,255,255,0.08); }
.form-row-2 { display: grid; grid-template-columns: 1fr; }
@media (min-width: 640px) { .form-row-2 { grid-template-columns: 1fr 1fr; column-gap: 2rem; } }
.form-field { display: flex; flex-direction: column; gap: .35rem; padding-top: 1.5rem; position: relative; }
.form-field label {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
  color: rgba(255,255,255,0.6); display: flex; gap: .75rem;
}
.form-field label span { color: var(--text-faint); transition: color .3s; }
.form-field:focus-within label span { color: var(--accent); }
.form-field input, .form-field textarea {
  width: 100%; background: transparent; border: 0; border-bottom: 1px solid rgba(255,255,255,0.14);
  border-radius: 0; padding: .7rem 0 .8rem; color: var(--text); cursor: auto;
  font-family: var(--font-display); font-size: clamp(1.05rem, 1.4vw, 1.25rem); font-weight: 500; letter-spacing: -0.01em;
  transition: border-color .3s;
}
.form-field textarea { resize: vertical; min-height: 5.5rem; font-family: var(--font-body); font-size: 1rem; line-height: 1.7; }
.form-field input::placeholder, .form-field textarea::placeholder { color: rgba(255,255,255,0.28); }
/* Foco: sublinhado do tema mais grosso no lugar da caixa do outline global */
.form-field input:focus-visible, .form-field textarea:focus-visible { outline: none; border-bottom-color: var(--accent); box-shadow: 0 1px 0 0 var(--accent); }
.form-field[data-error] input { border-bottom-color: #ef4444; }
.form-err { font-family: var(--font-body); font-size: .75rem; color: #ef4444; min-height: 1.25rem; }
.form-fail { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem 1.25rem; padding-top: 1.5rem; }
.form-fail p { margin: 0; font-family: var(--font-body); font-size: .85rem; color: #ef4444; }
.form-fail a {
  display: inline-flex; align-items: center; gap: .55rem; font-family: var(--font-mono); font-size: .8rem;
  color: #25d366; border-bottom: 1px solid rgba(37,211,102,.4); padding: 6px 0; transition: gap .3s;
}
.form-fail a:hover { gap: .85rem; }
.form-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem 2rem; padding-top: 2.25rem; }
.form-submit {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  padding: 16px 34px; border-radius: 100px; border: none;
  background: var(--accent); color: #06060c;
  font-family: var(--font-display); font-size: 1rem; font-weight: 800; letter-spacing: -0.01em;
  transition: opacity .2s;
}
.form-submit:disabled { opacity: .7; cursor: wait; }
.form-note { flex: 1 1 16rem; margin: 0; font-family: var(--font-mono); font-size: .72rem; line-height: 1.6; color: rgba(255,255,255,0.55); }
.form-note a { color: rgba(255,255,255,0.8); text-decoration: underline; }
.form-ok { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2.5rem; }
.form-ok-mark {
  width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; margin-bottom: 1.5rem;
  color: var(--accent); border: 1px solid rgba(var(--accent-rgb),.35);
}
.form-ok-title { font-family: var(--font-serif); font-style: italic; font-size: clamp(2rem, 3.5vw, 2.6rem); line-height: 1.05; color: var(--text); margin: 0 0 .9rem; }
.form-ok-text { font-family: var(--font-body); font-size: 1rem; line-height: 1.8; color: var(--text-muted); max-width: 44ch; margin: 0; }
`

const LINE1 = ['Tem', 'uma', 'ideia?']
const LINE2 = ['Vamos', 'transformar', 'em', 'realidade.']
const ALL_WORDS = [...LINE1, ...LINE2]

export function CtaFinal() {
  const { theme } = useTheme()

  const [form, setForm]     = useState({ nome: '', email: '', whatsapp: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [errors, setErrors] = useState<{ nome?: string; email?: string }>({})
  const [erroEnvio, setErroEnvio] = useState('')

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function validateField(field: 'nome' | 'email', value: string) {
    if (field === 'nome') {
      if (!value.trim()) return 'Nome é obrigatório'
      // Mesma regra da API (z.string().min(2))
      if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
    }
    if (field === 'email') {
      if (!value.trim()) return 'E-mail é obrigatório'
      if (!validateEmail(value)) return 'E-mail inválido'
    }
    return undefined
  }

  function handleBlur(field: 'nome' | 'email') {
    const err = validateField(field, form[field])
    setErrors(prev => ({ ...prev, [field]: err }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nomeErr  = validateField('nome',  form.nome)
    const emailErr = validateField('email', form.email)
    if (nomeErr || emailErr) {
      setErrors({ nome: nomeErr, email: emailErr })
      // Leva o foco ao primeiro campo com erro (o leitor de tela lê a mensagem junto)
      document.getElementById(nomeErr ? 'contato-nome' : 'contato-email')?.focus()
      return
    }
    setStatus('sending')
    setErroEnvio('')
    try {
      const res = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nome: form.nome.trim(), email: form.email.trim() }),
      })
      if (res.ok) {
        setStatus('ok')
        return
      }
      setErroEnvio(await mensagemDeErro(res))
      setStatus('error')
    } catch {
      setErroEnvio('Não foi possível conectar. Verifique sua internet ou fale com a gente pelo WhatsApp.')
      setStatus('error')
    }
  }

  const pinnedRef   = useRef<HTMLElement>(null)
  const ctaRef      = useRef<HTMLElement>(null)
  const bgGlowRef   = useRef<HTMLDivElement>(null)
  const wordsRef    = useRef<(HTMLSpanElement | null)[]>(Array(ALL_WORDS.length).fill(null))
  const headlineRef = useRef<HTMLHeadingElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    // Com reduced-motion: sem pin/scrub nem glow pulsando; tudo já no estado final
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(wordsRef.current.filter(Boolean), { opacity: 1 })
      gsap.set('.cta-sub', { opacity: 1, y: 0 })
      gsap.set('.cta-buttons', { autoAlpha: 1, y: 0 })
    })
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const words = wordsRef.current.filter((el): el is HTMLSpanElement => el !== null)

      /* Gradiente animado contínuo no glow de fundo */
      gsap.to(bgGlowRef.current, {
        opacity: 0.65, scale: 1.15,
        duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })

      gsap.fromTo(headlineRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: pinnedRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Estado inicial da revelação: palavras apagadas e botão oculto.
      // autoAlpha (visibility) tira o botão da ordem de Tab enquanto invisível
      gsap.set(words, { opacity: 0.07 })
      gsap.set('.cta-buttons', { autoAlpha: 0, y: 20 })

      const wordsTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinnedRef.current,
          pin: true,
          anticipatePin: 1,
          start: 'top top',
          end: `+=${ALL_WORDS.length * 240}px`,
          scrub: 1.4,
        },
      })

      wordsTl
        .fromTo(words, { opacity: 0.07 }, { opacity: 1, stagger: { each: 0.3 } })
        .fromTo('.cta-buttons', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3 }, '>')

      gsap.fromTo('.form-h2-line',
        { yPercent: 105 },
        { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } }
      )

      gsap.fromTo('.cta-sub',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
      )

      gsap.to(bgGlowRef.current, {
        y: -60, ease: 'none',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    })
  })

  return (
    <>
      {/* SEÇÃO PINADA — headline reveal word-by-word */}
      <section
        ref={pinnedRef}
        className="relative overflow-hidden"
        style={{
          background: 'transparent',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Grid decorativo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage:
              'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        {/* Título da seção; o min() com 9vw evita cortar "transformar" em telas de 320px */}
        <h2
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(clamp(2.8rem, 7vw, 8rem), 9vw)',
            fontWeight: 'bold',
            lineHeight: 1.05,
            textAlign: 'center',
            userSelect: 'none',
            maxWidth: '1100px',
            padding: '0 clamp(1rem, 5vw, 3rem)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* span em bloco: <h2> só aceita conteúdo inline */}
          <span style={{ display: 'block' }}>
            {LINE1.map((word, i) => (
              <span key={i} style={{ display: 'inline-block', margin: '0 0.12em' }}>
                <span
                  ref={el => { wordsRef.current[i] = el }}
                  style={{ color: '#fff', display: 'inline-block' }}
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
          <span style={{ display: 'block', marginTop: '0.08em' }}>
            {LINE2.map((word, i) => (
              <span key={i} style={{ display: 'inline-block', margin: '0 0.12em' }}>
                <span
                  ref={el => { wordsRef.current[LINE1.length + i] = el }}
                  style={{ color: 'rgba(255,255,255,0.55)', display: 'inline-block' }}
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
        </h2>

        {/* Botão — posicionado na base da seção pinada. Três camadas, cada uma com
            o seu transform: .cta-buttons (faixa centralizada, autoAlpha/y do GSAP),
            Magnetic (x/y do ímã) e o botão (scale do hover). Centralizar com flex
            em vez de translateX(-50%) evita que o GSAP/ímã sobrescrevam o centro. */}
        <div
          className="cta-buttons"
          style={{
            position: 'absolute',
            bottom: 'clamp(48px, 9vh, 88px)',
            left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            padding: '0 16px',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
        <Magnetic strength={0.4} radius={70} max={30} inner=".cta-btn-label" style={{ pointerEvents: 'auto', maxWidth: '100%' }}>
        <button
          type="button"
          data-cursor="ir"
          onClick={() => document.getElementById('form-contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '14px',
            // Tamanho fluido: em 320-414px o botão fixo (432px) saía da tela
            padding: 'clamp(14px, 3vw, 20px) clamp(24px, 6vw, 52px)', borderRadius: '100px',
            maxWidth: '100%',
            background: theme.accent, color: '#06060c',
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 4.5vw, 1.35rem)', fontWeight: 800,
            letterSpacing: '-0.01em', whiteSpace: 'nowrap', border: 'none',
            boxShadow: `0 0 80px rgba(${theme.rgb},0.5), 0 20px 48px rgba(0,0,0,0.4)`,
          }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: `0 0 130px rgba(${theme.rgb},0.7), 0 24px 48px rgba(0,0,0,0.5)`, duration: 0.22 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: `0 0 80px rgba(${theme.rgb},0.5), 0 20px 48px rgba(0,0,0,0.4)`, duration: 0.28 })}
        >
          <span className="cta-btn-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
            Iniciar um Projeto
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M4.5 11h13M13 5l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        </Magnetic>
        </div>
      </section>

      {/* SEÇÃO CTA — formulário no padrão editorial: título à esquerda, campos em linha à direita */}
      <section
        ref={ctaRef}
        id="form-contato"
        className="relative overflow-hidden py-24 lg:py-32"
        style={{ background: 'transparent' }}
      >
        <style>{FORM_CSS}</style>
        {/* Glow sutil com parallax */}
        <div
          ref={bgGlowRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(var(--accent-rgb),0.12) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 page-container grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start">

          {/* Esquerda — título, subtexto e o que acontece depois do envio */}
          <div className="lg:sticky lg:top-32 flex flex-col gap-6">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase mb-4"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
                <ScrambleText text="Formulário" />
              </p>
              <h2 className="font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
                <span className="block overflow-hidden pb-1">
                  <span className="form-h2-line block">Conte a sua</span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <span className="form-h2-line block" style={{ color: 'var(--accent)' }}>ideia.</span>
                </span>
              </h2>
            </div>

            <p className="cta-sub leading-relaxed max-w-sm"
              style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
              Do briefing ao deploy, com metodologia clara,
              comunicação constante e tecnologia que funciona de verdade.
            </p>

            <ul className="cta-sub form-steps">
              <li><span aria-hidden="true">→</span><span>Retorno em <em>até 24h</em></span></li>
              <li><span aria-hidden="true">→</span><span>Briefing inicial <em>gratuito</em></span></li>
              <li><span aria-hidden="true">→</span>Proposta com prazo e valor fechados</li>
            </ul>
          </div>

          {/* Direita — formulário */}
          <div data-orb-avoid="">
            {/* Anuncia o status para leitores de tela; fica sempre no DOM */}
            <p className="sr-only" aria-live="polite">
              {status === 'sending' ? 'Enviando mensagem…'
                : status === 'ok' ? 'Mensagem enviada! Entraremos em contato em breve.'
                : status === 'error' ? (erroEnvio || 'Algo deu errado. Tente novamente ou fale com a gente pelo WhatsApp.')
                : ''}
            </p>
            {status === 'ok' ? (
              <div className="form-ok">
                <span className="form-ok-mark" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <p className="form-ok-title">Mensagem enviada.</p>
                <p className="form-ok-text">
                  Entraremos em contato em breve para dar início ao seu projeto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="form-ed">
                <div className="form-row-2">
                  <div className="form-field" data-error={errors.nome ? '' : undefined}>
                    <label htmlFor="contato-nome"><span aria-hidden="true">01</span>Nome *</label>
                    <input
                      id="contato-nome"
                      name="nome"
                      autoComplete="name"
                      required
                      aria-invalid={!!errors.nome}
                      aria-describedby={errors.nome ? 'contato-nome-erro' : undefined}
                      value={form.nome}
                      onChange={e => { setForm(f => ({ ...f, nome: e.target.value })); if (errors.nome) setErrors(p => ({ ...p, nome: undefined })) }}
                      onBlur={() => handleBlur('nome')}
                      placeholder="Seu nome"
                    />
                    {errors.nome && <span id="contato-nome-erro" className="form-err">{errors.nome}</span>}
                  </div>
                  <div className="form-field" data-error={errors.email ? '' : undefined}>
                    <label htmlFor="contato-email"><span aria-hidden="true">02</span>E-mail *</label>
                    <input
                      id="contato-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'contato-email-erro' : undefined}
                      value={form.email}
                      onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                      onBlur={() => handleBlur('email')}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <span id="contato-email-erro" className="form-err">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="contato-whatsapp"><span aria-hidden="true">03</span>WhatsApp</label>
                  <input
                    id="contato-whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="(35) 9 9999-9999"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contato-mensagem"><span aria-hidden="true">04</span>Sobre o projeto</label>
                  <textarea
                    id="contato-mensagem"
                    name="mensagem"
                    rows={3}
                    value={form.mensagem}
                    onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    placeholder="Descreva brevemente o que você precisa..."
                  />
                </div>

                {status === 'error' && (
                  <div className="form-fail">
                    <p>{erroEnvio || 'Algo deu errado. Tente novamente ou fale com a gente pelo WhatsApp.'}</p>
                    {/* Saída alternativa: leva o que já foi digitado para o WhatsApp */}
                    <a
                      href={waLink(form.nome, form.mensagem)}
                      data-origem="formulario-erro"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chamar no WhatsApp
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                )}

                <div className="form-foot">
                  {/* Ímã no wrapper; o scale do hover fica no botão */}
                  <Magnetic strength={0.2} radius={30} max={8} inner=".cta-submit-label">
                  <button
                    type="submit"
                    className="form-submit"
                    disabled={status === 'sending'}
                    style={{ boxShadow: `0 0 40px rgba(${theme.rgb},0.3)` }}
                    onMouseEnter={e => status !== 'sending' && gsap.to(e.currentTarget, { scale: 1.03, duration: 0.18 })}
                    onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.22 })}
                  >
                    <span className="cta-submit-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    {status === 'sending' ? (
                      <>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar mensagem
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 22 22" fill="none">
                          <path d="M4.5 11h13M13 5l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                    </span>
                  </button>
                  </Magnetic>
                  <p className="form-note">
                    Ao enviar, você concorda com nossa{' '}
                    <a href="/privacidade">Política de Privacidade</a>.
                    Seus dados são usados apenas para retorno do contato.
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

    </>
  )
}
