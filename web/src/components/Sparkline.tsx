"use client";

export default function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 280;
  const h = 60;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" role="img" aria-label="price trend">
      <polyline points={points} fill="none" stroke="var(--color-primary-600)" strokeWidth="2.5" />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - ((v - min) / range) * (h - 8) - 4}
          r={i === values.length - 1 ? 3.5 : 0}
          fill="var(--color-primary-700)"
        />
      ))}
    </svg>
  );
}
