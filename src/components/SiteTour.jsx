import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Mascot from './Mascot';
import { useSite } from '../context/SiteContext';

export default function SiteTour() {
  const { t, tourActive, tourStep, setTourStep, endTour } = useSite();
  const steps = t.tour.steps;
  const step = steps[tourStep];
  const location = useLocation();
  const navigate = useNavigate();
  const highlightRef = useRef(null);

  useEffect(() => {
    if (!tourActive) return undefined;

    if (highlightRef.current) {
      highlightRef.current.classList.remove('tour-highlight');
      highlightRef.current = null;
    }

    if (!step.targetId) return undefined;

    if (step.page && location.pathname !== step.page) {
      navigate(step.page);
      return undefined;
    }

    const timer = setTimeout(() => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('tour-highlight');
        highlightRef.current = el;
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [tourActive, tourStep, location.pathname, navigate, step]);

  useEffect(() => {
    if (tourActive) return undefined;
    // Ending the tour (finish or skip) doesn't go through the "new step"
    // branch above, so it never reaches the highlight-removal there — do it
    // here instead, or the last-highlighted element (e.g. the hero) keeps
    // tour-highlight's elevated z-index forever and can cover the nav.
    if (highlightRef.current) {
      highlightRef.current.classList.remove('tour-highlight');
      highlightRef.current = null;
    }
  }, [tourActive]);

  useEffect(() => {
    return () => {
      if (highlightRef.current) highlightRef.current.classList.remove('tour-highlight');
    };
  }, []);

  if (!tourActive) return null;

  const isFirst = tourStep === 0;
  const isLast = tourStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) { endTour(); navigate('/'); return; }
    setTourStep(i => i + 1);
  };
  const handleBack = () => setTourStep(i => Math.max(0, i - 1));
  const handleSkip = () => {
    endTour();
    navigate('/');
  };

  return (
    <>
      <div className="tour-backdrop" aria-hidden="true" />
      <div className="tour-card" role="dialog" aria-live="polite" aria-label={step.title}>
        <div className="tour-card-head">
          <Mascot className="tour-card-mascot" />
          <div>
            <div className="tour-card-title">{step.title}</div>
            <div className="tour-card-progress">{tourStep + 1} / {steps.length}</div>
          </div>
          <button className="tour-skip" onClick={handleSkip}>{t.tour.skip}</button>
        </div>
        <p className="tour-card-text">
          {step.intro && <>{step.intro} </>}
          {step.lead && <strong>{step.lead} </strong>}
          {step.text}
        </p>
        <div className="tour-card-actions">
          <button className="tour-btn" onClick={handleBack} disabled={isFirst}>{t.tour.back}</button>
          <div className="tour-dots">
            {steps.map((_, i) => <span key={i} className={i === tourStep ? 'active' : ''} />)}
          </div>
          <button className="tour-btn primary" onClick={handleNext}>{isLast ? t.tour.finish : t.tour.next}</button>
        </div>
      </div>
    </>
  );
}
