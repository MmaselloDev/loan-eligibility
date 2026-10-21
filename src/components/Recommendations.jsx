import { formatZAR } from "../utils/formatCurrency";
import "./Recommendations.css";

function describe(o, original) {
  const years = (n) => `${n} ${n === 1 ? "year" : "years"}`;
  switch (o.type) {
    case "lower-amount":
      return {
        title: "Borrow less",
        text: `Borrow up to ${formatZAR(o.loanAmount)} over the same ${years(o.termYears)}.`,
      };
    case "longer-term":
      return {
        title: "Take a longer term",
        text: `Keep your ${formatZAR(original.loanAmount)} and repay it over ${years(o.termYears)} instead.`,
      };
    default:
      return {
        title: "Borrow less over a longer term",
        text: `Borrow up to ${formatZAR(o.loanAmount)} over ${years(o.termYears)}.`,
      };
  }
}

export default function Recommendations({
  decision,
  options,
  noDisposable,
  original,
}) {
  const heading =
    decision === "review" ? "How to get a clear approval" : "What could work instead";

  return (
    <section className="recommendations" aria-labelledby="reco-heading">
      <h3 id="reco-heading">{heading}</h3>

      {noDisposable && (
        <p>
          Your expenses are equal to or higher than your income, so no loan amount or term
          would be affordable. Lowering your expenses or increasing your income is the
          way forward.
        </p>
      )}

      {!noDisposable && options.length === 0 && (
        <p>
          We couldn't find an affordable option within the allowed loan range and term.
          See the reasons above.
        </p>
      )}

      {options.length > 0 && (
        <ul className="recommendations__list">
          {options.map((o) => {
            const { title, text } = describe(o, original);
            return (
              <li key={o.type} className="recommendations__item">
                <strong>{title}</strong>
                <p>{text}</p>
                <p className="recommendations__numbers">
                  Monthly repayment: {formatZAR(o.monthlyPayment, { cents: true })} at{" "}
                  {o.rate}%. Total interest: {formatZAR(o.totalInterest)}.
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {options.some((o) => o.termYears > original.termYears) && (
        <p className="recommendations__note">
          A longer term lowers the monthly repayment, but you pay more interest overall.
        </p>
      )}
    </section>
  );
}