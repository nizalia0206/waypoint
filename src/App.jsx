import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import TraceGuide from './components/TraceGuide';
import LoadingScreen from './components/LoadingScreen';
import SiteTour from './components/SiteTour';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import MentorPage from './pages/MentorPage';
import ProblemSolutionPage from './pages/ProblemSolutionPage';
import AuthPage from './pages/AuthPage';
import { useToast } from './hooks/useToast';
import { SiteProvider, useSite } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';

function AppShell() {
  const { message, show, toast } = useToast();
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const { startTour } = useSite();
  const location = useLocation();

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2300);
    const removeTimer = setTimeout(() => setShowLoader(false), 2750);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  // Auto-launch the tour every time someone lands on the home page (first
  // visit or a reload) — no manual trigger needed.
  useEffect(() => {
    if (showLoader) return;
    if (location.pathname !== '/') return;
    const timer = setTimeout(() => startTour(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoader]);

  // Route changes (new page) should always start at the top. Anchor-scroll
  // requests (location.state.scrollTo, handled by the destination page) fire
  // a moment later and win the final resting position when both apply.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <Nav toast={toast} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage toast={toast} />} />
        <Route path="/mentor" element={<MentorPage toast={toast} />} />
        <Route path="/problem-solution" element={<ProblemSolutionPage />} />
        <Route path="/signin" element={<AuthPage toast={toast} />} />
        <Route path="/signup" element={<AuthPage toast={toast} />} />
      </Routes>
      <Footer />
      <TraceGuide />
      <SiteTour />
      <div id="toast" className={show ? 'show' : ''}>{message}</div>
      {showLoader && <LoadingScreen fadeOut={fadeOut} />}
    </>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </AuthProvider>
    </SiteProvider>
  );
}
