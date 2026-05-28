import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://codexa.vercel.app'),
  title: 'Codexa — Soluções digitais sob medida',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
    >
      <body suppressHydrationWarning>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
