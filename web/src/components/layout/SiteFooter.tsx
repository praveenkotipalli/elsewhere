import Link from "next/link";
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
      <div className="gutter pb-[max(1rem,env(safe-area-inset-bottom))]" aria-hidden>
        <Wordmark fit className="block w-full text-char-2" />
      </div>
    </footer>
  );
}
