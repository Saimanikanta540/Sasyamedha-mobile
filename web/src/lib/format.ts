const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(n: number): string {
  return `₹${inr.format(Math.round(n))}`;
}

export function formatSignedINR(n: number): string {
  const rounded = Math.round(n);
  if (rounded === 0) return `₹0`;
  const sign = rounded > 0 ? "+" : "−";
  return `${sign}₹${inr.format(Math.abs(rounded))}`;
}
