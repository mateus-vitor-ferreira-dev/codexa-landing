import type { MetadataRoute } from 'next'

// Site estático: o arquivo é gerado no build, e o rebuild diário o mantém atualizado
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digitalcodexa.com'
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  }
}
