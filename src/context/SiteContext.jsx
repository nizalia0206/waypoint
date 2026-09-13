import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations';

const SiteContext = createContext(null);
const TOUR_SEEN_KEY = 'waypoint_tour_seen_v1';
const TOUR_ACTIVE_KEY = 'waypoint_tour_active_v1';
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
    try { sessionStorage.setItem(TOUR_ACTIVE_KEY, '1'); } catch (e) { /* ignore */ }
  }, []);

  const endTour = useCallback(() => {
    setTourActive(false);
    try {
      localStorage.setItem(TOUR_SEEN_KEY, '1');
      sessionStorage.removeItem(TOUR_ACTIVE_KEY);
    } catch (e) { /* ignore */ }
  }, []);

  const hasSeenTour = useCallback(() => {
    try { return localStorage.getItem(TOUR_SEEN_KEY) === '1'; } catch (e) { return true; }
  }, []);

  // True if a previous (pre-reload) session left the tour mid-flight — the
  // in-memory tourActive state doesn't survive a reload, but the URL the
  // tour navigated to does, so without this check a reload mid-tour strands
  // the user on that page with no tour UI. Consumed once on app mount.
  const wasTourInProgress = useCallback(() => {
    try {
      if (sessionStorage.getItem(TOUR_ACTIVE_KEY) === '1') {
        sessionStorage.removeItem(TOUR_ACTIVE_KEY);
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }, []);

  return (
    <SiteContext.Provider value={{
      lang, setLang, t,
      aslEnabled, setAslEnabled,
      theme, setTheme, toggleTheme,
      tourActive, tourStep, setTourStep, startTour, endTour, hasSeenTour, wasTourInProgress,
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
