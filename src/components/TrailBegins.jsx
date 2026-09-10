import { useReveal } from '../hooks/useReveal';
import Mascot from './Mascot';
import { useSite } from '../context/SiteContext';

export default function TrailBegins() {
  const { t } = useSite();
  const [ref, visible] = useReveal(0.35);

  const scrollToNext = () => {
    document.querySelector('.about-waypoint')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="trail-begins" ref={ref}>
      <div className="wrap">
        <div className={`trail-begins-statement${visible ? ' in' : ''}`}>
          <span className="eyebrow-page">{t.home.trailBeginsTag}</span>
          <h2>{t.home.trailBeginsStatement}</h2>
        </div>

        <div className="trail-begins-scene" aria-hidden="true">
          <svg className="trail-begins-line-svg" viewBox="0 0 1000 4" preserveAspectRatio="none">
            <line x1="0" y1="2" x2="1000" y2="2" className="trail-begins-line-bg" />
            <line x1="0" y1="2" x2="1000" y2="2" className={`trail-begins-line-draw${visible ? ' drawn' : ''}`} />
          </svg>
          <div className={`trail-begins-marker m1${visible ? ' show' : ''}`}><span className="trail-begins-marker-dot" /></div>
          <div className={`trail-begins-marker m2${visible ? ' show' : ''}`}><span className="trail-begins-marker-dot" /></div>
          <div className={`trail-begins-marker m3${visible ? ' show' : ''}`}><span className="trail-begins-marker-dot final" /></div>
          <div className={`trail-begins-mascot${visible ? ' show' : ''}`}>
            <Mascot className="trail-begins-mascot-img" />
          </div>
        </div>

        <button type="button" className={`trail-begins-cue${visible ? ' show' : ''}`} onClick={scrollToNext}>
          <span>{t.home.trailBeginsCue}</span>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
