'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Magnetic } from '@/components/fx/Magnetic'
import { ScrambleText } from '@/lib/fx/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

// wa.me (e não o encurtador w.app): só os links wa.me entram na contagem de cliques
const WA_URL = 'https://wa.me/5535991722707?text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20um%20projeto.'

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

/* ── Índice ─────────────────────────────────────────────────
   No lugar dos cards de giro: um índice editorial de perguntas. Cada
   linha abre a resposta no próprio lugar; no desktop a lista "acende"
   a linha sob o ponteiro e apaga as demais, como em Serviços. */
function Row({ faq, index, open, onToggle }: {
  faq: typeof FAQS[0]; index: number; open: boolean; onToggle: () => void
}) {
  const num = String(index + 1).padStart(2, '0')
  const answerId = `faq-resposta-${num}`

  return (
    <li className="faq-row" data-open={open ? '' : undefined}>
      <h3 className="faq-row-h">
        <button
          type="button"
          className="faq-row-btn"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={onToggle}
          data-cursor={open ? 'fechar' : 'abrir'}
        >
          <span className="faq-row-id" aria-hidden="true">{num}</span>
          <span className="faq-row-q">{faq.q}</span>
          <span className="faq-row-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      {/* grid-template-rows 0fr → 1fr anima a altura sem medir o conteúdo */}
      <div id={answerId} role="region" aria-label={faq.q} className="faq-row-a" aria-hidden={!open}>
        <div className="faq-row-a-inner">
          <p>{faq.a}</p>
        </div>
      </div>
    </li>
  )
}

const CSS = `
.faq-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(255,255,255,0.08); }
.faq-row { border-bottom: 1px solid rgba(255,255,255,0.08); position: relative; }
.faq-row::before {
  content: ''; position: absolute; left: 0; bottom: -1px; height: 1px; width: 100%;
  background: linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb),0) 70%);
  transform: scaleX(0); transform-origin: left; transition: transform .6s cubic-bezier(.2,.8,.2,1);
}
.faq-row[data-open]::before { transform: scaleX(1); }
.faq-row-h { margin: 0; font: inherit; }
.faq-row-btn {
  width: 100%; display: grid; grid-template-columns: 2.75rem 1fr 1.5rem; align-items: baseline;
  gap: 0 1rem; padding: 1.35rem 0; background: none; border: 0; text-align: left; color: inherit;
}
.faq-row-id { font-family: var(--font-mono); font-size: .75rem; letter-spacing: .1em; color: var(--text-faint); transition: color .3s; }
.faq-row-q {
  font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; line-height: 1.25;
  font-size: clamp(1.1rem, 1.6vw, 1.4rem); color: var(--text);
  transition: color .35s, transform .5s cubic-bezier(.2,.8,.2,1), opacity .35s;
}
.faq-row-icon { align-self: center; display: flex; justify-content: flex-end; color: var(--accent); transition: transform .4s cubic-bezier(.2,.8,.2,1); }
.faq-row[data-open] .faq-row-icon { transform: rotate(45deg); }
.faq-row[data-open] .faq-row-id { color: var(--accent); }
.faq-row-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .45s cubic-bezier(.2,.8,.2,1); }
.faq-row[data-open] .faq-row-a { grid-template-rows: 1fr; }
.faq-row-a-inner { overflow: hidden; min-height: 0; }
.faq-row-a p {
  margin: 0; padding: 0 2.5rem 1.6rem 3.75rem; max-width: 62ch;
  font-family: var(--font-body); font-size: .98rem; line-height: 1.8; color: var(--text-muted);
}

@media (min-width: 1024px) {
  .faq-row-btn { padding: 1.55rem 0; }
  /* lista "acende" a linha sob o ponteiro e apaga as outras */
  .faq-list:hover .faq-row:not(:hover):not([data-open]) .faq-row-q { opacity: .32; }
  .faq-row:hover .faq-row-q, .faq-row[data-open] .faq-row-q { transform: translateX(12px); }
  .faq-row:hover .faq-row-id { color: var(--accent); }
}
@media (max-width: 639px) {
  .faq-row-btn { grid-template-columns: 2.25rem 1fr 1.25rem; gap: 0 .75rem; }
  .faq-row-a p { padding: 0 0 1.4rem 3rem; }
}

.faq-wa {
  display: inline-flex; align-items: center; gap: .6rem; font-family: var(--font-mono); font-size: .8rem;
  color: var(--text); border-bottom: 1px solid rgba(var(--accent-rgb),.35); padding: 6px 0;
  transition: gap .3s, border-color .3s, color .3s;
}
.faq-wa:hover { gap: .9rem; border-color: var(--accent); color: var(--accent); }

.faq-num {
  position: absolute; left: -0.4rem; bottom: -3rem; font-family: var(--font-display); font-weight: 800;
  font-size: 11rem; line-height: 1; letter-spacing: -0.06em; color: transparent;
  -webkit-text-stroke: 1px rgba(var(--accent-rgb),0.12); pointer-events: none; user-select: none;
}
@media (prefers-reduced-motion: reduce) {
  .faq-row-a, .faq-row-q, .faq-row-icon, .faq-row::before { transition: none; }
}
`

/* ── Section ───────────────────────────────────────────────── */
export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    // Com reduced-motion: sem entrada, conteúdo já no estado final
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.faq-h2-line',
        { yPercent: 105 },
        { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } }
      )
      gsap.fromTo('.faq-side',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play reverse play reverse' } }
      )
      // Linhas do índice sobem em cascata
      gsap.fromTo('.faq-row',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: '.faq-list', start: 'top 82%', toggleActions: 'play reverse play reverse' } }
      )
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-24 lg:py-36"
      style={{ background: 'transparent', position: 'relative', zIndex: 0 }}
    >
      <style>{CSS}</style>
      <div className="page-container grid grid-cols-1 lg:grid-cols-[0.8fr_1.4fr] gap-12 lg:gap-20 items-start">

        {/* Esquerda — título + CTA (fixa no desktop enquanto a lista rola) */}
        <div className="relative lg:sticky lg:top-32 flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>{'// '}</span>
              <ScrambleText text="Dúvidas" />
            </p>
            <h2 className="font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--text)' }}>
              <span className="block overflow-hidden pb-1">
                <span className="faq-h2-line block">Perguntas</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="faq-h2-line block" style={{ color: 'var(--accent)' }}>frequentes.</span>
              </span>
            </h2>
          </div>

          <div className="faq-side flex flex-col gap-6">
            <p className="leading-relaxed max-w-xs"
              style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-muted)' }}>
              Não encontrou o que precisa? Fale{' '}
              <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>direto</em>{' '}
              com a gente pelo WhatsApp.
            </p>

            <Magnetic strength={0.3} className="self-start">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="faq-wa" data-origem="faq">
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25d366', flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Falar no WhatsApp
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </Magnetic>
          </div>

          {/* Numeral vazado: total de perguntas, só decoração no desktop */}
          <span className="faq-num hidden lg:block" aria-hidden="true">
            {String(FAQS.length).padStart(2, '0')}
          </span>
        </div>

        {/* Direita — índice de perguntas */}
        <ul className="faq-list" data-orb-avoid="">
          {FAQS.map((faq, i) => (
            <Row key={i} faq={faq} index={i} open={open === i} onToggle={() => setOpen(o => (o === i ? null : i))} />
          ))}
        </ul>

      </div>
    </section>
  )
}
