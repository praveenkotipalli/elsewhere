"use client";

import { useState } from "react";

/**
 * One series of daily counts. Thin bars on a recessive baseline, a hover
 * tooltip per day, and the total as the headline so the chart is never the
 * only way to read the number.
 */
export function DailyBars({
  title,
  data,
  tone = "ink",
}: {
  title: string;
  data: { day: string; value: number }[];
  tone?: "ink" | "signal";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  const W = 600;
  const H = 120;
  const step = W / Math.max(1, data.length);
  const barW = Math.max(1.5, Math.min(14, step - 2));
  const fill = tone === "signal" ? "var(--color-signal)" : "var(--color-ink)";
  const h = hover !== null ? data[hover] : null;
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  return (
    <figure className="flex flex-col gap-4 border-t border-ink/15 pt-4">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="t-meta text-stone">{title}</span>
        <span className="t-meta tabular-nums text-stone" aria-live="polite">
          {h ? `${fmt(h.day)} — ${h.value}` : `${data.length} days`}
        </span>
      </figcaption>
      <p className="text-4xl font-[520] tabular-nums tracking-[-0.04em]">{total}</p>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H + 1}`}
          preserveAspectRatio="none"
          className="block h-28 w-full"
          role="img"
          aria-label={`${title}: ${total} over ${data.length} days, peak ${max === 1 && total === 0 ? 0 : max} in a day`}
          onPointerLeave={() => setHover(null)}
        >
          <line x1="0" x2={W} y1={H + 0.5} y2={H + 0.5} stroke="var(--color-ink)" strokeOpacity="0.15" vectorEffect="non-scaling-stroke" />
          {data.map((d, i) => {
            const bh = d.value === 0 ? 0 : Math.max(2, (d.value / max) * (H - 4));
            const x = i * step + (step - barW) / 2;
            return (
              <g key={d.day} onPointerEnter={() => setHover(i)}>
                <rect x={i * step} y="0" width={step} height={H} fill="transparent" />
                <rect
                  x={x}
                  y={H - bh}
                  width={barW}
                  height={bh}
                  rx={Math.min(2, barW / 2)}
                  fill={fill}
                  opacity={hover === null || hover === i ? 1 : 0.35}
                />
              </g>
            );
          })}
        </svg>
        {data.length > 0 && (
          <div className="t-meta mt-2 flex justify-between text-stone">
            <span>{fmt(data[0].day)}</span>
            <span>{fmt(data[data.length - 1].day)}</span>
          </div>
        )}
      </div>
    </figure>
  );
}
