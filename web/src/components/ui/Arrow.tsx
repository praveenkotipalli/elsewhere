export function Arrow({ className, dir = "right" }: { className?: string; dir?: "right" | "down-right" | "left" }) {
  const rotate = dir === "down-right" ? 45 : dir === "left" ? 180 : 0;
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M0 5h12.5M8.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
