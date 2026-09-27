import Image from "next/image";
import Link from "next/link";
import hero from "@/assets/hero.jpg";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { pad } from "@/lib/format";
import { HeroDrift } from "./HeroDrift";

export function Hero({ pieceCount }: { pieceCount: number }) {
  return (
    <section aria-labelledby="hero-title" className="grain relative isolate h-[100svh] min-h-[38rem] overflow-hidden bg-ink text-bone">
      {/* Photograph: full-bleed on phones, a tall right-hand plate on desktop. */}
      <HeroDrift className="absolute inset-0 md:left-auto md:right-[var(--gutter)] md:top-[calc(var(--header-h)+1rem)] md:bottom-[calc(var(--gutter)+2.5rem)] md:w-[min(44vw,60svh)]">
        <div className="hero-plate relative size-full overflow-hidden">
          <Image
            src={hero}
            alt="A young man at night in a black satin bomber, a square panel on its chest glowing white under the camera flash"
            fill
            preload
            placeholder="blur"
            quality={80}
            sizes="(min-width: 768px) 44vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
      </HeroDrift>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10 md:hidden" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink/80 to-transparent md:hidden" aria-hidden />

      <div className="gutter relative z-10 flex h-full flex-col justify-between pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(var(--header-h)+1.25rem)]">
        <Reveal onLoad className="flex flex-col gap-1 md:max-w-[40vw]" delay={600}>
          <p className="t-meta">Drop 001 — First Sighting</p>
          <p className="t-meta text-ash">
            {pad(pieceCount)} pieces · none of them made yet
          </p>
        </Reveal>

        <div className="flex flex-col gap-8 md:gap-10">
          <Lines
            as="h1"
            lines={["They'll ask", "where you", "got it."]}
            className="t-mega relative max-w-[12ch]"
            delay={150}
            id="hero-title"
            onLoad
          />

          <Reveal onLoad delay={750} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5">
              <p className="t-voice text-2xl text-fog md:text-3xl">Tell them: elsewhere.</p>
              <Link
                href="/drop/001"
                className="group inline-flex w-fit items-center gap-4 border-b border-bone/40 pb-2 transition-colors hover:border-bone"
              >
                <span className="t-meta">Enter Drop 001</span>
                <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="hidden items-center gap-4 md:flex md:w-[min(44vw,60svh)] md:justify-between md:pr-0">
              <span className="flex items-center gap-3" aria-hidden>
                <span className="relative block h-10 w-px overflow-hidden bg-graphite">
                  <span className="absolute inset-0 block animate-[scroll-cue_2.4s_var(--ease-in-out-quart)_infinite] bg-bone" />
                </span>
                <span className="t-meta text-ash">Scroll</span>
              </span>
              <Link href="/pieces/afterhours-bomber" className="t-meta link-line text-ash hover:text-bone">
                Worn: Afterhours Bomber, E-002
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
