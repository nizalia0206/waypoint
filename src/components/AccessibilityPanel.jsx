import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import RecordDemo from './RecordDemo';

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t, aslEnabled, setAslEnabled, startTour } = useSite();

  const handleReplayTour = () => {
    setOpen(false);
    startTour();
  };

  return (
    <div className="access-wrap">
      <button
        className="access-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={t.access.title}
        title={t.access.title}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v5M12 15.5v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="access-panel">
          <div className="access-row">
            <span className="access-row-label">{t.access.langLabel}</span>
            <div className="access-lang-toggle">
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
              <button className={lang === 'ar' ? 'active' : ''} onClick={() => setLang('ar')}>العربية</button>
            </div>
          </div>

          <div className="access-row access-row-col">
            <div className="access-switch-row">
              <span className="access-row-label">{t.access.aslToggle}</span>
              <button
                className={`access-switch${aslEnabled ? ' on' : ''}`}
                role="switch"
                aria-checked={aslEnabled}
                onClick={() => setAslEnabled(v => !v)}
              >
                <span className="access-switch-knob" />
              </button>
            </div>
            <p className="access-switch-desc">{aslEnabled ? t.access.aslOnDesc : t.access.aslOffDesc}</p>
            <p className="access-switch-note">{t.access.aslNote}</p>
          </div>

          <button className="access-replay" onClick={handleReplayTour}>{t.access.replayTour}</button>
          <div className="access-divider" />
          <RecordDemo />
          <button className="access-close" onClick={() => setOpen(false)}>{t.access.close}</button>
        </div>
      )}
    </div>
  );
}
