import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { imageUrl } from "@/lib/images";
import type { DiscoveryWorld } from "@/lib/types";
import { worldHref } from "@/lib/worlds/families";
import { anton } from "@/lib/worlds/themes/anime";
import { bodoni } from "@/lib/worlds/themes/icon";
import { pad } from "@/lib/format";
import { WorldArt } from "./WorldArt";

export const initials = (name: string) =>
  name
    .replace(/,.*$/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Style icon: a magazine-feature portrait tile. Without licensed photography the
 * "portrait" is typographic — giant initials cropped off the edge over a tinted
 * field — so no likeness is ever used.
 */
export function PortraitCard({ world, index, className = "" }: { world: DiscoveryWorld; index: number; className?: string }) {
  const accent = world.accent ?? "#8e8b85";
  return (
    <Link
      href={worldHref(world.kind, world.slug)}
      className={`group relative block aspect-[3/4] overflow-hidden text-[#17130f] ${className}`}
      style={{ background: `color-mix(in oklab, ${accent} 22%, #ece7de)` } as CSSProperties}
      aria-label={`${world.name}-inspired style: ${world.eyebrow ?? ""}`}
    >
      {world.cover_src ? (
        <Image
          src={imageUrl(world.cover_src)}
          alt={world.cover_alt ?? ""}
          fill
          sizes="(min-width: 768px) 30vw, 80vw"
          className="object-cover grayscale transition-[scale,filter] duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:grayscale-0"
        />
      ) : (
        <>
          <WorldArt
            pattern={world.pattern}
            accent={accent}
            seed={world.slug}
            className="absolute inset-0 size-full transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
          <span
            aria-hidden
            className={`${bodoni.className} pointer-events-none absolute -right-[0.12em] top-[8%] select-none text-[clamp(9rem,24vw,19rem)] italic leading-[0.8] tracking-[-0.06em] opacity-90 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:-translate-x-[4%]`}
            style={{ color: `color-mix(in oklab, ${accent} 70%, #17130f)` }}
          >
            {initials(world.name)}
          </span>
        </>
      )}

      <span className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
        <span className="t-meta flex justify-between">
          <span>Inspired by</span>
          <span>{pad(index + 1)}</span>
        </span>
        <span className="flex flex-col gap-3">
          <span className={`${bodoni.className} text-[clamp(2rem,3.6vw,3.25rem)] leading-[0.95] tracking-[-0.03em]`}>
            {world.name}
          </span>
          <span className="t-meta">{world.eyebrow}</span>
          <span className="flex items-center justify-between gap-4 border-t border-current/25 pt-3">
            <span className="text-sm leading-snug opacity-80">{world.tagline}</span>
            <span className="t-meta shrink-0 transition-transform duration-500 group-hover:translate-x-1">Explore →</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * Anime world: a night poster in the world's colour, with original abstract art
 * (never series artwork) and the name set big in condensed caps.
 */
export function PosterCard({ world, index, className = "" }: { world: DiscoveryWorld; index: number; className?: string }) {
  const accent = world.accent ?? "#c73a1f";
  return (
    <Link
      href={worldHref(world.kind, world.slug)}
      className={`group relative block aspect-[3/4] overflow-hidden text-[#f2eee6] ${className}`}
      style={{ background: `color-mix(in oklab, ${accent} 12%, #0b0b0c)` }}
      aria-label={`${world.name} world`}
    >
      {world.cover_src ? (
        <Image
          src={imageUrl(world.cover_src)}
          alt={world.cover_alt ?? ""}
          fill
          sizes="(min-width: 768px) 25vw, 75vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <WorldArt
          pattern={world.pattern}
          accent={accent}
          seed={world.slug}
          className="absolute inset-0 size-full transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:rotate-[1.5deg] group-hover:scale-[1.12]"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
        style={{ background: accent }}
      />
      <span className="relative z-10 flex h-full flex-col justify-between p-4 md:p-5">
        <span className="t-meta flex justify-between">
          <span>{world.eyebrow}</span>
          <span>{pad(index + 1)}</span>
        </span>
        <span className="flex flex-col gap-2">
          <span
            className={`${anton.className} text-[clamp(2.4rem,4.4vw,4.25rem)] uppercase leading-[0.88] transition-transform duration-300 group-hover:-translate-y-1`}
          >
            {world.name}
          </span>
          <span className="text-sm leading-snug opacity-75">{world.tagline}</span>
        </span>
      </span>
    </Link>
  );
}
