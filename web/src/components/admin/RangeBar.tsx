import Link from "next/link";
import { RANGES, toQuery } from "@/lib/admin";

/** Date range as plain links: shareable URLs, no client JS. */
export function RangeBar({ current, base, sp }: { current: string; base: string; sp: Record<string, string | undefined> }) {
  return (
    <nav aria-label="Date range" className="flex border border-ink/15">
      {RANGES.map((r) => (
        <Link
          key={r.key}
          href={`${base}${toQuery(sp, { range: r.key, from: undefined, to: undefined })}`}
          aria-current={current === r.key ? "true" : undefined}
          className={`t-meta flex h-9 items-center px-3 transition-colors [&:not(:first-child)]:border-l [&:not(:first-child)]:border-ink/15 ${
            current === r.key ? "bg-ink text-bone" : "hover:bg-bone-2"
          }`}
        >
          {r.label}
        </Link>
      ))}
    </nav>
  );
}
