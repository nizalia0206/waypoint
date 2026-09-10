import { useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useReveal } from '../hooks/useReveal';
import Mascot from './Mascot';

function TrophyIcon() {
  return (
    <svg viewBox="0 0 140 150" width="140" height="150" aria-hidden="true">
      <ellipse cx="70" cy="138" rx="34" ry="6" fill="var(--ink)" opacity="0.08" />
      <rect x="52" y="112" width="36" height="14" rx="2" fill="var(--way)" />
      <rect x="60" y="98" width="20" height="18" fill="var(--way)" />
      <path d="M35 34 h70 v28 a35 35 0 0 1-70 0 z" fill="var(--gold)" />
      <path d="M35 34 h70 v14 h-70 z" fill="#D9B76A" />
      <path d="M40 40 c-14 0-20 8-20 18 s8 16 20 14" fill="none" stroke="var(--gold)" strokeWidth="7" strokeLinecap="round" />
      <path d="M100 40 c14 0 20 8 20 18 s-8 16-20 14" fill="none" stroke="var(--gold)" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 40 a20 20 0 0 0 40 0" fill="none" stroke="#F3E4BE" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <g className="about-sparkle sparkle1"><path d="M22 22 l3 7 7 3 -7 3 -3 7 -3-7 -7-3 7-3z" fill="var(--gold)" /></g>
      <g className="about-sparkle sparkle2"><path d="M114 60 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5-5.5 -5.5-2.5 5.5-2.5z" fill="var(--gold)" /></g>
      <g className="about-sparkle sparkle3"><path d="M108 18 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2-4.5 -4.5-2 4.5-2z" fill="var(--trail)" /></g>
    </svg>
  );
}

function UniversityIllustration() {
  return (
    <svg viewBox="0 0 460 260" width="460" height="260" aria-hidden="true">
      <ellipse cx="150" cy="235" rx="140" ry="10" fill="var(--ink)" opacity="0.07" />
      <ellipse cx="400" cy="235" rx="45" ry="7" fill="var(--ink)" opacity="0.07" />

      {/* University building */}
      <circle cx="150" cy="34" r="14" fill="var(--gold)" opacity="0.5" />
      <line x1="150" y1="40" x2="150" y2="55" stroke="var(--gold)" strokeWidth="2.5" />
      <path d="M150 40 a13 13 0 0 1 -13 -13 h26 a13 13 0 0 1 -13 13z" fill="var(--gold)" />
      <path d="M12 100 L150 40 L288 100 Z" fill="var(--trail)" />
      <rect x="20" y="98" width="260" height="20" fill="#0F3826" />
      <text x="150" y="113" textAnchor="middle" fontFamily="'Abhaya Libre', Georgia, serif" fontSize="18" fontWeight="700" letterSpacing="2" fill="var(--paper)">UNIVERSITY</text>
      <rect x="26" y="118" width="248" height="94" fill="#EFE4CB" stroke="var(--trail)" strokeWidth="3" />

      {/* colonnade */}
      {[38, 66, 94, 206, 234, 262].map((x) => (
        <g key={x}>
          <rect x={x} y="126" width="14" height="78" fill="var(--paper)" stroke="var(--trail)" strokeWidth="2.2" />
          <rect x={x - 3} y="122" width="20" height="6" fill="var(--trail)" />
        </g>
      ))}
      {[38, 66, 94, 206, 234, 262].map((x) => (
        <rect key={`w${x}`} x={x + 2} y="150" width="9" height="16" fill="var(--trail)" opacity="0.35" />
      ))}

      {/* entrance */}
      <rect x="126" y="150" width="48" height="62" fill="var(--way)" />
      <rect x="138" y="164" width="24" height="48" fill="#3A1010" />
      <path d="M120 150 L150 130 L180 150 Z" fill="var(--gold)" opacity="0.6" />

      {/* steps */}
      <rect x="14" y="212" width="272" height="8" fill="var(--trail)" />
      <rect x="6" y="220" width="288" height="9" fill="#0F3826" />

      {/* greenery */}
      <g>
        <rect x="7" y="205" width="4" height="16" fill="#5A4423" />
        <circle cx="9" cy="198" r="14" fill="var(--trail)" />
      </g>
      <g>
        <rect x="289" y="205" width="4" height="16" fill="#5A4423" />
        <circle cx="291" cy="198" r="14" fill="var(--trail)" />
      </g>

      {/* people */}
      <g className="about-figure">
        <circle cx="70" cy="205" r="6" fill="#E9C79A" />
        <path d="M70 211 L70 224" stroke="var(--way)" strokeWidth="7" strokeLinecap="round" />
        <path d="M70 216 L63 220 M70 216 L77 220" stroke="var(--way)" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 224 L65 233 M70 224 L75 233" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g className="about-figure" style={{ animationDelay: '.3s' }}>
        <circle cx="228" cy="205" r="6" fill="#E9C79A" />
        <path d="M228 211 L228 224" stroke="var(--trail)" strokeWidth="7" strokeLinecap="round" />
        <path d="M228 216 L221 220 M228 216 L235 220" stroke="var(--trail)" strokeWidth="4" strokeLinecap="round" />
        <path d="M228 224 L223 233 M228 224 L233 233" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Route from university to career */}
      <path
        d="M288 190 C 320 190, 320 150, 355 150 S 396 190, 396 190"
        fill="none" stroke="var(--line)" strokeWidth="2.5" strokeDasharray="6 7"
      />
      <circle className="about-route-dot" cx="288" cy="190" r="6" fill="var(--gold)" />

      {/* Career destination */}
      <g>
        <rect x="372" y="180" width="48" height="34" rx="2" fill="var(--way)" />
        <rect x="386" y="170" width="20" height="12" rx="2" fill="none" stroke="var(--way)" strokeWidth="3" />
        <rect x="372" y="194" width="48" height="5" fill="#3A1010" />
        <text x="396" y="232" textAnchor="middle" fontFamily="'Abhaya Libre', Georgia, serif" fontSize="15" fontWeight="700" letterSpacing="1.5" fill="var(--way)">CAREER</text>
      </g>
    </svg>
  );
}

function GuidanceStepsIllustration() {
  return (
    <svg viewBox="0 0 220 170" width="220" height="170" aria-hidden="true">
      <ellipse cx="60" cy="160" rx="55" ry="7" fill="var(--ink)" opacity="0.06" />
      <rect x="10" y="140" width="60" height="20" fill="var(--trail)" />
      <rect x="50" y="112" width="60" height="28" fill="#1E5F45" />
      <rect x="90" y="84" width="60" height="28" fill="var(--trail)" />
      <rect x="130" y="56" width="60" height="28" fill="#1E5F45" />
      <g className="about-figure about-figure-walk">
        <circle cx="168" cy="30" r="9" fill="#E9C79A" />
        <path d="M168 39 L168 58" stroke="var(--way)" strokeWidth="11" strokeLinecap="round" />
        <path d="M168 44 L156 36 M168 44 L180 52" stroke="var(--way)" strokeWidth="6" strokeLinecap="round" />
        <path d="M168 58 L158 52 M168 58 L178 70" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function AboutWaypoint() {
  const { t } = useSite();
  const navigate = useNavigate();

  const [headRef, headVisible] = useReveal();
  const [row1Ref, row1Visible] = useReveal();
  const [row2Ref, row2Visible] = useReveal();
  const [row3Ref, row3Visible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  const goTo = (id) => () => navigate('/features', { state: { scrollTo: id } });
  const cls = (base, visible) => `${base} reveal${visible ? ' is-visible' : ''}`;

  return (
    <section className="about-waypoint">
      <div className="wrap">
        <div ref={headRef} className={cls('about-intro reveal-up', headVisible)}>
          <div className="about-intro-text">
            <span className="eyebrow-page">{t.home.aboutTitle}</span>
            <div className="about-manifesto">
              {t.home.manifesto.split('\n').map((line, i) => (
                <span key={i} className="about-manifesto-line" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                  {line}
                </span>
              ))}
            </div>
            <p className="about-explain">{t.home.aboutText}</p>
          </div>
          <div className="about-intro-trail" aria-hidden="true">
            <div className="about-floating-illustration">
              <UniversityIllustration />
            </div>
          </div>
        </div>

        <div ref={row1Ref} className={cls('feature-row reveal-left', row1Visible)}>
          <div className="feature-row-media">
            <Mascot className="feature-row-mascot" />
          </div>
          <div className="feature-row-text">
            <h3>{t.home.meetTraceTitle}</h3>
            <p>{t.home.meetTraceText}</p>
            <button className="ask-btn primary" onClick={goTo('journey')}>{t.home.meetTraceCta}</button>
          </div>
        </div>

        <div ref={row2Ref} className={cls('feature-row reverse reveal-right', row2Visible)}>
          <div className="feature-row-media">
            <div className="about-floating-illustration"><GuidanceStepsIllustration /></div>
          </div>
          <div className="feature-row-text">
            <h3>{t.home.careerTitle}</h3>
            <p>{t.home.careerText}</p>
            <button className="ask-btn primary" onClick={goTo('match')}>{t.home.careerCta}</button>
          </div>
        </div>

        <div ref={row3Ref} className={cls('feature-row reveal-left', row3Visible)}>
          <div className="feature-row-media">
            <div className="about-floating-illustration"><TrophyIcon /></div>
          </div>
          <div className="feature-row-text">
            <h3>{t.home.rewardsTitle}</h3>
            <p>{t.home.rewardsText}</p>
            <button className="ask-btn primary" onClick={goTo('rewards')}>{t.home.rewardsCta}</button>
          </div>
        </div>

        <button
          ref={ctaRef}
          className={cls('btn-trail about-cta reveal-up', ctaVisible)}
          onClick={() => navigate('/features')}
        >
          {t.home.exploreCta}
        </button>
      </div>
    </section>
  );
}
