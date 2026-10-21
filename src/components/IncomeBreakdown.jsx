import ProgressBar from "./ProgressBar";
import DonutChart from "./DonutChart";
import { formatZAR } from "../utils/formatCurrency";
import "./IncomeBreakdown.css";

export default function IncomeBreakdown({
  grossIncome,
  monthlyExpenses,
  monthlyRepayment,
  affordability, // the object returned by getAffordability / getDecision
}) {
  const { remainingAfterRepayment, ratio, band } = affordability;

  const hasLeftover = remainingAfterRepayment > 0;
  const shortfall = hasLeftover ? 0 : Math.abs(remainingAfterRepayment);

  const segments = [
    { label: "Expenses", value: monthlyExpenses, color: "var(--chart-expenses, #64748b)" },
    { label: "Repayment", value: monthlyRepayment, color: "var(--chart-repayment, #2563eb)" },
    { label: "Left over", value: remainingAfterRepayment, color: "var(--chart-leftover, #16a34a)" },
  ];

  const ariaLabel =
    `Monthly income breakdown: expenses ${formatZAR(monthlyExpenses)}, ` +
    `repayment ${formatZAR(monthlyRepayment, { cents: true })}, ` +
    (hasLeftover
      ? `left over ${formatZAR(remainingAfterRepayment, { cents: true })}.`
      : "nothing left over.");

  return (
    <section className="breakdown" aria-labelledby="breakdown-heading">
      <h3 id="breakdown-heading" className="breakdown__title">
        Where your monthly income goes
      </h3>

      <ProgressBar ratio={ratio} band={band} />

      <div className="breakdown__body">
        <DonutChart segments={segments} ariaLabel={ariaLabel} />

        <ul className="breakdown__summary">
          <li>
            <span className="dot" style={{ background: segments[0].color }} />
            Expenses: <strong>{formatZAR(monthlyExpenses)}</strong>
          </li>
          <li>
            <span className="dot" style={{ background: segments[1].color }} />
            Repayment: <strong>{formatZAR(monthlyRepayment, { cents: true })}</strong>
          </li>
          <li>
            <span className="dot" style={{ background: segments[2].color }} />
            Left over:{" "}
            <strong>{formatZAR(hasLeftover ? remainingAfterRepayment : 0, { cents: true })}</strong>
          </li>
        </ul>
      </div>

      {!hasLeftover && (
        <p className="breakdown__note" role="status">
          {shortfall > 0
            ? `This loan would leave you ${formatZAR(shortfall, { cents: true })} short each month.`
            : "This loan would use all of your income each month, leaving nothing over."}
        </p>
      )}
    </section>
  );
}