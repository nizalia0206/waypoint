import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Mascot from './Mascot';
import { useSite } from '../context/SiteContext';
import { useReveal } from '../hooks/useReveal';

function shortestOffset(i, current, len) {
  let raw = i - current;
  if (raw > len / 2) raw -= len;
  if (raw < -len / 2) raw += len;
  return raw;
}

export default function TraceJourney() {
  const { t } = useSite();
  const steps = t.pathway.steps;
  const len = steps.length;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [stageRef, hasEntered] = useReveal(0.3);
  const activeCardRef = useRef(null);
  const traceWrapRef = useRef(null);
  // Null until measured, so first paint falls back to the CSS defaults below.
  const [layout, setLayout] = useState(null);

  // The active card's height is content-driven (each step's text is a
  // different length), but its vertical position and the trace mascot's
  // position below it are just fixed CSS offsets. On a narrower card
  // (mobile, or any viewport near the breakpoint) the same text wraps
  // onto more lines, so a long step can grow tall enough to run into —
  // or, since .journey-stage clips overflow for the coverflow fade, get
  // silently cut off by — the mascot underneath it. Rather than guess
  // more magic numbers per breakpoint, measure the active card's actual
  // rendered height and push the mascot (and the stage, if needed) down
  // just far enough to clear it, for whatever width/text combination is
  // currently on screen.
  useLayoutEffect(() => {
    const cardEl = activeCardRef.current;
    const stageEl = stageRef.current;
    if (!cardEl || !stageEl) return undefined;

    const recompute = () => {
      const isMobile = window.matchMedia('(max-width:760px)').matches;
      const defaultStageHeight = isMobile ? 420 : 400;
      const defaultTraceTop = defaultStageHeight * (isMobile ? 0.56 : 0.66);
      const gap = 14; // breathing room between the card's bottom edge and the mascot

      // offsetTop is the card's pre-transform box position, which is exactly
      // the anchor point its translate(-50%,-50%) centers on — i.e. its
      // rendered vertical center — regardless of the % used to place it.
      const cardCenter = cardEl.offsetTop;
      const cardBottom = cardCenter + cardEl.offsetHeight / 2;
      const traceHeight = traceWrapRef.current ? traceWrapRef.current.offsetHeight : (isMobile ? 80 : 110);

      const neededTraceTop = cardBottom + gap + traceHeight / 2;
      const traceTop = Math.max(defaultTraceTop, neededTraceTop);
      const stageHeight = Math.max(defaultStageHeight, traceTop + traceHeight / 2 + 20);

      setLayout((prev) => (
        prev && prev.traceTop === traceTop && prev.stageHeight === stageHeight
          ? prev
          : { traceTop, stageHeight }
      ));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(cardEl);
    window.addEventListener('resize', recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [current, stageRef]);

  // Don't start the journey until the section has actually been scrolled
  // into view — arriving at a stage already mid-motion feels accidental,
  // not like the beginning of something.
  useEffect(() => {
    if (paused || !hasEntered) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrent((s) => (s + 1) % len);
    }, 3400);
    return () => clearInterval(id);
  }, [paused, hasEntered, len]);

  const goTo = (i) => {
    const target = ((i % len) + len) % len;
    setDirection(shortestOffset(target, current, len) >= 0 ? 1 : -1);
    setCurrent(target);
  };
  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  return (
    <section id="journey">
      <div className="wrap">
        <div className="section-head">
          <h2>{t.journey.head}</h2>
          <p>{t.journey.sub}</p>
        </div>

        <div
          className="journey-stage"
          ref={stageRef}
          style={layout ? { height: `${layout.stageHeight}px` } : undefined}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="journey-track">
            {steps.map((s, i) => {
              const offset = shortestOffset(i, current, len);
              const abs = Math.abs(offset);
              const isActive = offset === 0;
              const angle = offset * 30;
              const translateX = offset * 190;
              const translateZ = -abs * 130;
              const scale = isActive ? 1 : Math.max(1 - abs * 0.1, 0.72);
              const opacity = Math.max(1 - abs * 0.32, 0);
              const blur = Math.min(abs * 1.6, 4.5);
              const show = abs <= 2;

              return (
                <button
                  key={i}
                  ref={isActive ? activeCardRef : null}
                  className={`journey-card${isActive ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`${i + 1}: ${s.title}`}
                  aria-current={isActive}
                  style={{
                    display: show ? 'flex' : 'none',
                    transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${-angle}deg) scale(${scale})`,
                    opacity,
                    // Only apply the filter when there's actual blur to render.
                    // `filter: blur(0px)` is still a non-'none' filter, which
                    // forces GPU layer promotion/rasterization in Chromium —
                    // combined with the 3D transform above, that can cause
                    // small text (the "01" mile number) to render invisible
                    // for the first frame or two after mount.
                    filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    zIndex: 100 - abs,
                    pointerEvents: isActive ? 'none' : 'auto',
                  }}
                >
                  <span className="journey-card-mile">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.title}</h3>
                  {isActive && <p>{s.text}</p>}
                  {!isActive && <div className="journey-card-note">{s.text}</div>}
                </button>
              );
            })}
          </div>

          <div
            key={current}
            ref={traceWrapRef}
            className={`journey-trace-wrap dir-${direction}`}
            style={layout ? { top: `${layout.traceTop}px` } : undefined}
          >
            <Mascot className="journey-trace-img" />
          </div>

          <button className="journey-nav prev" onClick={goPrev} aria-label="Previous waypoint">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="journey-nav next" onClick={goNext} aria-label="Next waypoint">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
