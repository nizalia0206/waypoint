const COLORS = ['#174D38', '#4D1717', '#B8934A', '#3E7A5C', '#8B4A4A', '#C9A227', '#8A8272'];

// Hand-built donut chart (no chart library) so it matches the site's
// hand-drawn illustration style. segments: [{ key, label, count }], sorted desc, count > 0 only.
export default function OutcomesChart({ segments, total, emptyLabel, repliesLabel }) {
  const size = 168;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  if (!segments || segments.length === 0) {
    return (
      <div className="outcomes-chart outcomes-chart-empty">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        </svg>
        <p className="outcomes-chart-empty-label">{emptyLabel}</p>
      </div>
    );
  }

  let cumulative = 0;

  return (
    <div className="outcomes-chart">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Outcome breakdown">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-deep)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const pct = seg.count / total;
          const dash = pct * circumference;
          const offset = -cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={seg.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontFamily="var(--serif)" fontWeight="700" fontSize="26" fill="var(--ink)">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 17} textAnchor="middle" fontFamily="var(--mono)" fontSize="9.5" letterSpacing="0.08em" fill="var(--ink-dim)">
          {repliesLabel}
        </text>
      </svg>
      <ul className="outcomes-chart-legend">
        {segments.map((seg, i) => (
          <li key={seg.key}>
            <span className="outcomes-chart-swatch" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
            <span className="outcomes-chart-legend-label">{seg.label}</span>
            <span className="outcomes-chart-legend-value">{Math.round((seg.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
