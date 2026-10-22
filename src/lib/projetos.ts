// Portfólio: usado pelos cases e pela contagem de projetos no ar
export interface Project {
  id:         string
  title:      string
  subtitle:   string
  type:       string
  desc:       string
  tags:       string[]
  accent:     string
  preview:    string
  preview2?:  string   // segunda imagem para alternância de tema
  liveUrl?:   string   // sem URL: projeto entregue que não está mais no ar
  displayUrl: string
  status:     string
}

export const PROJECTS: Project[] = [
  {
    id:         '01',
    title:      'M.O.B Burger',
    subtitle:   'Web App',
    type:       'Sistema de Pedidos',
    desc:       'O M.O.B deixou de depender de apps de delivery e passou a receber pedidos direto — sem pagar comissão. Sistema com PIX, cartão e painel em tempo real para a cozinha.',
    tags:       ['Next.js', 'Stripe', 'PostgreSQL', 'Railway'],
    accent:     '#FF4500',
    preview:    '/cases/mob-burger-web/preview.webp',
    liveUrl:    'https://pedidos.mobburger.digitalcodexa.com',
    displayUrl: 'pedidos.mobburger.digitalcodexa.com',
    status:     'Em produção',
  },
  {
    id:         '02',
    title:      'M.O.B Burger',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Uma página que vende antes mesmo do cliente terminar de rolar. Animações, galeria de produtos e CTA direto para o pedido — tudo pensado para converter visitante em cliente.',
    tags:       ['Next.js', 'GSAP', 'Tailwind', 'Cloudflare'],
    accent:     '#FFB000',
    preview:    '/cases/mob-burger-landing/preview.webp',
    liveUrl:    'https://mobburger.digitalcodexa.com',
    displayUrl: 'mobburger.digitalcodexa.com',
    status:     'No ar',
  },
  {
    id:         '03',
    title:      'Mel & Afeto Açaí',
    subtitle:   'Cardápio Digital',
    type:       'Cardápio Digital',
    desc:       'O cliente monta o açaí do jeito que gosta — copo, cremes e adicionais — e o pedido chega pronto no WhatsApp da loja, com o total já calculado. Preços e itens mudam pelo painel da própria loja.',
    tags:       ['Next.js', 'Cloudflare', 'WhatsApp', 'Painel da loja'],
    accent:     '#d4a238',
    preview:    '/cases/mel-afeto-cardapio/preview.webp',
    liveUrl:    'https://mel-afeto-cardapio.desenvolvedoracodexa.workers.dev',
    displayUrl: 'mel-afeto-cardapio.desenvolvedoracodexa.workers.dev',
    status:     'No ar',
  },
  {
    id:         '04',
    title:      'Festário',
    subtitle:   'Plataforma',
    type:       'SaaS — Reservas',
    desc:       'Salões de festa num lugar só: o cliente compara espaços, vê a agenda e reserva a data com a mesma conta. O dono do salão acompanha reservas e pagamentos num único painel — sem planilha e sem vai-e-vem de mensagens.',
    tags:       ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    accent:     '#a5b0f5',
    preview:    '/cases/festario-web/preview-light.webp',
    preview2:   '/cases/festario-web/preview-dark.webp',
    liveUrl:    'https://recanto-vila-rica.vercel.app',
    displayUrl: 'recanto-vila-rica.vercel.app',
    status:     'Em produção',
  },
  {
    id:         '05',
    title:      'Festário',
    subtitle:   'Landing do salão',
    type:       'Landing Page',
    desc:       'A página do Recanto Vila Rica, primeiro salão do Festário. Quem chega vê o espaço, consulta preços e já segue para a reserva — sem precisar ligar.',
    tags:       ['Next.js', 'GSAP', 'Tailwind', 'Vercel'],
    accent:     '#a5b0f5',
    preview:    '/cases/recanto-landing/preview.webp',
    liveUrl:    'https://recanto-vila-rica-landing.vercel.app',
    displayUrl: 'recanto-vila-rica-landing.vercel.app',
    status:     'No ar',
  },
  {
    id:         '06',
    title:      'Só+1',
    subtitle:   'Plataforma',
    type:       'SaaS — Esporte',
    desc:       'Achar jogo deixou de depender do grupo do WhatsApp. O jogador entra em uma partida aberta com um clique, vê vagas, local e valor na hora — em 12 modalidades diferentes.',
    tags:       ['React + Vite', 'Login com Google', 'Painel do jogador', 'Vercel'],
    accent:     '#22c55e',
    preview:    '/cases/somaisum-app/preview.webp',
    liveUrl:    'https://app.so-mais-um.com',
    displayUrl: 'app.so-mais-um.com',
    status:     'Em produção',
  },
  {
    id:         '07',
    title:      'Só+1',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'A página explica o produto em segundos e leva o jogador direto para o cadastro. Base de usuários construída antes mesmo da plataforma abrir oficialmente.',
    tags:       ['Next.js', 'Tailwind', 'SEO', 'Vercel'],
    accent:     '#22c55e',
    preview:    '/cases/somaisum-landing/preview.webp',
    liveUrl:    'https://so-mais-um.com',
    displayUrl: 'so-mais-um.com',
    status:     'No ar',
  },
  {
    id:         '08',
    title:      'MDMJ Transportes',
    subtitle:   'Landing Page',
    type:       'Landing Page',
    desc:       'Quem compra em BH descobre em segundos que a MDMJ busca a carga e entrega em Lavras. O orçamento sai direto no WhatsApp, e páginas por cidade capturam quem procura frete no Google.',
    tags:       ['Next.js', 'SEO local', 'WhatsApp', 'Vercel'],
    accent:     '#f97316',
    preview:    '/cases/mdmj-landing/preview.webp',
    liveUrl:    'https://mdmjtransportes.com.br',
    displayUrl: 'mdmjtransportes.com.br',
    status:     'No ar',
  },
  {
    id:         '09',
    title:      'MDMJ Transportes',
    subtitle:   'Portal do Cliente',
    type:       'Sistema Web',
    desc:       'Painel de gestão da transportadora com acompanhamento de pedidos pelo cliente. Quem despachou consulta o status do frete sem precisar ligar para a empresa.',
    tags:       ['Next.js', 'Login com Google', 'Painel de gestão', 'Vercel'],
    accent:     '#f97316',
    preview:    '/cases/mdmj-app/preview.webp',
    liveUrl:    'https://app.mdmjtransportes.com.br',
    displayUrl: 'app.mdmjtransportes.com.br',
    status:     'Em produção',
  },
]
