import { useId } from 'react';

/**
 * WaypointRoute — the one visual element that should read as "Waypoint"
 * even with every word removed from the screen.
 *
 * A single component draws every variant of the route so the whole site
 * shares one hand, rather than each section inventing its own line:
 *   - "dotted"   sparse waypoint markers, the default trail language
 *   - "solid"    a committed, already-walked leg of the journey
 *   - "hand"     a slightly imperfect, human-drawn leg (feTurbulence wobble)
 *   - "faint"    a background route, barely there, for behind typography
 *   - "branch"   the route forks briefly before rejoining
 *
 * `markers` places ○ / ● / ★ waypoints in explicit viewBox coordinates —
 * kept simple (no runtime path-length math) so every section can hand-place
 * markers on its own hand-authored path.
 */
export default function WaypointRoute({
  d,
  branchD,
  viewBox = '0 0 100 100',
  variant = 'dotted',
  markers = [],
  animate = true,
  glowActive = false,
  className = '',
  strokeWidth = 2,
}) {
  const uid = useId().replace(/[:]/g, '');
  const wobbleId = `wr-wobble-${uid}`;
  const glowId = `wr-glow-${uid}`;

  const isHand = variant === 'hand';
  const isFaint = variant === 'faint';
  const isSolid = variant === 'solid' || isHand;

  return (
    <svg
      className={`waypoint-route waypoint-route--${variant} ${className}`}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={wobbleId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {branchD && (
        <path
          d={branchD}
          className="wr-path wr-path--branch"
          stroke={isFaint ? 'var(--line)' : 'var(--trail)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={isSolid ? undefined : '1 8'}
          filter={isHand ? `url(#${wobbleId})` : undefined}
        />
      )}

      <path
        d={d}
        className={`wr-path${animate ? ' wr-path--draw' : ''}`}
        stroke={isFaint ? 'var(--line)' : 'var(--trail)'}
        strokeOpacity={isFaint ? 0.5 : 1}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={variant === 'dotted' ? '1 9' : undefined}
        filter={isHand ? `url(#${wobbleId})` : undefined}
      />

      {markers.map((m, i) => (
        <g key={i} className={`wr-marker wr-marker--${m.type || 'hollow'}${m.active ? ' is-active' : ''}`}>
          {(m.active || glowActive) && m.glow !== false && (
            <circle cx={m.cx} cy={m.cy} r={(m.r || 3.2) * 3.4} fill={`url(#${glowId})`} className="wr-marker-halo" />
          )}
          {m.type === 'star' ? (
            <path
              d={starPath(m.cx, m.cy, m.r || 4)}
              fill={m.active ? 'var(--gold)' : 'var(--trail)'}
              className="wr-marker-shape"
            />
          ) : (
            <circle
              cx={m.cx}
              cy={m.cy}
              r={m.r || 3.2}
              fill={m.type === 'solid' ? (m.active ? 'var(--gold)' : 'var(--trail)') : 'var(--paper)'}
              stroke={m.active ? 'var(--gold)' : 'var(--trail)'}
              strokeWidth={1.6}
              className="wr-marker-shape"
            />
          )}
          {m.label && (
            <text x={m.cx} y={m.cy - (m.r || 3.2) - 6} className="wr-marker-label" textAnchor="middle">
              {m.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function starPath(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
}
