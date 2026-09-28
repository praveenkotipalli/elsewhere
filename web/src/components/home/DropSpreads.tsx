import Image from "next/image";
import Link from "next/link";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { PieceImage } from "@/components/product/PieceImage";
import { SaveIcon } from "@/components/product/SaveButton";
import { Arrow } from "@/components/ui/Arrow";
import { pad, statusLabel } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { Drop, Product } from "@/lib/types";

/**
 * Drop 001 on the landing page: a taste, not the catalogue. The lead piece gets
 * a full spread, the second a closer look, and everything else is one click
 * away on the drop page. Order comes from the admin sort.
 */
export function DropSpreads({ drop, products }: { drop: Drop; products: Product[] }) {
  const [lead, second] = products;
  const more = products.length - 2;

  return (
    <section aria-labelledby="drop-title" className="pb-[clamp(5rem,12vw,10rem)]">
      <header className="gutter grid gap-y-8 border-t border-ink/15 pt-6 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">Drop {drop.code}</p>
        <div className="md:col-span-5">
          <Lines as="h2" id="drop-title" lines={["First", "Sighting."]} className="t-display" />
        </div>
        <Reveal delay={150} className="flex flex-col justify-end gap-6 md:col-span-3 md:col-start-10">
          <p className="t-body text-stone">{drop.description}</p>
          <Link href={`/drop/${drop.code}`} className="group inline-flex w-fit items-center gap-3 border-b border-ink/30 pb-1.5 hover:border-ink">
            <span className="t-meta">The whole drop</span>
            <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </header>

      {lead && <LeadSpread product={lead} index={1} />}

      {second && (
        <div className="gutter mt-[clamp(5rem,10vw,9rem)] grid gap-y-10 md:grid-cols-12 md:gap-x-6">
          {second.images[1] && (
            <Reveal kind="image" delay={150} className="relative order-2 aspect-[3/4] overflow-hidden bg-bone-2 md:order-1 md:col-span-4 md:self-end">
              <Image src={imageUrl(second.images[1].src)} alt={second.images[1].alt} fill sizes="(min-width: 768px) 33vw, 100vw" quality={80} className="object-cover" />
            </Reveal>
          )}
          <div className="order-1 md:order-2 md:col-span-7 md:col-start-6">
            <Reveal kind="image">
              <Link href={`/pieces/${second.slug}`} className="piece group relative block aspect-[4/5] overflow-hidden bg-bone-2">
                {second.images[0] && (
                  <PieceImage slug={second.slug} image={second.images[0]} sizes="(min-width: 768px) 58vw, 100vw" />
                )}
              </Link>
            </Reveal>
            <Caption product={second} index={2} />
          </div>
        </div>
      )}

      {more > 0 && (
        <Reveal className="gutter mt-[clamp(4rem,8vw,7rem)]">
          <Link
            href={`/drop/${drop.code}`}
            className="group flex items-baseline justify-between gap-6 border-y border-ink/15 py-6 transition-colors hover:border-ink/40"
          >
            <span className="t-headline">
              {more === 1 ? "One more piece" : `${more} more pieces`}{" "}<span className="t-voice text-stone">in the drop.</span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="t-meta">See all {products.length}</span>
              <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      )}
    </section>
  );
}

function LeadSpread({ product, index }: { product: Product; index: number }) {
  const [cover, detail] = product.images;
  return (
    <div className="gutter mt-[clamp(3rem,7vw,6rem)] grid gap-y-10 md:grid-cols-12 md:gap-x-6">
      <div className="relative md:col-span-7">
        <Reveal kind="image">
          <Link href={`/pieces/${product.slug}`} className="piece relative block aspect-[3/4] overflow-hidden bg-bone-2">
            {cover && <PieceImage slug={product.slug} image={cover} sizes="(min-width: 768px) 58vw, 100vw" />}
          </Link>
        </Reveal>
        <SaveIcon
          product={{ id: product.id, name: product.name, image: cover ? imageUrl(cover.src) : undefined }}
          className="absolute right-2 top-2"
        />
      </div>
      <div className="flex flex-col justify-between gap-12 md:col-span-4 md:col-start-9">
        {detail && (
          <Reveal kind="image" delay={200} className="relative hidden aspect-[3/4] w-2/3 overflow-hidden bg-bone-2 md:block">
            <Image src={imageUrl(detail.src)} alt={detail.alt} fill sizes="22vw" quality={80} className="object-cover" />
          </Reveal>
        )}
        <Caption product={product} index={index} large />
      </div>
    </div>
  );
}

function Caption({ product, index, large = false }: { product: Product; index: number; large?: boolean }) {
  return (
    <Reveal className={`flex flex-col gap-4 ${large ? "" : "mt-5 md:flex-row md:items-end md:justify-between md:gap-10"}`}>
      <div>
        <p className="t-meta text-stone">
          {pad(index)} — {product.code} · {product.category?.name} · {statusLabel[product.status]}
        </p>
        <h3 className={`${large ? "t-display" : "t-headline"} mt-3`}>{product.name}</h3>
        <p className="t-voice mt-3 text-2xl text-stone">{product.tagline}</p>
      </div>
      <div className={`flex flex-col gap-5 ${large ? "" : "md:max-w-[34ch]"}`}>
        {large && <p className="t-body max-w-[40ch]">{product.description}</p>}
        <Link href={`/pieces/${product.slug}`} className="group inline-flex w-fit items-center gap-3 border-b border-ink/30 pb-1.5 hover:border-ink">
          <span className="t-meta">See the piece</span>
          <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </div>
    </Reveal>
  );
}
