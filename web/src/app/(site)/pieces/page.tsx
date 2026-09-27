import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { PieceCard } from "@/components/product/PieceCard";
import { getCategories, getProducts, getVibes } from "@/lib/catalog";
import { pad } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pieces",
  description: "Every Elsewhere piece so far — clothes and objects in validation. Tell us which ones deserve to exist.",
  alternates: { canonical: "/pieces" },
};

type Search = { world?: string; category?: string; vibe?: string };

export default async function PiecesPage({ searchParams }: PageProps<"/pieces">) {
  const sp = (await searchParams) as Search;
  const [products, categories, vibes] = await Promise.all([getProducts(), getCategories(), getVibes()]);

  const filtered = products.filter(
    (p) =>
      (!sp.world || p.category?.world === sp.world) &&
      (!sp.category || p.category?.slug === sp.category) &&
      (!sp.vibe || p.vibes.some((v) => v.slug === sp.vibe)),
  );

  const usedCategories = categories.filter((c) => products.some((p) => p.category?.id === c.id));
  const href = (patch: Partial<Search>) => {
    const next = { ...sp, ...patch };
    const q = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
    const s = q.toString();
    return s ? `/pieces?${s}` : "/pieces";
  };

  return (
    <div className="gutter pb-[clamp(5rem,10vw,9rem)] pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))]">
      <header className="grid gap-y-6 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">
          ({pad(filtered.length)} of {pad(products.length)})
        </p>
        <div className="md:col-span-9">
          <Lines
            onLoad
            as="h1"
            lines={[
              "Everything,",
              <span key="v" className="t-voice">
                so far.
              </span>,
            ]}
            className="t-mega"
          />
        </div>
      </header>

      <nav
        aria-label="Filter pieces"
        className="sticky top-0 z-30 -mx-[var(--gutter)] mt-12 border-y border-ink/15 bg-bone/95 px-[var(--gutter)] md:mt-20"
      >
        <div className="no-scrollbar flex gap-8 overflow-x-auto py-3">
          <FilterGroup label="World">
            <Chip href={href({ world: undefined, category: undefined })} active={!sp.world && !sp.category}>
              All
            </Chip>
            <Chip href={href({ world: "wear", category: undefined })} active={sp.world === "wear"}>
              Wear
            </Chip>
            <Chip href={href({ world: "objects", category: undefined })} active={sp.world === "objects"}>
              Objects
            </Chip>
          </FilterGroup>
          <FilterGroup label="Type">
            {usedCategories.map((c) => (
              <Chip
                key={c.id}
                href={href({ category: sp.category === c.slug ? undefined : c.slug, world: undefined })}
                active={sp.category === c.slug}
              >
                {c.name}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Vibe">
            {vibes.map((v) => (
              <Chip key={v.id} href={href({ vibe: sp.vibe === v.slug ? undefined : v.slug })} active={sp.vibe === v.slug}>
                {v.name}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </nav>

      {filtered.length === 0 ? (
        <div className="py-32">
          <p className="t-headline max-w-[18ch]">
            Nothing here <span className="t-voice">yet.</span>
          </p>
          <Link href="/pieces" className="t-meta link-line mt-6 inline-block">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-14 md:mt-16 md:grid-cols-3 md:gap-x-6 md:gap-y-24">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90} className={i % 3 === 1 ? "md:mt-28" : i % 3 === 2 ? "md:mt-10" : ""}>
              <PieceCard product={p} showTagline preload={i < 2} sizes="(min-width: 768px) 32vw, 50vw" />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <span className="t-meta mr-2 text-stone">{label}</span>
      {children}
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`t-meta inline-flex h-8 shrink-0 items-center px-2.5 transition-colors ${active ? "bg-ink text-bone" : "hover:bg-bone-2"}`}
    >
      {children}
    </Link>
  );
}
