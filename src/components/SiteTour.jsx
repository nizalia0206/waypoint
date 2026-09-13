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
      const targetEl = document.getElementById(step.targetId);
      // Highlight the inner content wrapper instead of the raw element when
      // it's a full-bleed <section> — the glow ring this class draws hugs
      // the highlighted element's exact edges, and a full-viewport-width
      // section has no visible edges of its own, so the ring rendered as a
      // stray horizontal bar across the entire screen at the section's top
      // and bottom instead of reading as "this is highlighted".
      const el = targetEl && targetEl.querySelector(':scope > .wrap') || targetEl;
      if (el) {
        // Plain scrollIntoView({block:'center'}) centers the element within
        // the FULL viewport, including the space the sticky nav covers. For
        // any section taller than (viewport height − nav height) — e.g. the
        // Rewards section — that pushes the element's top edge up above the
        // visible area, behind the nav. Since a highlighted element's
        // z-index (186) is deliberately higher than the nav's (50) so it can
        // pop through the dark tour backdrop, that overlap isn't just
        // hidden — it renders on TOP of the nav, overlapping its text.
        // Scroll relative to the space actually available below the nav —
        // and above the tour card itself, which is fixed to the bottom of
        // the viewport and can grow tall enough on short screens (laptops,
        // landscape phones) to overlap the highlighted section's own
        // heading — instead of the full viewport, so content settles
        // cleanly between the two rather than behind either.
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 92;
        const cardEl = document.querySelector('.tour-card');
        const cardH = cardEl ? cardEl.getBoundingClientRect().height + 34 : 0;
        const rect = el.getBoundingClientRect();
        const availableH = Math.max(120, window.innerHeight - navH - cardH);
        let desiredTop;
        if (rect.height <= availableH) {
          desiredTop = navH + (availableH - rect.height) / 2;
        } else {
          // Doesn't fit even after that — anchoring the element's top just
          // below the nav (the old fallback) assumes whatever matters most
          // is near the TOP of the section. That's wrong for something like
          // the Trace's Journey carousel: its demo card floats well down
          // inside a tall stage, so top-anchoring the section left the card
          // itself sitting right behind the tour card, cut off mid-sentence,
          // while the section's own heading (already covered by the dark
          // backdrop's dimming anyway) had all the clearance. Try the top
          // anchor first, but if the element's bottom would still land
          // inside the tour card's territory, shift up further so the
          // bottom clears it — even if that pushes the top out of view.
          // Showing the actual interactive content the step is pointing at
          // matters more than showing the section's own heading above it.
          const cardTopBoundary = window.innerHeight - cardH;
          const naiveTop = navH + 16;
          const projectedBottom = naiveTop + rect.height;
          desiredTop = projectedBottom > cardTopBoundary
            ? naiveTop - (projectedBottom - cardTopBoundary)
            : naiveTop;
          // Never push the top above the nav-clear line to chase the
          // bottom — that just trades this overlap for the nav-overlap bug
          // fixed earlier. If the element is tall enough that no single
          // scroll position clears both, keeping clear of the nav wins.
          desiredTop = Math.max(navH, desiredTop);
        }
        const targetScrollTop = Math.max(0, window.scrollY + rect.top - desiredTop);
        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
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
