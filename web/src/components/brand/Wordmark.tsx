/** Expanded grotesk wordmark. `fit` draws it edge to edge as SVG text. */
export function Wordmark({ className, fit = false }: { className?: string; fit?: boolean }) {
  if (fit) {
    return (
      <svg viewBox="0 0 1000 132" className={className} role="img" aria-label="Elsewhere">
        <text
          x="0"
          y="118"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          fill="currentColor"
          style={{ fontFamily: "var(--font-sans)", fontSize: 160, fontWeight: 600, fontVariationSettings: '"wdth" 118', letterSpacing: "-0.04em" }}
        >
          ELSEWHERE
        </text>
      </svg>
    );
  }
  return (
    <span
      className={className}
      style={{ fontWeight: 620, fontVariationSettings: '"wdth" 125', letterSpacing: "0.02em" }}
    >
      ELSEWHERE
    </span>
  );
}
