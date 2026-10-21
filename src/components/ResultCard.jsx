import { formatZAR } from "../utils/formatCurrency";
import "./ResultCard.css";

const Icons = {
  approved: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3L2 21h20L12 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10v5M12 18v.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  declined: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
};

const STATUS = {
  approved: {
    label: "Likely to be approved",
    summary: "Your repayments fit comfortably within your budget.",
  },
  review: {
    label: "Approval possible, but tight",
    summary: "You may qualify, but repayments take a large share of your leftover income. Your application needs to be reviewed.",
  },
  declined: {
    label: "Not likely to be approved",
    summary: "Your repayments are on the high side, consider a lower loan amount.",
  },
};

export default function ResultCard({
  status,            // "approved" | "borderline" | "declined"
  monthlyRepayment,
  loanAmount,
  termYears,
  annualRate,
  leftoverAfter,     // use the value you already compute (13431.51)
  reasons = [],      // your "within 30% of disposable income" lines
}) {
  const config = STATUS[status];
  if (!config) return null;

  return (
    <section
      className={`result-card result-card--${status}`}
      role="status"
      aria-live="polite"
      aria-labelledby="result-heading"
    >
      <header className="result-card__header">
        <span className="result-card__icon">{Icons[status]}</span>
        <div>
          <h2 id="result-heading" className="result-card__title">{config.label}</h2>
          <p className="result-card__summary">{config.summary}</p>
        </div>
      </header>

      <dl className="result-card__stats">
        <div>
          <dt>Monthly repayment</dt>
          <dd>{formatZAR(monthlyRepayment, { cents: true })}</dd>
        </div>
        <div>
          <dt>Loan amount</dt>
          <dd>{formatZAR(loanAmount)}</dd>
        </div>
        <div>
          <dt>Term and rate</dt>
          <dd>{termYears} {termYears === 1 ? "year" : "years"} at {annualRate}%</dd>
        </div>
        <div>
          <dt>Left after repayment</dt>
          <dd className={leftoverAfter < 0 ? "is-negative" : ""}>
            {formatZAR(leftoverAfter, { cents: true })}
          </dd>
        </div>
      </dl>

      {reasons.length > 0 && (
        <ul className="result-card__reasons">
          {reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
      )}
    </section>
  );
}