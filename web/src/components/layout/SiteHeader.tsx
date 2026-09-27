"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { Wordmark } from "@/components/brand/Wordmark";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { MobileMenu } from "./MobileMenu";
import { NAV } from "./nav";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, saved, openAuth } = useSession();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Step out of the way while reading down; come back the moment they scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 240 && y > last + 2);
      if (y < last - 2 || y < 240) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, [contenteditable]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close overlays whenever the route changes.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  const savedCount = saved.size;

  return (
    <>
      <a
        href="#main"
        className="t-meta fixed left-3 top-3 z-[100] -translate-y-20 bg-ink px-3 py-2 text-bone focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-white mix-blend-difference transition-transform duration-700 ease-[var(--ease-out-expo)] ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="gutter flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" aria-label="Elsewhere — home" className="text-[0.95rem] md:text-base">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => {
                const active = item.href !== "/#vibes" && pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="t-meta link-line py-2 aria-[current=page]:bg-[length:100%_1px]"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-5 md:gap-7">
            <button onClick={() => setSearchOpen(true)} className="t-meta link-line hidden py-2 md:inline" aria-haspopup="dialog">
              Search
            </button>
            <button onClick={() => setSearchOpen(true)} className="-m-2 p-2 md:hidden" aria-label="Search" aria-haspopup="dialog">
              <SearchGlyph />
            </button>
            <Link href="/account/saved" className="t-meta link-line hidden py-2 md:inline" onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openAuth({ kind: "signin", next: "/account/saved" });
              }
            }}>
              Saved{savedCount > 0 && <span className="tabular-nums"> ({savedCount})</span>}
            </Link>
            {user ? (
              <Link href="/account" className="t-meta link-line hidden py-2 md:inline">
                Account
              </Link>
            ) : (
              <button onClick={() => openAuth()} className="t-meta link-line hidden py-2 md:inline">
                Sign in
              </button>
            )}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="t-meta -mr-2 py-2 pl-2 pr-2 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => {
        setMenuOpen(false);
        setSearchOpen(true);
      }} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 12l5 5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
