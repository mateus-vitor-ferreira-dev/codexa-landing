import { PROJECTS } from '@/lib/projetos'

// Números que o site mostra sobre a Codexa. Um lugar só, para a seção "Em números" e o
// rodapé não divergirem. Decisão do dono (issue #23): contar projetos no ar à mão, em vez
// do total do portfólio vindo da API — a lista à mão é o próprio portfólio em lib/projetos.
export const NO_AR = PROJECTS.filter(p => p.liveUrl)
export const PROJETOS_NO_AR = NO_AR.length
