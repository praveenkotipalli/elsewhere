import Image from "next/image";
import Link from "next/link";
import crowd from "@/assets/footer-crowd.webp";
import { Wordmark } from "@/components/brand/Wordmark";
import { site } from "@/lib/site";
import { NAV } from "./nav";

export function SiteFooter() {
  return (
    <footer className="grain overflow-hidden bg-ink text-bone">
      <div className="gutter grid grid-cols-2 gap-x-6 gap-y-10 border-t border-char-2 pb-10 pt-12 md:grid-cols-12 md:pt-16">
        <div className="col-span-2 md:col-span-5">
          <p className="t-lede max-w-[34ch] text-fog">
            Elsewhere is in validation. Nothing here is for sale yet. Every piece is a proposal — the ones enough of you
            want are the ones we make.
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
          <p className="t-meta mb-4 text-graphite">Look around</p>
          <ul className="flex flex-col gap-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="link-line text-sm">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-2">
          <p className="t-meta mb-4 text-graphite">You</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/account/saved" className="link-line">
                Saved
              </Link>
            </li>
            <li>
              <Link href="/account/list" className="link-line">
                On the list
              </Link>
            </li>
            {site.instagram && (
              <li>
                <a href={site.instagram} target="_blank" rel="noreferrer" className="link-line">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="col-span-2 flex flex-col justify-end md:col-span-2 md:items-end">
          <p className="t-meta text-graphite">© {new Date().getFullYear()} Elsewhere</p>
        </div>
      </div>
      <div className="gutter relative z-[2]" aria-hidden>
        <Wordmark fit className="block w-full text-char-2" />
      </div>
      {/* The crowd: the people this is for, pressed up against the wordmark.
          The art has a transparent sky, so raised hands and phones reach over
          the letters and the front row's heads meet their base. Each
          overlap lands the hands (24% down the art) on the wordmark's upper
          half; it changes per breakpoint because the crop's height does. */}
      <div
        className="relative z-[3] -mt-[27vw] aspect-[4/3] w-full sm:-mt-[21vw] sm:aspect-[16/9] lg:-mt-[17.5vw] lg:aspect-[21/9]"
        aria-hidden
      >
        <Image src={crowd} alt="" fill sizes="100vw" quality={80} className="object-cover object-bottom" />
      </div>
    </footer>
  );
}
