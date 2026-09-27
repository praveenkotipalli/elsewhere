import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import room from "@/assets/world-room.jpg";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Arrow";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Why Elsewhere exists, and why nothing gets made until you say so.",
  alternates: { canonical: "/manifesto" },
};

const LINES = [
  { lead: "We don't make", voice: "basics.", body: "There are enough good plain tees in the world. We make the piece that makes the plain tee look intentional." },
  { lead: "We don't fake", voice: "demand.", body: "No countdowns that reset. No “only 3 left”. No reviews from people who don't exist. If a piece is wanted, you'll see it get made." },
  { lead: "We don't guess", voice: "either.", body: "Every piece starts as a proposal. You tell us what you'd actually wear. The most-wanted go into small runs. The rest stay ideas." },
  { lead: "We don't stop at", voice: "clothes.", body: "The same eye goes into your room, your desk, your phone, your hands. Objects are next. Tell us what you want to see." },
];

export default function ManifestoPage() {
  return (
    <div>
      <header className="gutter pb-[clamp(4rem,10vw,9rem)] pt-[calc(var(--header-h)+clamp(4rem,10vw,9rem))]">
        <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
          <p className="t-meta text-stone md:col-span-3">(Manifesto)</p>
          <div className="md:col-span-9">
            <Lines
              onLoad
              as="h1"
              lines={[
                "Where'd you",
                "get that?",
                <span key="v" className="t-voice">
                  Elsewhere.
                </span>,
              ]}
              className="t-mega"
            />
          </div>
        </div>
      </header>

      <Reveal kind="image" className="relative aspect-[4/3] w-full overflow-hidden bg-bone-2 md:aspect-[21/9]">
        <Image src={room} alt="A dim room: a framed black-and-white poster, a smaller print taped up with silver tape, a chrome lamp" fill placeholder="blur" sizes="100vw" quality={80} className="object-cover" />
      </Reveal>

      <section className="gutter py-[clamp(5rem,12vw,11rem)]">
        <Reveal className="grid gap-y-6 md:grid-cols-12 md:gap-x-6">
          <p className="t-lede md:col-span-6 md:col-start-4">
            Elsewhere started with a simple observation. Nobody remembers what they needed. Everyone remembers the thing
            they saw once and couldn&rsquo;t stop thinking about — the jacket in someone&rsquo;s story, the ring on a
            stranger&rsquo;s hand, the poster in a friend&rsquo;s room. We want to be where those things come from.
          </p>
        </Reveal>

        <ol className="mt-20 flex flex-col md:mt-32">
          {LINES.map((l, i) => (
            <li key={l.lead} className="grid gap-y-4 border-t border-ink/15 py-10 md:grid-cols-12 md:gap-x-6 md:py-14">
              <span className="t-meta text-stone md:col-span-3">0{i + 1}</span>
              <Lines
                as="h2"
                lines={[
                  <>
                    {l.lead} <span className="t-voice">{l.voice}</span>
                  </>,
                ]}
                className="t-headline md:col-span-5"
              />
              <Reveal delay={120} className="md:col-span-3 md:col-start-10">
                <p className="t-body text-stone">{l.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-16 border-t border-ink/15 pt-10 md:mt-24">
          <Link href="/drop/001" className="group inline-flex items-center gap-4">
            <span className="t-headline">
              See what we&rsquo;re <span className="t-voice">proposing</span>
            </span>
            <Arrow className="size-6 transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
