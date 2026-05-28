import { Navbar }        from '@/components/layout/Navbar'
import { Hero }          from '@/components/sections/Hero'
import { TechMarquee }   from '@/components/sections/TechMarquee'
import { Stats }         from '@/components/sections/Stats'
import { Services }      from '@/components/sections/Services'
import { HowItWorks }    from '@/components/sections/HowItWorks'
import { Cases }         from '@/components/sections/Cases'
import { Testimonials }  from '@/components/sections/Testimonials'
import { FAQ }           from '@/components/sections/FAQ'
import { Guarantees }    from '@/components/sections/Guarantees'
import { CtaFinal }      from '@/components/sections/CtaFinal'
import { CustomCursor }  from '@/components/ui/CustomCursor'
import { Preloader }     from '@/components/ui/Preloader'
import { SectionDivider }    from '@/components/ui/SectionDivider'
import { BackgroundEffects } from '@/components/ui/BackgroundEffects'

export default function Home() {
  return (
    <>
      <BackgroundEffects />
      <Preloader />
      <CustomCursor />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        <SectionDivider />
        <TechMarquee />
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
        <SectionDivider />
        <CtaFinal />
      </main>
    </>
  )
}
