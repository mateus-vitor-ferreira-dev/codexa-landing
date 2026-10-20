import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A landing sai como site estático (out/), servido pelo Cloudflare Workers. O número de
  // projetos é fixo em src/lib/numeros.ts; o rebuild diário em
  // .github/workflows/rebuild-diario.yml só renova o lastmod do sitemap.
  output: "export",
  // Sem servidor, não há otimização de imagem sob demanda: as imagens saem como estão
  images: { unoptimized: true },
};

export default nextConfig;
