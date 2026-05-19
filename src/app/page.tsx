import { Navbar }      from '@/components/layout/Navbar'
import { Hero }        from '@/components/sections/Hero'
import { TechMarquee } from '@/components/sections/TechMarquee'
import { Services }    from '@/components/sections/Services'
import { HowItWorks }  from '@/components/sections/HowItWorks'
import { Cases }       from '@/components/sections/Cases'
import { CtaFinal }    from '@/components/sections/CtaFinal'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Preloader }   from '@/components/ui/Preloader'

export default function Home() {
  return (
    <>
      <Preloader />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <Services />
        <HowItWorks />
        <Cases />
        <CtaFinal />
      </main>
    </>
  )
}
