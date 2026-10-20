import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google'
import { SmoothScroll }  from '@/components/providers/SmoothScroll'
import { ThemeProvider } from '@/context/ThemeContext'
import { Analytics }     from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digitalcodexa.com'

// O canonical fica em cada página (home em page.tsx, /privacidade na própria pasta):
// declarado aqui, ele seria herdado por toda página nova apontando para a home.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/icon.png', apple: '/icon.png' },
  // Páginas internas definem só o próprio título; a marca entra pelo template
  title: {
    default: 'Codexa — Soluções digitais sob medida',
    template: '%s | Codexa',
  },
  description:
    'Desenvolvemos sites, sistemas web, apps e automações com IA para empresas em Lavras, MG e em todo o Brasil.',
  openGraph: {
    title: 'Codexa — Soluções digitais sob medida',
    description:
      'Desenvolvemos sites, sistemas web, apps e automações com IA para empresas em Lavras, MG e em todo o Brasil.',
    url: '/',
    siteName: 'Codexa',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codexa — Soluções digitais sob medida',
    description:
      'Desenvolvemos sites, sistemas web, apps e automações com IA para empresas em Lavras, MG e em todo o Brasil.',
  },
}

// Dados estruturados da empresa. Telefone, e-mail e redes são os mesmos que o site
// mostra (WhatsApp, rodapé e seção de contato): se mudarem lá, mudar aqui também.
const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#empresa`,
  name: 'Codexa',
  description: 'Desenvolvemos sites, sistemas web, apps e automações com IA para empresas em Lavras, MG e em todo o Brasil.',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/opengraph-image`,
  email: 'contato@digitalcodexa.com',
  telephone: '+55 35 99746-0058',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lavras',
    addressRegion: 'MG',
    addressCountry: 'BR',
  },
  sameAs: [
    'https://www.instagram.com/desenvolvedoracodexa/',
    'https://linkedin.com/in/mateus-vitor-ferreira-dev',
    'https://github.com/mateus-vitor-ferreira-dev',
  ],
  areaServed: ['Lavras, MG', 'Brasil'],
  serviceType: ['Desenvolvimento web', 'Aplicativos móveis', 'Automação', 'Sistemas SaaS'],
  priceRange: '$$',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
    >
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
