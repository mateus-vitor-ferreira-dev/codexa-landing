import { Navbar }          from '@/components/layout/Navbar'
import { Hero }            from '@/components/sections/Hero'
import { Manifesto }       from '@/components/sections/Manifesto'
import { PromisesMarquee } from '@/components/sections/PromisesMarquee'
import { Stats }           from '@/components/sections/Stats'
import { Services }      from '@/components/sections/Services'
import { HowItWorks }    from '@/components/sections/HowItWorks'
import { Cases }         from '@/components/sections/Cases'
import { Testimonials }  from '@/components/sections/Testimonials'
import { FAQ }           from '@/components/sections/FAQ'
import { Guarantees }    from '@/components/sections/Guarantees'
import { CtaFinal }      from '@/components/sections/CtaFinal'
import { CustomCursor }   from '@/components/ui/CustomCursor'
import { ColorSwitcher }  from '@/components/ui/ColorSwitcher'
import { Preloader }      from '@/components/ui/Preloader'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { SectionDivider }    from '@/components/ui/SectionDivider'
import { BackgroundEffects } from '@/components/ui/BackgroundEffects'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.digitalcodexa.com'

async function getStats() {
  try {
    const res = await fetch(`${API}/stats`, { next: { revalidate: 3600 } })
    if (!res.ok) return { projetos_concluidos: 5, clientes: 10 }
    return res.json() as Promise<{ projetos_concluidos: number; clientes: number }>
  } catch {
    return { projetos_concluidos: 5, clientes: 10 }
  }
}

export default async function Home() {
  const stats = await getStats()

  return (
    <>
      <BackgroundEffects />
      <Preloader />
      <CustomCursor />
      <ColorSwitcher />
      <WhatsAppButton />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        <Manifesto />
        <PromisesMarquee />
        <SectionDivider accent />
        <Stats projetosConcluidos={stats.projetos_concluidos} clientes={stats.clientes} />
        <SectionDivider />
        <Services />
        <SectionDivider accent />
        <HowItWorks />
        <SectionDivider />
        <Cases />
        <SectionDivider accent />
        <Testimonials />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <Guarantees />
        <SectionDivider />
        <CtaFinal />
      </main>
    </>
  )
}
