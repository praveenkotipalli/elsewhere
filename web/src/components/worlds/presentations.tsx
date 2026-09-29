import { Reveal } from "@/components/motion/Reveal";
import { PieceCard } from "@/components/product/PieceCard";
import { pad } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Magazine layout: two columns, the second dropped, taglines in the voice. */
export function EditorialPieces({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-14 md:grid-cols-12 md:gap-x-6 md:gap-y-24">
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 2) * 100} className={i % 2 === 0 ? "md:col-span-5" : "md:col-span-4 md:col-start-8 md:mt-40"}>
          <PieceCard product={p} showTagline preload={i < 2} sizes="(min-width: 768px) 40vw, 50vw" />
        </Reveal>
      ))}
    </div>
  );
}

/** Poster wall: numbered, loud, fast. Numbers are set in the world's display face. */
export function PosterPieces({ products }: { products: Product[] }) {
  return (
    <ol className="grid grid-cols-1 gap-x-4 gap-y-16 sm:grid-cols-2 md:grid-cols-3">
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} delay={(i % 3) * 70} className={i % 3 === 1 ? "md:mt-20" : ""}>
          <div className="mb-3 flex items-end justify-between border-b-2 border-signal pb-2">
            <span className="t-display leading-none text-signal">{pad(i + 1)}</span>
            <span className="t-meta text-stone">{p.category?.name}</span>
          </div>
          <PieceCard product={p} showTagline preload={i < 2} sizes="(min-width: 768px) 30vw, (min-width: 640px) 50vw, 100vw" />
        </Reveal>
      ))}
    </ol>
  );
}

/** The shelves customers see; each is made of one or more internal categories. */
const SHELVES: { label: string; categories: string[]; note: string }[] = [
  { label: "Henleys", categories: ["henleys"], note: "Three buttons, heavy rib, washed soft." },
  { label: "Tees", categories: ["tees", "tops"], note: "Heavyweight, plain, cut properly." },
  { label: "Long sleeves", categories: ["long-sleeves"], note: "The layer you forget you're wearing." },
  { label: "Denim", categories: ["denim", "trousers"], note: "Clean washes. Nothing loud." },
  { label: "Overshirts", categories: ["overshirts", "shirts", "outerwear"], note: "Easy weight, worn open." },
];

/**
 * Quiet shelves. Large images, no badges, lots of air. Shelves without pieces say
 * so plainly rather than being hidden — it's where the next essentials will go.
 */
export function EssentialsShelves({ products }: { products: Product[] }) {
  const used = new Set<string>();
  const shelves = SHELVES.map((s) => {
    const items = products.filter((p) => p.category && s.categories.includes(p.category.slug) && !used.has(p.id));
    items.forEach((p) => used.add(p.id));
    return { ...s, items };
  });
  const rest = products.filter((p) => !used.has(p.id));

  return (
    <div className="flex flex-col">
      {shelves.map((s, i) => (
        <section key={s.label} aria-labelledby={`shelf-${i}`} className="grid gap-y-8 border-t border-ink/10 py-12 md:grid-cols-12 md:gap-x-6 md:py-20">
          <Reveal className="md:col-span-4">
            <p className="t-meta text-stone">{pad(i + 1)}</p>
            <h3 id={`shelf-${i}`} className="mt-3 text-[clamp(1.8rem,3vw,2.75rem)] font-[380] leading-[1] tracking-[-0.03em]">
              {s.label}
            </h3>
            <p className="mt-3 max-w-[28ch] text-sm text-stone">{s.note}</p>
          </Reveal>
          <div className="md:col-span-8">
            {s.items.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6">
                {s.items.map((p) => (
                  <Reveal key={p.id}>
                    <PieceCard product={p} sizes="(min-width: 768px) 33vw, 50vw" />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal className="flex h-full min-h-32 items-center border border-dashed border-ink/15 px-6">
                <p className="text-sm text-stone">Being designed. Nothing here until it&rsquo;s right.</p>
              </Reveal>
            )}
          </div>
        </section>
      ))}
      {rest.length > 0 && (
        <section className="grid gap-y-8 border-t border-ink/10 py-12 md:grid-cols-12 md:gap-x-6 md:py-20">
          <h3 className="text-[clamp(1.8rem,3vw,2.75rem)] font-[380] leading-[1] tracking-[-0.03em] md:col-span-4">Also quiet</h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:col-span-8 md:gap-x-6">
            {rest.map((p) => (
              <PieceCard key={p.id} product={p} sizes="(min-width: 768px) 33vw, 50vw" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
