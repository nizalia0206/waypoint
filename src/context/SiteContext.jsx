import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations';

const SiteContext = createContext(null);
const TOUR_SEEN_KEY = 'waypoint_tour_seen_v1';
const THEME_KEY = 'waypoint_theme_v1';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (e) { /* ignore */ }
  // Default to light regardless of system preference — dark mode is opt-in
  // via the Accessibility panel, not auto-applied from the OS setting.
  return 'light';
}

export function SiteProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [aslEnabled, setAslEnabled] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [theme, setThemeState] = useState(getInitialTheme);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', t.dir);
  }, [lang, t.dir]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const startTour = useCallback(() => {
    setTourStep(0);
    setTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setTourActive(false);
    try { localStorage.setItem(TOUR_SEEN_KEY, '1'); } catch (e) { /* ignore */ }
  }, []);

  const hasSeenTour = useCallback(() => {
    try { return localStorage.getItem(TOUR_SEEN_KEY) === '1'; } catch (e) { return true; }
  }, []);

  return (
    <SiteContext.Provider value={{
      lang, setLang, t,
      aslEnabled, setAslEnabled,
      theme, setTheme, toggleTheme,
      tourActive, tourStep, setTourStep, startTour, endTour, hasSeenTour,
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}
