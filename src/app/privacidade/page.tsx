import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a Codexa coleta, usa e protege seus dados pessoais.',
}

const UPDATED = '2 de junho de 2026'

export default function PrivacidadePage() {
  const s = {
    h2: { fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '0.5rem' } as React.CSSProperties,
    p:  { fontSize: '0.93rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.75rem' } as React.CSSProperties,
    li: { fontSize: '0.93rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.25rem', marginLeft: '1.25rem', listStyleType: 'disc' } as React.CSSProperties,
  }

  return (
    <div style={{ background: '#09090b', minHeight: '100dvh', color: '#f4f4f5', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 120px' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', color: '#71717a', fontFamily: 'var(--font-mono)', textDecoration: 'none', marginBottom: '40px' }}>
          ← Voltar
        </Link>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: '#f4f4f5', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Política de Privacidade
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#52525b', fontFamily: 'var(--font-mono)', marginBottom: '3rem' }}>
          Última atualização: {UPDATED}
        </p>

        <h2 style={s.h2}>1. Quem somos</h2>
        <p style={s.p}>
          A <strong style={{ color: '#f4f4f5' }}>Codexa</strong> é uma empresa de desenvolvimento de software sediada em Lavras, MG.
          Nosso site é <strong style={{ color: '#f4f4f5' }}>digitalcodexa.com</strong> e nossa equipe pode ser contatada em <a href="mailto:contato@digitalcodexa.com" style={{ color: '#00d6f5', textDecoration: 'none' }}>contato@digitalcodexa.com</a>.
        </p>

        <h2 style={s.h2}>2. Dados que coletamos</h2>
        <p style={s.p}>Ao preencher o formulário de contato, coletamos:</p>
        <ul style={{ margin: '0 0 0.75rem' }}>
          <li style={s.li}><strong style={{ color: '#f4f4f5' }}>Nome</strong> — para identificação e comunicação.</li>
          <li style={s.li}><strong style={{ color: '#f4f4f5' }}>E-mail</strong> — para envio de proposta e comunicações relacionadas ao projeto.</li>
          <li style={s.li}><strong style={{ color: '#f4f4f5' }}>WhatsApp</strong> (opcional) — para contato mais rápido se preferir.</li>
          <li style={s.li}><strong style={{ color: '#f4f4f5' }}>Mensagem</strong> — para entender sua necessidade antes do briefing.</li>
        </ul>

        <h2 style={s.h2}>3. Como usamos seus dados</h2>
        <p style={s.p}>Utilizamos suas informações exclusivamente para:</p>
        <ul style={{ margin: '0 0 0.75rem' }}>
          <li style={s.li}>Responder ao seu contato e enviar proposta comercial.</li>
          <li style={s.li}>Agendar conversas sobre o projeto.</li>
          <li style={s.li}>Comunicações relacionadas ao desenvolvimento do projeto, caso contratado.</li>
        </ul>
        <p style={s.p}><strong style={{ color: '#f4f4f5' }}>Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins de marketing.</strong></p>

        <h2 style={s.h2}>4. Base legal (LGPD)</h2>
        <p style={s.p}>
          O tratamento dos dados coletados pelo formulário é realizado com base no <strong style={{ color: '#f4f4f5' }}>legítimo interesse</strong> (Art. 7º, IX da Lei 13.709/2018) para responder à sua solicitação de contato comercial,
          e no seu <strong style={{ color: '#f4f4f5' }}>consentimento</strong> implícito ao preencher e enviar o formulário.
        </p>

        <h2 style={s.h2}>5. Retenção dos dados</h2>
        <p style={s.p}>
          Seus dados são mantidos enquanto houver interesse comercial ativo ou pelo tempo necessário para cumprir obrigações legais.
          Se não houver contrato firmado, os dados são excluídos em até 12 meses após o último contato.
        </p>

        <h2 style={s.h2}>6. Seus direitos</h2>
        <p style={s.p}>Nos termos da LGPD, você tem direito a:</p>
        <ul style={{ margin: '0 0 0.75rem' }}>
          <li style={s.li}>Confirmar se tratamos seus dados.</li>
          <li style={s.li}>Acessar, corrigir ou excluir seus dados.</li>
          <li style={s.li}>Revogar o consentimento a qualquer momento.</li>
          <li style={s.li}>Solicitar portabilidade dos seus dados.</li>
        </ul>
        <p style={s.p}>
          Para exercer esses direitos, envie um e-mail para <a href="mailto:contato@digitalcodexa.com" style={{ color: '#00d6f5', textDecoration: 'none' }}>contato@digitalcodexa.com</a>.
        </p>

        <h2 style={s.h2}>7. Segurança</h2>
        <p style={s.p}>
          Os dados são armazenados em banco de dados hospedado na infraestrutura Cloudflare (D1), com acesso restrito e autenticação por token JWT.
          A comunicação é realizada exclusivamente via HTTPS.
        </p>

        <h2 style={s.h2}>8. Cookies</h2>
        <p style={s.p}>
          Este site não utiliza cookies de rastreamento ou publicidade. Utilizamos apenas cookies de sessão necessários para o funcionamento do portal do cliente (<strong style={{ color: '#f4f4f5' }}>digitalcodexa.com/client</strong>).
        </p>

        <h2 style={s.h2}>9. Contato</h2>
        <p style={s.p}>
          Dúvidas sobre esta política? Entre em contato: <a href="mailto:contato@digitalcodexa.com" style={{ color: '#00d6f5', textDecoration: 'none' }}>contato@digitalcodexa.com</a>
        </p>

      </div>
    </div>
  )
}
