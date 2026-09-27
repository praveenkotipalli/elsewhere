"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { SearchHit } from "@/app/api/search/route";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";

type Result = { hits: SearchHit[]; vibes: { slug: string; name: string; tagline: string | null }[] };

const EASE = [0.16, 1, 0.3, 1] as const;

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          data-lenis-prevent
          className="fixed inset-0 z-[70] overflow-y-auto bg-bone text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <SearchBody onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  useEffect(() => {
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        setData(await res.json());
        setActive(-1);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, q ? 140 : 0);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  const hits = data?.hits ?? [];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(hits.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter" && active >= 0 && hits[active]) {
      e.preventDefault();
      router.push(`/pieces/${hits[active].slug}`);
    }
  }

  return (
    <div className="gutter flex min-h-full flex-col pb-16">
      <div className="flex h-[var(--header-h)] items-center justify-between">
        <p className="t-meta text-stone">Search</p>
        <button onClick={onClose} className="t-meta link-line -mr-1 px-1 py-2">
          Close
        </button>
      </div>

      <div className="pt-[8vh] md:pt-[12vh]">
        <label htmlFor="search-input" className="t-meta mb-4 block text-stone">
          What are you looking for?
        </label>
        <motion.input
          id="search-input"
          data-autofocus
          type="search"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Denim, silver, after dark…"
          className="t-display w-full border-b border-ink/15 bg-transparent pb-4 outline-none placeholder:text-bone-3 focus:border-ink [&::-webkit-search-cancel-button]:hidden"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
        />
      </div>

      <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:gap-6">
        <section className="md:col-span-8" aria-live="polite">
          <p className="t-meta mb-5 flex justify-between text-stone">
            <span>{q ? "Pieces" : "Everything so far"}</span>
            <span className="tabular-nums">{loading ? "…" : `${hits.length}`}</span>
          </p>
          {hits.length === 0 && !loading && q ? (
            <p className="t-lede max-w-[30ch] text-stone">
              Nothing called that — yet. If you want it to exist, that&rsquo;s exactly what we want to hear.
            </p>
          ) : (
            <ul id={listId} role="listbox" className="divide-y divide-ink/10 border-y border-ink/10">
              {hits.map((hit, i) => (
                <li key={hit.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/pieces/${hit.slug}`}
                    className="group flex items-center gap-4 py-3 aria-selected:bg-bone-2 md:gap-6"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                  >
                    <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-bone-2 md:w-16">
                      {hit.image && (
                        <Image src={hit.image} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="t-meta text-stone">
                        {hit.code} {hit.category && <>· {hit.category}</>}
                      </p>
                      <p className="t-title truncate transition-transform duration-500 group-hover:translate-x-1">
                        {hit.name}
                      </p>
                    </div>
                    <p className="t-voice hidden max-w-[28ch] text-right text-lg text-stone md:block">{hit.tagline}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="md:col-span-3 md:col-start-10">
          <p className="t-meta mb-5 text-stone">Start with a feeling</p>
          <ul className="flex flex-col gap-3">
            {(data?.vibes ?? []).map((v) => (
              <li key={v.slug}>
                <Link href={`/vibe/${v.slug}`} className="group block">
                  <span className="t-title link-line">{v.name}</span>
                  <span className="t-voice block text-stone">{v.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="t-meta mt-10 hidden text-stone md:block">
            Press <kbd className="border border-ink/20 px-1.5">/</kbd> anywhere to search
          </p>
        </aside>
      </div>
    </div>
  );
}
