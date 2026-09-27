import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import objects from "@/assets/world-objects.jpg";
import room from "@/assets/world-room.jpg";
import wear from "@/assets/world-wear.jpg";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { pad } from "@/lib/format";

type World = {
  name: string;
  state: "Now" | "Testing" | "Coming soon";
  note: string;
  items: string[];
  href?: string;
  image?: StaticImageData;
  alt?: string;
};

// Honest about where each world stands: only Wear exists as a drop.
const WORLDS: World[] = [
  { name: "Wear", state: "Now", note: "Drop 001, in validation", items: ["Denim", "Outerwear", "Tees", "Shirts"], href: "/pieces?world=wear", image: wear, alt: "Oxblood corduroy and a thin silver chain" },
  { name: "Objects", state: "Testing", note: "One piece, to see if you want more", items: ["Rings", "Chains", "Small metal"], href: "/pieces?world=objects", image: objects, alt: "Three molten-looking silver rings on a hand" },
  { name: "Room", state: "Coming soon", note: "Not yet. Tell us if you'd want it", items: ["Posters", "Wall art", "Desk objects"], image: room, alt: "A dim bedroom wall with a framed black-and-white poster and a chrome lamp" },
  { name: "Tech", state: "Coming soon", note: "Not yet", items: ["Laptop skins", "Stickers", "Phone things"] },
  { name: "Carry", state: "Coming soon", note: "Not yet", items: ["Bags", "Totes", "Small leather"] },
];

export function Worlds() {
  return (
    <section aria-labelledby="worlds-title" className="bg-bone-2 py-[clamp(6rem,12vw,11rem)]">
      <div className="gutter grid gap-y-8 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">(Beyond clothes)</p>
        <Lines
          as="h2"
          id="worlds-title"
          lines={["Clothes are just", <span key="v" className="t-voice">the first room.</span>]}
          className="t-display md:col-span-9"
        />
        <Reveal className="md:col-span-4 md:col-start-4" delay={150}>
          <p className="t-body text-stone">
            The idea is bigger than a wardrobe: things for your outfit, your room, your desk and your phone, all picked with
            the same eye. We&rsquo;re starting with clothes. The rest opens when you ask for it.
          </p>
        </Reveal>
      </div>

      <ul className="gutter mt-14 flex flex-col gap-2 md:mt-20 md:h-[min(70svh,40rem)] md:flex-row">
        {WORLDS.map((w, i) => {
          const live = Boolean(w.href);
          const Body = (
            <>
              {w.image && (
                <Image
                  src={w.image}
                  alt={w.alt ?? ""}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) 40vw, 100vw"
                  quality={70}
                  className={`object-cover transition-[scale,filter] duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] ${
                    live ? "" : "grayscale-[0.6] brightness-[0.55]"
                  }`}
                />
              )}
              {w.image && <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden />}
              <span className="relative z-10 flex h-full flex-col justify-between p-4 md:p-5">
                <span className="flex items-start justify-between gap-3">
                  <span className="t-meta">{pad(i + 1)}</span>
                  <span className="t-meta flex items-center gap-2">
                    {w.state === "Now" && <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-signal" aria-hidden />}
                    {w.state}
                  </span>
                </span>
                <span className="flex flex-col gap-3">
                  <span className="text-[clamp(2.25rem,4.4vw,4.25rem)] font-[540] leading-[0.9] tracking-[-0.05em]">{w.name}</span>
                  <span className="t-meta max-w-[28ch] opacity-70 transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-70 md:group-focus-visible:opacity-70">
                    {w.items.join(" / ")} — {w.note}
                  </span>
                </span>
              </span>
            </>
          );

          const base = `group relative block h-[9.5rem] overflow-hidden transition-[flex-grow] duration-[1s] ease-[var(--ease-out-expo)] md:h-full md:flex-[1] md:hover:flex-[2.6] ${
            w.image ? "bg-ink text-bone" : "border border-ink/15 text-ink"
          } ${i === 0 ? "md:flex-[2.6]" : ""}`;

          return (
            <li key={w.name} className="contents">
              {live ? (
                <Link href={w.href!} className={base}>
                  {Body}
                </Link>
              ) : (
                <div className={base} tabIndex={0} aria-label={`${w.name}: ${w.state}. ${w.items.join(", ")}.`}>
                  {Body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
