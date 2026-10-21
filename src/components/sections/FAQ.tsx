'use client'

import { useId, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import { GlowLayers } from '@/components/fx/GlowCard'
import { SpotlightGroup } from '@/components/fx/SpotlightGroup'
import { Magnetic } from '@/components/fx/Magnetic'
import { useTilt } from '@/lib/fx/useTilt'
import { ScrambleText } from '@/lib/fx/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

const FAQS = [
  {
    q: 'Qual é o prazo médio de entrega?',
    a: 'Landing pages e sites simples são entregues em 2 a 4 semanas. Sistemas web, SaaS e apps levam de 6 a 16 semanas, com entregas parciais a cada sprint de 2 semanas. Prazos são definidos no contrato antes do início.',
  },
  {
    q: 'Quanto custa um projeto?',
    a: 'Depende do escopo. Landing pages começam a partir de R$ 1.500. Sistemas web completos variam de R$ 5.000 a R$ 20.000+. Enviamos uma proposta detalhada após o briefing — sem surpresas e sem custos ocultos.',
  },
  {
    q: 'O código fica comigo após a entrega?',
    a: 'Sim, 100%. O código-fonte, o domínio e toda a infraestrutura são seus. Sem lock-in, sem taxa de saída. Você pode contratar outro desenvolvedor para dar continuidade a qualquer momento.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: '50% para iniciar o projeto e 50% na entrega final aprovada. Para projetos maiores, parcelas por marco são negociáveis. Aceitamos PIX e transferência bancária.',
  },
  {
    q: 'Vocês oferecem suporte e manutenção?',
    a: '30 dias de suporte pós-entrega estão inclusos em todos os projetos. Após esse período, oferecemos planos de manutenção mensal com SLA definido em contrato.',
  },
  {
    q: 'Posso solicitar mudanças durante o desenvolvimento?',
    a: 'Sim. Ajustes dentro do escopo são absorvidos naturalmente nas sprints. Mudanças que ampliam o escopo são avaliadas e orçadas separadamente, sempre com sua aprovação antes de executar.',
  },
  {
    q: 'Como acompanho o andamento do meu projeto?',
    a: 'Pelo Portal Codexa você acompanha o status em tempo real, aprova entregáveis, abre chamados, acessa faturas e fala direto com a equipe — sem esperar e-mail.',
  },
  {
    q: 'Preciso ter tudo definido antes de começar?',
    a: 'Não. Na maioria dos casos o cliente chega com uma ideia e a gente transforma em escopo. O briefing inicial é gratuito: entendemos o problema, mapeamos as funcionalidades essenciais e só então montamos a proposta com prazo e valor fechados.',
  },
  {
    q: 'Vocês atendem clientes de fora de Lavras?',
    a: 'Sim. Somos de Lavras, MG, mas trabalhamos remotamente com clientes de todo o Brasil. Reuniões por vídeo, entregas acompanhadas em ambiente de homologação e comunicação diária pelo WhatsApp — a distância não muda o processo.',
  },
]

/* ── Flip Card ─────────────────────────────────────────────── */
function FlipCard({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const cardRef   = useRef<HTMLDivElement>(null)
  const innerRef  = useRef<HTMLDivElement>(null)
  const frontRef  = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const uid = useId()
  const questionId = `${uid}-q`
  const answerId   = `${uid}-a`
  // Só a luz segue o ponteiro (rotate: false): o transform é do giro do card
  useTilt(cardRef, { rotate: false })

  const toggle = () => {
    const next = !flipped
    setFlipped(next)
    // Com reduced-motion o giro é instantâneo
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(innerRef.current, {
      rotateY: next ? 180 : 0,
      duration: reduce ? 0 : 0.62,
      ease: 'power2.inOut',
    })
  }

  const onEnter = () => {
    if (flipped) return
    gsap.to(frontRef.current, {
      borderColor: 'rgba(255,255,255,0.22)',
      y: -4,
      duration: 0.22,
      ease: 'power2.out',
    })
  }

  const onLeave = () => {
    if (flipped) return
    gsap.to(frontRef.current, {
      borderColor: 'rgba(255,255,255,0.09)',
      y: 0,
      duration: 0.28,
      ease: 'power2.out',
    })
  }

  const num = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={cardRef}
      data-glow-card=""
      className="faq-card"
      style={{ perspective: '1100px', position: 'relative', height: '100%' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Ghost — dimensiona o card com a altura do conteúdo mais longo (a resposta) */}
      <div aria-hidden style={{
        visibility:    'hidden',
        pointerEvents: 'none',
        padding:       '28px',
        display:       'flex',
        flexDirection: 'column',
        gap:           '10px',
        minHeight:     '250px',
      }}>
        <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{num}</span>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.7 }}>{faq.a}</p>
      </div>

      {/* Inner — rotates (absolute sobre o ghost) */}
      <div
        ref={innerRef}
        style={{
          position:       'absolute',
          inset:          0,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── Front ── (oculta para leitores de tela quando virada) */}
        <div
          ref={frontRef}
          aria-hidden={flipped}
          style={{
            position:           'absolute',
            inset:              0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background:         'var(--bg-elevated)',
            border:             '1px solid rgba(255,255,255,0.09)',
            borderRadius:       '16px',
            padding:            '28px',
            display:            'flex',
            flexDirection:      'column',
            gap:                '12px',
          }}
        >
          <ScrambleText text={num} style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.75rem',
            color:         'var(--accent)',
            letterSpacing: '0.06em',
          }} />
          <h3 id={questionId} style={{
            fontFamily:  'var(--font-display)',
            fontSize:    '1rem',
            fontWeight:  700,
            color:       '#f0f0f6',
            lineHeight:  1.45,
            flex:        1,
            display:     'flex',
            alignItems:  'center',
          }}>
            {faq.q}
          </h3>
          <span aria-hidden style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.75rem',
            color:         'var(--text-faint)',
            letterSpacing: '0.08em',
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '4px',
          }}>
            clique para ver <ArrowRight size={12} strokeWidth={2} aria-hidden />
          </span>
          <GlowLayers ring="1px" />
        </div>

        {/* ── Back ── (oculta para leitores de tela enquanto não virada) */}
        <div
          id={answerId}
          aria-hidden={!flipped}
          style={{
            position:           'absolute',
            inset:              0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform:          'rotateY(180deg)',
            background:         'linear-gradient(145deg, rgba(var(--accent-rgb),0.07) 0%, var(--bg-elevated) 55%)',
            border:             '1px solid rgba(var(--accent-rgb),0.25)',
            borderRadius:       '16px',
            padding:            '24px',
            display:            'flex',
            flexDirection:      'column',
            gap:                '10px',
            overflow:           'auto',
          }}
        >
          <span style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.75rem',
            color:         'var(--accent)',
            letterSpacing: '0.06em',
          }}>
            {num}
          </span>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '0.85rem',
            color:      'var(--text-muted)',
            lineHeight: 1.7,
            flex:       1,
          }}>
            {faq.a}
          </p>
          {/* Virado, o giro do card (180°) e o da face (180°) se anulam: x local = x da tela */}
          <GlowLayers ring="1px" />
        </div>
      </div>

      {/* Botão sobre o card inteiro — foco por teclado, Enter/Espaço e estado para leitores de tela */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={flipped}
        aria-controls={answerId}
        aria-labelledby={questionId}
        data-cursor={flipped ? 'voltar' : 'virar'}
        style={{
          position:     'absolute',
          inset:        0,
          zIndex:       2,
          background:   'transparent',
          border:       'none',
          borderRadius: '16px',
          padding:      0,
        }}
      />
    </div>
  )
}

/* ── Section ───────────────────────────────────────────────── */
export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    // Com reduced-motion: sem entrada, conteúdo já no estado final
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.faq-heading',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play reverse play reverse',
          },
        }
      )

      gsap.fromTo('.faq-card',
        { opacity: 0, y: 28, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 76%',
            toggleActions: 'play reverse play reverse',
          },
        }
      )
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="faq"
      style={{ background: 'transparent', position: 'relative', zIndex: 0, paddingTop: '10rem', paddingBottom: '8rem' }}
    >
      <div className="page-container flex flex-col lg:flex-row gap-20 lg:gap-32">

        {/* Left — heading + CTA */}
        <div className="faq-heading flex flex-col gap-6 lg:w-80 flex-shrink-0 self-start">

          <div style={{ width: '32px', height: '2px', background: 'var(--accent)', borderRadius: '2px' }} />

          <h2
            className="font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)' }}
          >
            Perguntas<br />
            <span style={{ color: 'var(--accent)' }}>frequentes.</span>
          </h2>

          <p
            className="leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-muted)' }}
          >
            Não encontrou o que precisa?<br />Fale diretamente pelo WhatsApp.
          </p>

          {/* WhatsApp CTA */}
          <Magnetic strength={0.3} className="self-start">
          <a
            href="https://w.app/codexa"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   '0.9rem',
              fontWeight: 700,
              color:      '#fff',
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
              e.currentTarget.style.background   = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.background   = 'rgba(255,255,255,0.05)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25d366', flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Falar no WhatsApp
          </a>
          </Magnetic>


</div>

        {/* Right — flip cards */}
        <SpotlightGroup
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 flex-1"
          radius={340}
          style={{
            gap:           '14px',
            gridAutoRows:  '1fr',
            alignItems:    'stretch',
            marginTop:     '3.5rem',
          }}
        >
          {FAQS.map((faq, i) => (
            <FlipCard key={i} faq={faq} index={i} />
          ))}
        </SpotlightGroup>

      </div>
    </section>
  )
}
