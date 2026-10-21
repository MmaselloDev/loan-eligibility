import "./DonutChart.css";

const R = 40;

export default function DonutChart({ segments, ariaLabel }) {
  const total = segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0);

  let offset = 0;
  const arcs =
    total > 0
      ? segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const pct = (s.value / total) * 100;
            const arc = { ...s, pct, offset };
            offset += pct;
            return arc;
          })
      : [];

  return (
    <svg viewBox="0 0 100 100" className="donut" role="img" aria-label={ariaLabel}>
      <circle cx="50" cy="50" r={R} fill="none" stroke="var(--donut-track, #e5e7eb)" strokeWidth="14" />
      {arcs.map((a) => (
        <circle
          key={a.label}
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={a.color}
          strokeWidth="14"
          pathLength="100"
          strokeDasharray={`${a.pct} ${100 - a.pct}`}
          strokeDashoffset={-a.offset}
          transform="rotate(-90 50 50)"
        />
      ))}
    </svg>
  );
}