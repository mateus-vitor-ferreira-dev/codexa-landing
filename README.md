# codexa-landing

Landing page institucional da Codexa — apresentação de serviços, cases, processo e conversão para briefing.

**Produção:** `https://digitalcodexa.com`

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Hosting | Vercel (auto-deploy) | — |
| Estilo | Tailwind CSS v4 | 4.x |
| Animações | GSAP 3 + ScrollTrigger | 3.x |
| Scroll suave | Lenis | 1.x |
| Motion | Framer Motion | 12.x |
| 3D | Three.js | 0.184.x |
| Analytics | Vercel Analytics + Speed Insights | 2.x |
| Ícones | Lucide React + React Icons | — |

---

## Seções

| Seção | Descrição |
|---|---|
| Hero | Headline principal com animação de entrada |
| Serviços | Sites, sistemas, apps mobile, IA & automação |
| Como Funciona | Processo em etapas da Codexa |
| Cases | Projetos entregues com resultados |
| Stats | Números e métricas da empresa |
| Depoimentos | Social proof de clientes |
| Garantias | Diferenciais e compromissos |
| Manifesto | Posicionamento e valores |
| FAQ | Perguntas frequentes |
| CTA | Conversão para briefing gratuito |

---

## Estrutura

```
app/
├── page.tsx              # Página principal (home)
├── layout.tsx            # Layout raiz com metadados, fontes e providers
├── privacidade/          # Política de privacidade (LGPD)
├── sitemap.ts            # Sitemap dinâmico
├── robots.ts             # robots.txt
└── opengraph-image.tsx   # OG image gerada dinamicamente
```

---

## SEO & Performance

- Schema.org (JSON-LD) para organização e serviços
- Sitemap e robots.txt automáticos via Next.js
- OG image dinâmica via `opengraph-image.tsx`
- Política de privacidade (LGPD)
- Vercel Analytics e Speed Insights integrados

---

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Build de produção
npm run lint     # ESLint
```

---

## Deploy

Push para `main` → deploy automático na Vercel.

Não há branch de staging configurada — use preview deployments da Vercel para testar antes de promover.
