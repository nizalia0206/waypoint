import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [aslEnabled, setAslEnabled] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', t.dir);
  }, [lang, t.dir]);

  const startTour = useCallback(() => {
    setTourStep(0);
    setTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setTourActive(false);
  }, []);

  return (
    <SiteContext.Provider value={{
      lang, setLang, t,
      aslEnabled, setAslEnabled,
      tourActive, tourStep, setTourStep, startTour, endTour,
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
