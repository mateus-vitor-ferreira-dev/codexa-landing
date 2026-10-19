import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A landing sai como site estático (out/), servido pelo Cloudflare Workers. O número de
  // projetos vem da API no build; o rebuild diário em .github/workflows/rebuild-diario.yml
  // o mantém atualizado.
  output: "export",
  // Sem servidor, não há otimização de imagem sob demanda: as imagens saem como estão
  images: { unoptimized: true },
};

export default nextConfig;
