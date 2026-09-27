"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pad } from "@/lib/format";

export type VibeRow = {
  slug: string;
  name: string;
  tagline: string | null;
  count: number;
  image: { src: string; alt: string } | null;
};

/**
 * Shop by feeling. Big type rows; on desktop a photograph follows the cursor and
 * the other rows fall back, on phones each row carries its own small frame.
 */
export function VibeIndex({ vibes }: { vibes: VibeRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = preview.current;
    const host = list.current;
    if (!el || !host || !window.matchMedia("(pointer: fine)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${((tx - x) * 0.02).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    host.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="relative">
      <ul ref={list} className="relative border-t border-char-2" onPointerLeave={() => setActive(null)}>
        {vibes.map((v, i) => {
          const dim = active !== null && active !== i;
          return (
            <li key={v.slug} className="border-b border-char-2">
              <Link
                href={`/vibe/${v.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 py-5 transition-opacity duration-500 md:grid-cols-12 md:gap-x-6 md:py-7 ${
                  dim ? "md:opacity-30" : "opacity-100"
                }`}
              >
                <span className="t-meta self-start pt-2 text-ash md:col-span-1">({pad(i + 1)})</span>
                <span className="min-w-0 md:col-span-7">
                  <span className="block text-[clamp(2.1rem,6.4vw,6.25rem)] font-[540] leading-[0.92] tracking-[-0.05em] transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover:translate-x-[2%]">
                    {v.name}
                  </span>
                  <span className="t-voice mt-1 block text-lg text-ash md:hidden">{v.tagline}</span>
                </span>
                <span className="t-voice hidden text-2xl text-fog md:col-span-3 md:block">{v.tagline}</span>
                <span className="flex items-center gap-3 md:col-span-1 md:justify-end">
                  {v.image && (
                    <span className="relative block aspect-[3/4] w-14 overflow-hidden bg-char md:hidden">
                      <Image src={v.image.src} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                  )}
                  <span className="t-meta hidden text-ash md:inline">{pad(v.count)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 hidden aspect-[3/4] w-[17vw] min-w-48 md:block"
      >
        {vibes.map((v, i) =>
          v.image ? (
            <div
              key={v.slug}
              className="absolute inset-0 overflow-hidden transition-[clip-path,opacity] duration-700 ease-[var(--ease-out-expo)]"
              style={{
                clipPath: active === i ? "inset(0 0 0 0)" : "inset(50% 50% 50% 50%)",
                opacity: active === i ? 1 : 0,
              }}
            >
              <Image src={v.image.src} alt="" fill sizes="17vw" quality={70} className="object-cover" />
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
