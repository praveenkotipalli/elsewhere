import Image from "next/image";
import Link from "next/link";
import look from "@/assets/look.jpg";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { PieceCard } from "@/components/product/PieceCard";
import { PieceImage } from "@/components/product/PieceImage";
import { SaveIcon } from "@/components/product/SaveButton";
import { Arrow } from "@/components/ui/Arrow";
import { pad, statusLabel } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { Drop, Product } from "@/lib/types";

/**
 * Drop 001 as a campaign, not a grid. Pieces are laid into spreads by their
 * admin sort order: a lead, a pair shot after dark, a closer, then any extras.
 */
export function DropSpreads({ drop, products }: { drop: Drop; products: Product[] }) {
  const [lead, darkA, darkB, closer, object, ...rest] = products;
  const bySlug = new Map(products.map((p) => [p.slug, p]));

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

      {(darkA || darkB) && (
        <div className="grain mt-[clamp(5rem,10vw,9rem)] bg-ink py-[clamp(4rem,9vw,8rem)] text-bone">
          <div className="gutter grid gap-y-16 md:grid-cols-12 md:gap-x-6">
            <div className="md:col-span-4">
              <p className="t-meta text-ash">Worn after dark</p>
              <Lines
                as="h3"
                lines={["Best seen", <span key="v" className="t-voice">under a flash.</span>]}
                className="t-headline mt-4"
              />
            </div>
            {darkA && (
              <Reveal kind="fade" className="md:col-span-4 md:col-start-5 md:mt-[22vh]">
                <PieceCard product={darkA} tone="dark" showTagline sizes="(min-width: 768px) 33vw, 100vw" />
              </Reveal>
            )}
            {darkB && (
              <Reveal kind="fade" delay={120} className="md:col-span-4">
                <PieceCard product={darkB} tone="dark" showTagline sizes="(min-width: 768px) 33vw, 100vw" />
              </Reveal>
            )}
          </div>
        </div>
      )}

      {closer && (
        <div className="gutter mt-[clamp(5rem,10vw,9rem)] grid gap-y-16 md:grid-cols-12 md:gap-x-6">
          {object && (
            <TheLook
              object={object}
              pairedWith={bySlug.get("dragon-denim") ?? lead}
              className="order-2 md:order-1 md:col-span-4 md:self-end"
            />
          )}
          <div className="order-1 md:order-2 md:col-span-7 md:col-start-6">
            <Reveal kind="image">
              <Link href={`/pieces/${closer.slug}`} className="piece group relative block aspect-[4/5] overflow-hidden bg-bone-2">
                {closer.images[0] && (
                  <PieceImage slug={closer.slug} image={closer.images[0]} sizes="(min-width: 768px) 58vw, 100vw" />
                )}
              </Link>
            </Reveal>
            <Caption product={closer} index={4} />
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="gutter mt-[clamp(5rem,10vw,9rem)] grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {rest.map((p) => (
            <PieceCard key={p.id} product={p} sizes="(min-width: 768px) 25vw, 50vw" />
          ))}
        </div>
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

/** "Worn together": one photograph, numbered to the pieces in it. */
function TheLook({ object, pairedWith, className }: { object: Product; pairedWith?: Product; className?: string }) {
  const pins = [
    { product: object, x: 52, y: 50 },
    ...(pairedWith && pairedWith.id !== object.id ? [{ product: pairedWith, x: 26, y: 86 }] : []),
  ];
  return (
    <div className={className}>
      <Reveal kind="image" className="relative aspect-[3/4] overflow-hidden bg-bone-2">
        <Image
          src={look}
          alt={object.images[0]?.alt ?? object.name}
          fill
          placeholder="blur"
          sizes="(min-width: 768px) 33vw, 100vw"
          quality={80}
          className="object-cover"
        />
        {pins.map((pin, i) => (
          <Link
            key={pin.product.id}
            href={`/pieces/${pin.product.slug}`}
            aria-label={`${pad(i + 1)}: ${pin.product.name}`}
            className="group absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <span className="absolute inset-0 rounded-full border border-bone/70 transition-transform duration-500 group-hover:scale-125" />
            <span className="t-meta relative text-bone">{pad(i + 1)}</span>
          </Link>
        ))}
      </Reveal>
      <Reveal className="mt-5">
        <p className="t-meta text-stone">Worn together</p>
        <ol className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
          {pins.map((pin, i) => (
            <li key={pin.product.id}>
              <Link href={`/pieces/${pin.product.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
                <span className="flex items-baseline gap-4">
                  <span className="t-meta text-stone">{pad(i + 1)}</span>
                  <span className="t-title link-line">{pin.product.name}</span>
                </span>
                <span className="t-meta text-stone">{pin.product.category?.name}</span>
              </Link>
            </li>
          ))}
        </ol>
        {pins[0].product.id === object.id && (
          <p className="t-voice mt-4 text-xl text-stone">Our first piece that isn&rsquo;t clothing.</p>
        )}
      </Reveal>
    </div>
  );
}
