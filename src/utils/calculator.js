/**
 * Loan Eligibility Simulator - calculation rules.
 * Pure functions only: no DOM, no React, no side effects.
 * See RULES.md for the reasoning behind every number in here.
 */

// ---------- Rules (single source of truth) ----------

export const THRESHOLDS = {
  /** Repayment up to 30% of disposable income -> affordable */
  AFFORDABLE_MAX_RATIO: 0.3,
  /** Repayment up to 45% of disposable income -> stretched (manual review) */
  STRETCHED_MAX_RATIO: 0.45,
};

export const LIMITS = {
  MIN_LOAN: 5000,
  MAX_LOAN: 500000,
  MIN_TERM_YEARS: 1,
  MAX_TERM_YEARS: 7,
};

/** Mock annual rates (%) by term. Not real bank rates. */
export const MOCK_RATES = [
  { maxTermYears: 2, annualRatePercent: 13 },
  { maxTermYears: 4, annualRatePercent: 14 },
  { maxTermYears: 5, annualRatePercent: 15 },
  { maxTermYears: 7, annualRatePercent: 16 },
];

// ---------- Helpers ----------

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function assertFiniteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a valid number`);
  }
}

function assertPositive(value, name) {
  assertFiniteNumber(value, name);
  if (value <= 0) throw new RangeError(`${name} must be greater than 0`);
}

function assertNotNegative(value, name) {
  assertFiniteNumber(value, name);
  if (value < 0) throw new RangeError(`${name} cannot be negative`);
}

/** Present value factor: how much loan each R1 of monthly repayment "buys". */
function annuityFactor(annualRatePercent, months) {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return months; // interest-free: simple division
  return (1 - Math.pow(1 + r, -months)) / r;
}

// ---------- Public API ----------

/** Look up the mock interest rate (%) for a term in years. */
export function getMockRate(termYears) {
  assertPositive(termYears, "termYears");
  const band = MOCK_RATES.find((b) => termYears <= b.maxTermYears);
  return (band ?? MOCK_RATES[MOCK_RATES.length - 1]).annualRatePercent;
}

/**
 * Monthly repayment, total repayment and total interest.
 * Formula: P * r / (1 - (1 + r)^-n), with r = annual rate / 12, n = months.
 */
export function calculateRepayment({ loanAmount, annualRatePercent, termYears }) {
  assertPositive(loanAmount, "loanAmount");
  assertNotNegative(annualRatePercent, "annualRatePercent");
  assertPositive(termYears, "termYears");

  const months = Math.round(termYears * 12);
  const rawMonthly = loanAmount / annuityFactor(annualRatePercent, months);
  const totalRepayment = round2(rawMonthly * months);

  return {
    monthlyPayment: round2(rawMonthly),
    totalRepayment,
    totalInterest: round2(totalRepayment - loanAmount),
    months,
  };
}

/**
 * Largest loan the person can afford, based on the "affordable" threshold.
 * Capped at the product maximum and floored to a whole rand.
 */
export function calculateMaxLoan({
  grossIncome,
  monthlyExpenses,
  annualRatePercent,
  termYears,
}) {
  assertNotNegative(grossIncome, "grossIncome");
  assertNotNegative(monthlyExpenses, "monthlyExpenses");
  assertNotNegative(annualRatePercent, "annualRatePercent");
  assertPositive(termYears, "termYears");

  const disposable = grossIncome - monthlyExpenses;
  if (disposable <= 0) return 0;

  const maxRepayment = disposable * THRESHOLDS.AFFORDABLE_MAX_RATIO;
  const months = Math.round(termYears * 12);
  const rawMax = maxRepayment * annuityFactor(annualRatePercent, months);

  return Math.min(Math.floor(rawMax), LIMITS.MAX_LOAN);
}

/**
 * How heavy the repayment is relative to disposable income.
 * band: "affordable" | "stretched" | "unaffordable"
 * ratio is null when there is no disposable income (avoids Infinity in the UI).
 */
export function getAffordability({ grossIncome, monthlyExpenses, monthlyRepayment }) {
  assertNotNegative(grossIncome, "grossIncome");
  assertNotNegative(monthlyExpenses, "monthlyExpenses");
  assertNotNegative(monthlyRepayment, "monthlyRepayment");

  const disposableIncome = round2(grossIncome - monthlyExpenses);
  const remainingAfterRepayment = round2(disposableIncome - monthlyRepayment);

  if (disposableIncome <= 0) {
    return { disposableIncome, ratio: null, remainingAfterRepayment, band: "unaffordable" };
  }

  const ratio = monthlyRepayment / disposableIncome;
  let band = "unaffordable";
  if (ratio <= THRESHOLDS.AFFORDABLE_MAX_RATIO) band = "affordable";
  else if (ratio <= THRESHOLDS.STRETCHED_MAX_RATIO) band = "stretched";

  return { disposableIncome, ratio, remainingAfterRepayment, band };
}

/**
 * Final decision: "approved" | "review" | "declined", with human-readable reasons.
 * annualRatePercent is optional; the mock rate for the term is used if omitted.
 */
export function getDecision({
  grossIncome,
  monthlyExpenses,
  loanAmount,
  termYears,
  annualRatePercent,
}) {
  const rate = annualRatePercent ?? getMockRate(termYears);
  const repayment = calculateRepayment({ loanAmount, annualRatePercent: rate, termYears });
  const affordability = getAffordability({
    grossIncome,
    monthlyExpenses,
    monthlyRepayment: repayment.monthlyPayment,
  });
  const maxLoan = calculateMaxLoan({
    grossIncome,
    monthlyExpenses,
    annualRatePercent: rate,
    termYears,
  });

  const reasons = [];
  let decision;

  if (loanAmount < LIMITS.MIN_LOAN || loanAmount > LIMITS.MAX_LOAN) {
    reasons.push(
      `Loan amount must be between R${LIMITS.MIN_LOAN} and R${LIMITS.MAX_LOAN}.`
    );
  }
  if (termYears < LIMITS.MIN_TERM_YEARS || termYears > LIMITS.MAX_TERM_YEARS) {
    reasons.push(
      `Loan term must be between ${LIMITS.MIN_TERM_YEARS} and ${LIMITS.MAX_TERM_YEARS} years.`
    );
  }

  if (reasons.length > 0) {
    decision = "declined";
  } else if (affordability.band === "affordable") {
    decision = "approved";
    reasons.push("Repayment is within 30% of your disposable income.");
  } else if (affordability.band === "stretched") {
    decision = "review";
    reasons.push("Repayment is between 30% and 45% of your disposable income.");
  } else {
    decision = "declined";
    reasons.push(
      affordability.ratio === null
        ? "Your expenses are equal to or higher than your income."
        : "Repayment is above 45% of your disposable income."
    );
  }

  return { decision, reasons, rate, repayment, affordability, maxLoan };
}
