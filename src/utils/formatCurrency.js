const zar0 = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

const zar2 = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Whole rands for big amounts (loan, income), cents for repayments
export const formatZAR = (value, { cents = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "R 0";
  return (cents ? zar2 : zar0).format(n);
};