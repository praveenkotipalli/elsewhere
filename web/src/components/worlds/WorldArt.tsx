import type { ReactNode } from "react";

/**
 * Original, generative placeholder art for worlds that have no licensed cover yet.
 * Deliberately abstract: no likenesses, characters, logos or symbols from any series.
 * Deterministic per slug, so a world always gets the same picture.
 */
export const PATTERNS = [
  "speedlines",
  "waves",
  "spiral",
  "ink",
  "slash",
  "halftone",
  "rings",
  "calm",
  "portrait-grain",
  "portrait-bands",
  "portrait-dust",
  "portrait-lines",
] as const;

export type Pattern = (typeof PATTERNS)[number];

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function WorldArt({
  pattern,
  accent,
  seed,
  className = "",
  intensity = 1,
}: {
  pattern: string | null;
  accent: string;
  seed: string;
  className?: string;
  /** 0–1: how strongly the marks read. Backdrops use a low value. */
  intensity?: number;
}) {
  const r = rng(seed);
  const o = (v: number) => Math.min(1, v * intensity);
  let body: ReactNode = null;

  switch (pattern) {
    case "speedlines": {
      // Manga focus lines converging on an off-centre point.
      const cx = 380 + r() * 240;
      const cy = 420 + r() * 200;
      const lines = Array.from({ length: 96 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2 + r() * 0.05;
        const inner = 170 + r() * 190;
        const w = 1 + r() * 7;
        const x1 = cx + Math.cos(a) * inner;
        const y1 = cy + Math.sin(a) * inner;
        const x2 = cx + Math.cos(a) * 1400;
        const y2 = cy + Math.sin(a) * 1400;
        const x3 = cx + Math.cos(a + w / 1400) * 1400;
        const y3 = cy + Math.sin(a + w / 1400) * 1400;
        return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
      }).join("");
      body = <path d={lines} fill={accent} opacity={o(0.55)} />;
      break;
    }
    case "waves": {
      body = Array.from({ length: 22 }, (_, i) => {
        const y = 60 + i * 52;
        const amp = 10 + r() * 22;
        const len = 120 + r() * 80;
        let d = `M-20 ${y}`;
        let up = true;
        for (let x = -20; x <= 1020; x += len / 2) {
          d += ` Q${(x + len / 4).toFixed(1)} ${(y + (up ? -amp : amp)).toFixed(1)} ${(x + len / 2).toFixed(1)} ${y}`;
          up = !up;
        }
        return <path key={i} d={d} fill="none" stroke={accent} strokeWidth={1.5 + (i % 3)} opacity={o(0.25 + (i % 4) * 0.12)} />;
      });
      break;
    }
    case "spiral": {
      const cx = 500 + (r() - 0.5) * 120;
      const cy = 640 + (r() - 0.5) * 120;
      let d = `M${cx} ${cy}`;
      for (let t = 0; t < 60; t += 0.08) d += ` L${(cx + Math.cos(t) * t * 11).toFixed(1)} ${(cy + Math.sin(t) * t * 11).toFixed(1)}`;
      body = <path d={d} fill="none" stroke={accent} strokeWidth={5} opacity={o(0.6)} />;
      break;
    }
    case "ink": {
      body = (
        <>
          <filter id={`ink-${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={Math.floor(r() * 100)} />
            <feDisplacementMap in="SourceGraphic" scale="140" />
          </filter>
          <g filter={`url(#ink-${seed})`}>
            {Array.from({ length: 5 }, (_, i) => (
              <circle key={i} cx={200 + r() * 600} cy={250 + r() * 800} r={80 + r() * 220} fill={accent} opacity={o(0.22 + r() * 0.3)} />
            ))}
          </g>
        </>
      );
      break;
    }
    case "slash": {
      body = Array.from({ length: 7 }, (_, i) => {
        const x = -200 + i * 190 + r() * 60;
        const w = 8 + r() * 60;
        return <path key={i} d={`M${x} 1400 L${x + 900} -100 L${x + 900 + w} -100 L${x + w} 1400Z`} fill={accent} opacity={o(0.15 + r() * 0.5)} />;
      });
      break;
    }
    case "halftone": {
      const dots: ReactNode[] = [];
      for (let y = 0; y < 1333; y += 34) {
        for (let x = 0; x < 1000; x += 34) {
          const t = 1 - Math.hypot(x - 700, y - 400) / 1100;
          if (t > 0.05) dots.push(<circle key={`${x}-${y}`} cx={x + ((y / 34) % 2) * 17} cy={y} r={Math.max(0.5, t * 14)} fill={accent} />);
        }
      }
      body = <g opacity={o(0.7)}>{dots}</g>;
      break;
    }
    case "rings": {
      body = Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={500} cy={666} r={40 + i * 55} fill="none" stroke={accent} strokeWidth={i % 3 === 0 ? 3 : 1} opacity={o(0.5 - i * 0.025)} />
      ));
      break;
    }
    case "portrait-bands": {
      body = Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={0} y={i * 222} width={1000} height={222} fill={accent} opacity={o(0.08 + i * 0.06)} />
      ));
      break;
    }
    case "portrait-lines": {
      body = Array.from({ length: 60 }, (_, i) => (
        <rect key={i} x={i * 17} y={0} width={1} height={1333} fill={accent} opacity={o(0.25)} />
      ));
      break;
    }
    case "portrait-dust": {
      body = (
        <>
          <radialGradient id={`dust-${seed}`} cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor={accent} stopOpacity={o(0.55)} />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <rect width="1000" height="1333" fill={`url(#dust-${seed})`} />
        </>
      );
      break;
    }
    case "portrait-grain":
    case "calm":
    default: {
      body = (
        <>
          <linearGradient id={`calm-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity={o(pattern === "calm" ? 0.1 : 0.35)} />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </linearGradient>
          <rect width="1000" height="1333" fill={`url(#calm-${seed})`} />
        </>
      );
    }
  }

  return (
    <svg viewBox="0 0 1000 1333" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {body}
    </svg>
  );
}
