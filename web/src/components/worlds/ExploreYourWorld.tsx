import Image from "next/image";
import Link from "next/link";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { pad } from "@/lib/format";
import { FAMILIES } from "@/lib/worlds/families";
import { anton } from "@/lib/worlds/themes/anime";
import { bodoni } from "@/lib/worlds/themes/icon";
import { WorldArt } from "./WorldArt";

export type RoomData = {
  key: string;
  count: number;
  /** Names previewed inside the room. */
  names: string[];
  image?: { src: string; alt: string } | null;
};

/**
 * The doors into discovery. Each room is already dressed in the world it opens
 * onto, so the visitor gets a taste of the transformation before clicking.
 */
export function ExploreYourWorld({
  rooms,
  heading = true,
  className = "",
}: {
  rooms: RoomData[];
  heading?: boolean;
  className?: string;
}) {
  const byKey = new Map(rooms.map((r) => [r.key, r]));
  const families = FAMILIES.filter((f) => byKey.has(f.key));

  return (
    <section aria-labelledby={heading ? "explore-title" : undefined} className={`py-[clamp(5rem,11vw,10rem)] ${className}`}>
      {heading && (
        <div className="gutter grid gap-y-8 pb-12 md:grid-cols-12 md:gap-x-6 md:pb-16">
          <p className="t-meta text-stone md:col-span-3">(Explore your world)</p>
          <Lines
            as="h2"
            id="explore-title"
            lines={["Tell us who you are.", <span key="v" className="t-voice">We&rsquo;ll show you what belongs.</span>]}
            className="t-display md:col-span-9"
          />
        </div>
      )}

      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:grid md:snap-none md:grid-cols-12 md:gap-4 md:overflow-visible">
        {families.map((family, i) => {
          const room = byKey.get(family.key)!;
          const span = [
            "md:col-span-7 md:h-[min(78svh,44rem)]",
            "md:col-span-5 md:h-[min(78svh,44rem)] md:mt-24",
            // Essentials rises into the space the dropped Anime room leaves under Style Icons.
            "md:col-span-5 md:h-[min(62svh,36rem)] md:-mt-24",
            "md:col-span-7 md:h-[min(62svh,36rem)]",
          ][i % 4];
          return (
            <li key={family.key} className={`w-[82vw] shrink-0 snap-center md:w-auto ${span}`}>
              <Reveal kind="fade" delay={(i % 2) * 120} className="h-[118vw] max-h-[34rem] md:h-full md:max-h-none">
                <Room family={family} room={room} index={i} />
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Room({ family, room, index }: { family: (typeof FAMILIES)[number]; room: RoomData; index: number }) {
  const href = `/${family.key}`;
  const meta = (
    <span className="t-meta flex justify-between">
      <span>
        {pad(index + 1)} — {family.eyebrow}
      </span>
      <span>
        {pad(room.count)} {family.unit}
      </span>
    </span>
  );
  const enter = (
    <span className="t-meta flex items-center gap-2 transition-[gap] duration-500 group-hover:gap-4">
      Enter <span aria-hidden>→</span>
    </span>
  );
  const base = "group relative flex h-full flex-col justify-between overflow-hidden p-5 md:p-7";

  switch (family.card) {
    case "portrait":
      // Style icons: warm magazine paper, serif, the names stacked like a masthead.
      return (
        <Link href={href} className={`${base} bg-[#e7ddcf] text-[#1b1611]`}>
          <WorldArt pattern="portrait-lines" accent="#8a6b4f" seed="room-icons" intensity={0.5} className="absolute inset-0 size-full" />
          {meta}
          <span className="relative flex flex-col gap-5">
            <span className={`${bodoni.className} text-[clamp(3rem,7vw,7.5rem)] italic leading-[0.85] tracking-[-0.04em] transition-[letter-spacing] duration-700 group-hover:tracking-[-0.01em]`}>
              {family.name}
            </span>
            <span className={`${bodoni.className} max-w-[26ch] text-lg leading-snug opacity-80`}>
              {room.names.join(" · ")}
            </span>
            <span className="flex items-end justify-between gap-6 border-t border-[#1b1611]/20 pt-4">
              <span className="max-w-[32ch] text-sm">{family.line}</span>
              {enter}
            </span>
          </span>
        </Link>
      );
    case "poster":
      // Anime: night, speed lines, condensed caps — a preview of the whole site changing.
      return (
        <Link href={href} className={`${base} bg-[#0c0b0d] text-[#f2eee6]`}>
          <WorldArt
            pattern="speedlines"
            accent="#d8402f"
            seed="room-anime"
            intensity={0.8}
            className="absolute inset-0 size-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-110 group-hover:rotate-2"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden />
          <span className="relative">{meta}</span>
          <span className="relative flex flex-col gap-4">
            <span className={`${anton.className} text-[clamp(4.5rem,11vw,10rem)] uppercase leading-[0.82] transition-transform duration-300 group-hover:-translate-y-2`}>
              {family.name}
            </span>
            <span className="t-meta flex flex-wrap gap-x-3 gap-y-1 opacity-80">{room.names.map((n) => <span key={n}>{n}</span>)}</span>
            <span className="flex items-end justify-between gap-6 border-t border-white/20 pt-4">
              <span className="max-w-[30ch] text-sm">{family.line}</span>
              {enter}
            </span>
          </span>
        </Link>
      );
    case "calm":
      // Essentials: quiet paper, a real photograph, light type. Nothing moves much.
      return (
        <Link href={href} className={`${base} bg-[#f1eee8] text-[#2b2926]`}>
          {room.image && (
            <span className="absolute inset-y-0 right-0 w-[52%] overflow-hidden">
              <Image
                src={room.image.src}
                alt={room.image.alt}
                fill
                sizes="(min-width: 768px) 22vw, 45vw"
                className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </span>
          )}
          <span className="t-meta relative flex w-[46%] flex-col gap-1">
            <span>
              {pad(index + 1)} — {family.eyebrow}
            </span>
            <span className="opacity-60">
              {pad(room.count)} {family.unit}
            </span>
          </span>
          <span className="relative flex w-[46%] flex-col gap-4">
            <span className="text-[clamp(2.4rem,4.6vw,4.5rem)] font-[380] leading-[0.95] tracking-[-0.035em]">{family.name}</span>
            <span className="text-sm leading-relaxed text-[#6d685f]">{family.line}</span>
            {enter}
          </span>
        </Link>
      );
    default:
      // Aesthetics: the house style, a typographic index of feelings.
      return (
        <Link href={href} className={`${base} grain bg-ink text-bone`}>
          {meta}
          <span className="relative flex flex-col">
            {room.names.map((n, j) => (
              <span
                key={n}
                className="border-b border-char-2 py-1.5 text-[clamp(1.6rem,3.2vw,3rem)] font-[540] leading-[1] tracking-[-0.045em] text-fog transition-colors duration-500 group-hover:text-bone"
                style={{ transitionDelay: `${j * 60}ms` }}
              >
                {n}
              </span>
            ))}
          </span>
          <span className="relative flex items-end justify-between gap-6 pt-6">
            <span className="max-w-[32ch] text-sm text-fog">{family.line}</span>
            {enter}
          </span>
        </Link>
      );
  }
}
