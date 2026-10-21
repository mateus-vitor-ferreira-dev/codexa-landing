import type { Metadata } from 'next'
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
import { Contact }       from '@/components/sections/Contact'
import { CtaFinal }      from '@/components/sections/CtaFinal'
import { Footer }        from '@/components/layout/Footer'
import { CustomCursor }   from '@/components/ui/CustomCursor'
import { ColorSwitcher }  from '@/components/ui/ColorSwitcher'
import { Preloader }      from '@/components/ui/Preloader'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { SectionDivider }    from '@/components/ui/SectionDivider'
import { BackgroundEffects } from '@/components/ui/BackgroundEffects'

// Título e descrição vêm do layout; aqui só o endereço canônico da home
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function Home() {
  return (
    <>
      {/* Skip link: primeiro item do Tab, só aparece com foco */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10001] focus:rounded-lg focus:px-4 focus:py-3 focus:font-semibold"
        style={{ background: 'var(--accent)', color: '#06060c' }}
      >
        Pular para o conteúdo
      </a>
      <BackgroundEffects />
      <Preloader />
      <CustomCursor />
      <Navbar />
      {/* overflow-x: clip segura os cards que entram de lado (GSAP) sem quebrar o sticky;
          sem isso o celular alarga a página e corta o conteúdo */}
      <main id="conteudo" style={{ position: 'relative', zIndex: 10, overflowX: 'clip' }}>
        <Hero />
        <Manifesto />
        <PromisesMarquee />
        <SectionDivider accent />
        <Stats />
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
        <SectionDivider accent />
        <Contact />
        <SectionDivider />
        <CtaFinal />
      </main>
      <Footer />
      {/* Flutuantes depois do conteúdo: no Tab vêm por último, não antes do menu */}
      <ColorSwitcher />
      <WhatsAppButton />
    </>
  )
}
