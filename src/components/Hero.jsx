import HeroVideoBackground from './HeroVideoBackground';
import MagneticButton from './MagneticButton';
import { useSite } from '../context/SiteContext';

function StaggeredWords({ text, startDelay = 0.55, step = 0.045 }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          className={`hero-word${i === words.length - 1 ? ' hero-word-accent' : ''}`}
          style={{ animationDelay: `${startDelay + i * step}s` }}
        >
          {w}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  );
}

export default function Hero({ heroGoal, setHeroGoal, onFindTrail }) {
  const { t, aslEnabled } = useSite();

  return (
    <header className="hero" id="hero">
      <HeroVideoBackground />
      <div className="wrap hero-grid">
        <div className="hero-inner">
          <div className="hero-route-side" aria-hidden="true">
            <svg viewBox="0 0 20 420" width="20" height="420" preserveAspectRatio="none">
              <line x1="10" y1="4" x2="10" y2="400" className="hero-route-line" />
              <circle cx="10" cy="4" r="4" className="hero-route-dot dot1" />
              <circle cx="10" cy="180" r="4" className="hero-route-dot dot2" />
              <circle cx="10" cy="400" r="5" className="hero-route-dot dot3" />
            </svg>
          </div>
          <div className="hero-mark">{t.hero.mark}</div>
          <h1 className="hero-h1"><StaggeredWords text={t.hero.h1} /></h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <ul className="hero-quick-answers" aria-label="What, who, and why">
            {t.hero.quickAnswers.map((qa) => (
              <li key={qa.label}>
                <span className="hqa-label">{qa.label}</span>
                <span className="hqa-value">{qa.value}</span>
              </li>
            ))}
          </ul>
          <div className="goal-form">
            <input
              type="text"
              placeholder={t.hero.placeholder}
              value={heroGoal}
              onChange={(e) => setHeroGoal(e.target.value)}
            />
            <MagneticButton className="btn-trail hero-btn-pulse" onClick={onFindTrail}>{t.hero.button}</MagneticButton>
          </div>
          <p className="hero-note">{t.hero.note}</p>
          {aslEnabled && (
            <p className="hero-asl-badge">
              <span aria-hidden="true">🤟</span> {t.hero.aslBadge}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
