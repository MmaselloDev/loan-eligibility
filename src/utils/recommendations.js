import {
  LIMITS,
  calculateMaxLoan,
  calculateRepayment,
  getAffordability,
  getMockRate,
} from "./calculator";

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function buildOption(type, loanAmount, termYears) {
  const rate = getMockRate(termYears);
  const repayment = calculateRepayment({
    loanAmount,
    annualRatePercent: rate,
    termYears,
  });
  return {
    type, // "lower-amount" | "longer-term" | "lower-and-longer"
    loanAmount,
    termYears,
    rate,
    monthlyPayment: repayment.monthlyPayment,
    totalInterest: repayment.totalInterest,
  };
}

/**
 * Suggest ways to reach an "affordable" result (repayment <= 30% of disposable income).
 * Returns { options: [...], noDisposable: boolean }
 */
export function getRecommendations({
  grossIncome,
  monthlyExpenses,
  loanAmount,
  termYears,
}) {
  const disposable = grossIncome - monthlyExpenses;
  if (disposable <= 0) return { options: [], noDisposable: true };

  const options = [];
  const baseTerm = clamp(
    Math.floor(termYears),
    LIMITS.MIN_TERM_YEARS,
    LIMITS.MAX_TERM_YEARS
  );

  // 1. Same term, smaller loan
  const maxLoanSameTerm = calculateMaxLoan({
    grossIncome,
    monthlyExpenses,
    annualRatePercent: getMockRate(baseTerm),
    termYears: baseTerm,
  });
  if (maxLoanSameTerm >= LIMITS.MIN_LOAN && maxLoanSameTerm < loanAmount) {
    options.push(buildOption("lower-amount", maxLoanSameTerm, baseTerm));
  }

  // 2. Same loan, shortest longer term that becomes affordable
  const loanInRange =
    loanAmount >= LIMITS.MIN_LOAN && loanAmount <= LIMITS.MAX_LOAN;
  let foundLongerTerm = false;

  if (loanInRange) {
    for (let term = baseTerm + 1; term <= LIMITS.MAX_TERM_YEARS; term++) {
      const option = buildOption("longer-term", loanAmount, term);
      const { band } = getAffordability({
        grossIncome,
        monthlyExpenses,
        monthlyRepayment: option.monthlyPayment,
      });
      if (band === "affordable") {
        options.push(option);
        foundLongerTerm = true;
        break;
      }
    }
  }

  // 3. If a longer term alone isn't enough: longest term + the biggest affordable loan
  if (!foundLongerTerm && baseTerm < LIMITS.MAX_TERM_YEARS) {
    const maxTerm = LIMITS.MAX_TERM_YEARS;
    const maxLoanLongTerm = calculateMaxLoan({
      grossIncome,
      monthlyExpenses,
      annualRatePercent: getMockRate(maxTerm),
      termYears: maxTerm,
    });
    const alreadySuggested = options[0]?.loanAmount ?? 0;
    if (
      maxLoanLongTerm >= LIMITS.MIN_LOAN &&
      maxLoanLongTerm < loanAmount &&
      maxLoanLongTerm > alreadySuggested
    ) {
      options.push(buildOption("lower-and-longer", maxLoanLongTerm, maxTerm));
    }
  }

  return { options, noDisposable: false };
}