"use client";

import { useEffect, useId, useRef, useState } from "react";

/*
 * The footer wordmark as a 5×7 bitmap lit by an LED dot-matrix. Every few
 * seconds the WHERE half loses sync like an analogue TV — it tears into
 * horizontal bands that shoot sideways, red and cyan slip out of register,
 * scanlines and a band of snow roll through — and comes back as WEAR, then
 * glitches back. ELSE stays perfectly still throughout.
 */

const GLYPHS: Record<string, string[]> = {
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
};

const COLS = 53; // 9 letters × 5 + 8 gaps
const ROWS = 7;
// Each glyph cell is lit by a LEDS×LEDS cluster of small square LEDs, like a
// dot-matrix sign; the dark gap around each LED is what sells it.
const LEDS = 3;
const LED = 0.21; // LED size, in cell units (pitch is 1 / LEDS)

type Px = readonly [number, number];

const pixels = (word: string, xs: number[]): Px[] =>
  [...word].flatMap((ch, i) =>
    GLYPHS[ch].flatMap((row, y) => [...row].flatMap((on, x) => (on === "#" ? [[xs[i] + x, y] as const] : []))),
  );

const LED_OFFSETS = Array.from({ length: LEDS }, (_, i) => (i + 0.5) / LEDS - LED / 2);
const led = (x: number, y: number) => `M${x.toFixed(3)} ${y.toFixed(3)}h${LED}v${LED}h-${LED}z`;
const toPath = (px: readonly Px[]) =>
  px.map(([x, y]) => LED_OFFSETS.flatMap((oy) => LED_OFFSETS.map((ox) => led(x + ox, y + oy))).join("")).join("");

// ELSE never glitches. WHERE sits on the normal grid; WEAR is spread over the
// same span so the width holds.
const SUFFIX_X = 24; // where ELSE ends
const PREFIX_PATH = toPath(pixels("ELSE", [0, 6, 12, 18]));
const WORDS = {
  where: toPath(pixels("WHERE", [24, 30, 36, 42, 48])),
  wear: toPath(pixels("WEAR", [24, 32, 40, 48])),
};
type Word = keyof typeof WORDS;

// Hold times, and the glitch itself: FRAMES frames, FRAME_MS apart.
const HOLD = { where: 4200, wear: 2400 };
const FRAMES = 14;
const FRAME_MS = 40;

// Channel colours for the colour split: the site's red, and its opposite.
const RED = "var(--color-signal)";
const CYAN = "#5fd3d8";

type Band = { y: number; h: number; dx: number; src: Word; snow: string | null };
type Frame = { bands: Band[]; split: number; jitter: number; flicker: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// A strip of random lit LEDs: the snow of a lost signal.
function snow(y: number, h: number) {
  let d = "";
  const n = Math.round((COLS - SUFFIX_X) * LEDS * h * LEDS * 0.18);
  for (let i = 0; i < n; i++) {
    const x = SUFFIX_X + Math.floor(Math.random() * (COLS - SUFFIX_X) * LEDS) / LEDS + LED_OFFSETS[0];
    const yy = y + Math.floor(Math.random() * h * LEDS) / LEDS + LED_OFFSETS[0];
    d += led(x, yy);
  }
  return d;
}

function tvFrame(from: Word, to: Word, p: number): Frame {
  // Strongest in the middle of the glitch, quiet at the ends.
  const amp = Math.sin(Math.PI * p) * 0.85 + 0.15;
  const bands: Band[] = [];
  for (let y = 0; y < ROWS; ) {
    const h = Math.min(ROWS - y, rand(0.35, 2.2));
    const torn = Math.random() < 0.65 * amp;
    bands.push({
      y,
      h,
      // Lost horizontal sync: most bands shoot sideways, some a long way.
      dx: torn ? rand(-1, 1) * (Math.random() < 0.25 ? 9 : 3.5) * amp : 0,
      // The new word arrives band by band.
      src: Math.random() < p * 1.1 ? to : from,
      snow: Math.random() < 0.12 * amp ? snow(y, h) : null,
    });
    y += h;
  }
  return {
    bands,
    split: rand(0.35, 1.4) * amp,
    jitter: Math.random() < 0.35 ? rand(-0.5, 0.5) * amp : 0,
    flicker: Math.random() < 0.2 ? rand(0.45, 0.8) : 1,
  };
}

export function PixelWordmark({ className }: { className?: string }) {
  const [word, setWord] = useState<Word>("where");
  const [frame, setFrame] = useState<Frame | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const glitchNow = useRef<() => void>(() => {});
  const id = `pw-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const svg = ref.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current: Word = "where";
    let visible = false;
    let busy = false;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let tick: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      clearTimeout(hold);
      if (visible) hold = setTimeout(glitch, HOLD[current]);
    };

    const glitch = () => {
      if (busy) return;
      busy = true;
      clearTimeout(hold);
      const next: Word = current === "where" ? "wear" : "where";
      let i = 0;
      const step = () => {
        if (i < FRAMES) {
          setFrame(tvFrame(current, next, i / (FRAMES - 1)));
          i++;
          tick = setTimeout(step, FRAME_MS);
          return;
        }
        current = next;
        setWord(next);
        setFrame(null);
        busy = false;
        schedule();
      };
      step();
    };
    glitchNow.current = glitch;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else clearTimeout(hold);
    });
    io.observe(svg);

    return () => {
      io.disconnect();
      clearTimeout(hold);
      clearTimeout(tick);
      glitchNow.current = () => {};
    };
  }, []);

  // One copy of the picture, torn into its bands and nudged by `shift`.
  const torn = (f: Frame, fill: string, shift: number) =>
    f.bands.map((b, i) => (
      <g key={i} clipPath={`url(#${id}-band${i})`}>
        <g transform={`translate(${b.dx + shift} 0)`} fill={fill}>
          {b.snow ? <path d={b.snow} /> : <use href={`#${id}-${b.src}`} />}
        </g>
      </g>
    ));

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      className={className}
      role="img"
      aria-label="Elsewhere"
      overflow="visible"
      onPointerEnter={(e) => e.pointerType === "mouse" && glitchNow.current()}
    >
      <defs>
        {/* The LEDs bleed a little light into the dark around them. */}
        <filter id={`${id}-glow`} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.12" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id={`${id}-where`} d={WORDS.where} />
        <path id={`${id}-wear`} d={WORDS.wear} />
        {frame && (
          <>
            {/* Bands stop at ELSE's edge, so a tear never spills over it. */}
            {frame.bands.map((b, i) => (
              <clipPath key={i} id={`${id}-band${i}`}>
                <rect x={SUFFIX_X - 0.5} y={b.y} width={COLS - SUFFIX_X + 2} height={b.h} />
              </clipPath>
            ))}
            <pattern id={`${id}-scan`} width="1" height={1 / LEDS} patternUnits="userSpaceOnUse">
              <rect width="1" height={0.5 / LEDS} fill="var(--color-ink)" opacity="0.55" />
            </pattern>
          </>
        )}
      </defs>

      <path d={PREFIX_PATH} fill="currentColor" filter={`url(#${id}-glow)`} />
      {frame ? (
        <g filter={`url(#${id}-glow)`} transform={`translate(0 ${frame.jitter})`} opacity={frame.flicker}>
          <g style={{ mixBlendMode: "screen" }}>{torn(frame, RED, -frame.split)}</g>
          <g style={{ mixBlendMode: "screen" }}>{torn(frame, CYAN, frame.split)}</g>
          <g style={{ mixBlendMode: "screen" }}>{torn(frame, "currentColor", 0)}</g>
          <rect x={SUFFIX_X - 0.5} y={0} width={COLS - SUFFIX_X + 2} height={ROWS} fill={`url(#${id}-scan)`} />
        </g>
      ) : (
        <use href={`#${id}-${word}`} fill="currentColor" filter={`url(#${id}-glow)`} />
      )}
    </svg>
  );
}
