import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import CinematicNavbar from './components/CinematicNavbar'
import CinematicFooter from './components/CinematicFooter'
import ParticleField from './components/ParticleField'
import Home from './pages/Home'
import Kits from './pages/Kits'
import LuminolKit from './pages/LuminolKit'
import Demo from './pages/Demo'
import Gallery from './pages/Gallery'
import KitDevelopment from './pages/KitDevelopment'
import CreatorProgram from './pages/CreatorProgram'
import HandsOnTeaching from './pages/HandsOnTeaching'
import Newsletter from './pages/Newsletter'
import Team from './pages/Team'
import OurChapters from './pages/OurChapters'
import Contact from './pages/Contact'
import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<Home />} />
        <Route path="/kits"     element={<Kits />} />
        <Route path="/kits/luminol" element={<LuminolKit />} />
        <Route path="/demo"     element={<Demo />} />
        <Route path="/gallery"  element={<Gallery />} />
        <Route path="/initiatives/sap"      element={<KitDevelopment />} />
        <Route path="/initiatives/kits"      element={<CreatorProgram />} />
        <Route path="/initiatives/teaching" element={<HandsOnTeaching />} />
        <Route path="/newsletter"           element={<Newsletter />} />
        <Route path="/team"     element={<Team />} />
        <Route path="/chapters" element={<OurChapters />} />
        <Route path="/contact"  element={<Contact />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ParticleField />
        <CinematicNavbar />
        <AnimatedRoutes />
        <CinematicFooter />
      </BrowserRouter>
    </LanguageProvider>
  )
}
