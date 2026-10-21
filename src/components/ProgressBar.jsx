import { THRESHOLDS } from "../utils/calculator";
import "./ProgressBar.css";

const BAND_TEXT = {
  affordable: "Affordable",
  stretched: "Stretched",
  unaffordable: "Unaffordable",
};

const TONE = {
  affordable: "ok",
  stretched: "warn",
  unaffordable: "danger",
};

export default function ProgressBar({ ratio, band }) {
  const hasRatio = ratio !== null && Number.isFinite(ratio);
  const pct = hasRatio ? ratio * 100 : 0;
  const fill = Math.min(Math.max(pct, 0), 100);
  const label = "Repayment as a share of disposable income";

  return (
    <div className="progress">
      <div className="progress__head">
        <span id="progress-label">{label}</span>
        <strong>
          {hasRatio ? `${Math.round(pct)}%` : "n/a"} · {BAND_TEXT[band]}
        </strong>
      </div>

      <div
        className="progress__track"
        role="progressbar"
        aria-labelledby="progress-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={hasRatio ? Math.round(fill) : undefined}
        aria-valuetext={
          hasRatio
            ? `${Math.round(pct)} percent, ${BAND_TEXT[band]}`
            : "No disposable income"
        }
      >
        <div
          className={`progress__fill progress__fill--${TONE[band]}`}
          style={{ width: `${fill}%` }}
        />
        <span
          className="progress__marker"
          style={{ left: `${THRESHOLDS.AFFORDABLE_MAX_RATIO * 100}%` }}
          aria-hidden="true"
        />
        <span
          className="progress__marker"
          style={{ left: `${THRESHOLDS.STRETCHED_MAX_RATIO * 100}%` }}
          aria-hidden="true"
        />
      </div>

      {!hasRatio && (
        <p className="progress__note">
          Your expenses are equal to or higher than your income, so there is
          no disposable income to repay from.
        </p>
      )}
    </div>
  );
}