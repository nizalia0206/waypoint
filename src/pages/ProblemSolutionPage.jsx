import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { getFeedback } from '../data/requestsStore';
import OutcomesChart from '../components/OutcomesChart';

const OUTCOME_KEYS = ['understood', 'cv', 'internship', 'interview', 'courseAdvice', 'decision', 'another'];

function ThinkingIllustration() {
  return (
    <svg viewBox="0 0 200 240" width="200" height="240" aria-hidden="true">
      <ellipse cx="100" cy="225" rx="58" ry="9" fill="var(--ink)" opacity="0.07" />
      <path d="M90 175 L80 215 M110 175 L120 215" stroke="var(--ink)" strokeWidth="10" strokeLinecap="round" />
      <rect x="70" y="115" width="60" height="65" rx="22" fill="var(--way)" />
      <path d="M72 135 L54 165" stroke="var(--way)" strokeWidth="12" strokeLinecap="round" />
      <circle cx="100" cy="80" r="30" fill="#E9C79A" />
      <path d="M128 135 L141 104 L121 94" stroke="var(--way)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M82 64 Q90 57 98 63" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M104 63 Q112 57 120 64" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="76" r="4" fill="var(--ink)" />
      <circle cx="112" cy="76" r="4" fill="var(--ink)" />
      <circle cx="76" cy="92" r="6" fill="var(--way)" opacity="0.25" />
      <circle cx="124" cy="92" r="6" fill="var(--way)" opacity="0.25" />
      <path d="M92 98 Q100 94 108 98" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className="ps-think-bubbles">
        <circle cx="158" cy="52" r="5.5" fill="var(--gold)" />
        <circle cx="172" cy="34" r="8" fill="var(--gold)" />
        <text x="193" y="26" textAnchor="middle" fontFamily="'Abhaya Libre', Georgia, serif" fontSize="30" fontWeight="700" fill="var(--gold)">?</text>
      </g>
    </svg>
  );
}

function SolutionIllustration() {
  return (
    <svg viewBox="0 0 200 240" width="200" height="240" aria-hidden="true">
      <ellipse cx="100" cy="225" rx="58" ry="9" fill="var(--ink)" opacity="0.07" />
      <path d="M90 175 L80 215 M110 175 L120 215" stroke="var(--ink)" strokeWidth="10" strokeLinecap="round" />
      <rect x="70" y="115" width="60" height="65" rx="22" fill="var(--trail)" />
      <path d="M72 132 L50 108" stroke="var(--trail)" strokeWidth="12" strokeLinecap="round" />
      <path d="M128 132 L150 108" stroke="var(--trail)" strokeWidth="12" strokeLinecap="round" />
      <circle cx="100" cy="80" r="30" fill="#E9C79A" />
      <circle cx="90" cy="76" r="4" fill="var(--ink)" />
      <circle cx="112" cy="76" r="4" fill="var(--ink)" />
      <circle cx="76" cy="92" r="6" fill="var(--way)" opacity="0.2" />
      <circle cx="124" cy="92" r="6" fill="var(--way)" opacity="0.2" />
      <path d="M88 94 Q100 106 112 94" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className="ps-solution-glow">
        <circle cx="100" cy="32" r="17" fill="var(--gold)" />
        <rect x="93" y="47" width="14" height="9" fill="#D9B76A" />
        <path d="M100 6 L100 13 M69 32 L76 32 M124 32 L131 32 M78 6 L82 11 M122 6 L118 11" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function ProblemSolutionPage() {
  const { t } = useSite();
  const ps = t.ps;

  const impact = useMemo(() => {
    const feedback = getFeedback();
    const total = feedback.length;
    if (total === 0) return null;
    const segments = OUTCOME_KEYS
      .map((key) => ({ key, label: t.match.feedbackOutcomes[key], count: feedback.filter((f) => f.outcomes && f.outcomes[key]).length }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
    if (!segments.length) return null;
    const top = segments[0];
    return { total, top, pct: Math.round((top.count / total) * 100), segments };
  }, [t]);

  return (
    <section id="problem-solution" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <Link to="/" className="btn-text" style={{ display: 'inline-block', marginBottom: 18 }}>{ps.back}</Link>
          <h2>{ps.head}</h2>
        </div>

        <div className="ps-block ps-block-illustrated">
          <div className="ps-block-text">
            <h4>{ps.problemTitle}</h4>
            <p className="ps-drop">{ps.problemText}</p>
          </div>
          <div className="ps-illustration"><ThinkingIllustration /></div>
        </div>

        <div className="ps-stat-row">
          {ps.stats.map((s) => (
            <div className="ps-stat" key={s.value + s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
              <a className="ps-source" href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
                {s.sourceName}
              </a>
            </div>
          ))}
        </div>

        <div className="ps-block">
          <h4>{ps.researchTitle}</h4>
          <ol className="research-list">
            {ps.research.map((r, i) => (
              <li key={i}>
                <span className="mile">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div>{r.text}</div>
                  <a className="ps-source" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {r.sourceName}
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="ps-block ps-block-illustrated reverse">
          <div className="ps-block-text">
            <h4>{ps.solutionTitle}</h4>
            <p style={{ fontSize: '16.5px', lineHeight: 1.7, maxWidth: '68ch' }}>{ps.solutionText}</p>
          </div>
          <div className="ps-illustration"><SolutionIllustration /></div>
        </div>

        <div className="ps-block ps-impact">
          <span className="eyebrow">{ps.impactTag}</span>
          {impact ? (
            <div className="ps-impact-body">
              <p className="ps-impact-stat">
                <strong>{impact.pct}%</strong> {ps.impactPrefix} <em>&ldquo;{impact.top.label}&rdquo;</em> {ps.impactSuffix(impact.total)}
              </p>
              <OutcomesChart segments={impact.segments} total={impact.total} repliesLabel={impact.total === 1 ? ps.chartReplySingular : ps.chartReplyPlural} emptyLabel={ps.impactEmpty} />
            </div>
          ) : (
            <p className="ps-impact-empty">{ps.impactEmpty}</p>
          )}
        </div>

        <div className="ps-block ps-comparison">
          <span className="eyebrow">{ps.comparisonTag}</span>
          <h4>{ps.comparisonTitle}</h4>
          <p className="ps-comparison-intro">{ps.comparisonIntro}</p>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  {ps.comparisonHeaders.map((h, i) => (
                    <th key={i} className={i === ps.comparisonHeaders.length - 1 ? 'comparison-highlight' : undefined}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ps.comparisonRows.map((row, i) => (
                  <tr key={i}>
                    <td className="comparison-feature">{row.feature}</td>
                    <td>{row.linkedin}</td>
                    <td>{row.careerOffice}</td>
                    <td className="comparison-highlight">{row.waypoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ps-comparison-novelty"><strong>{ps.noveltyTag}</strong> {ps.noveltyText}</p>
        </div>

        <div className="ps-block ps-future">
          <span className="eyebrow">{ps.futureTag}</span>
          <h4>{ps.futureTitle}</h4>
          <p style={{ fontSize: '16.5px', lineHeight: 1.7, maxWidth: '68ch' }}>{ps.futureText}</p>
        </div>

        <div className="ps-block">
          <h4>{ps.whyTitle}</h4>
          <p style={{ fontSize: '16.5px', lineHeight: 1.7, maxWidth: '68ch' }}>{ps.whyText}</p>
          <div className="ps-callout">{ps.callout}</div>
        </div>
      </div>
    </section>
  );
}
