import { About } from './components/About'
import { CtaStrip } from './components/CtaStrip'
import { FloatingActions } from './components/FloatingActions'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { LeadGateModal } from './components/LeadGateModal'
import { LeadForm } from './components/LeadForm'
import { Services } from './components/Services'
import { Testimonials } from './components/Testimonials'
import { WhyChooseUs } from './components/WhyChooseUs'

function App() {
  return (
    <div className="min-h-svh bg-white text-slate-900 antialiased">
      <LeadGateModal />
      <Header />
      <main className="pb-28 md:pb-8">
        <Hero />
        <About />
        <CtaStrip />
        <Services />
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <LeadForm />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  )
}

export default App
