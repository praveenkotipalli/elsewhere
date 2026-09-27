import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { Gallery } from "@/components/product/Gallery";
import { PieceCard } from "@/components/product/PieceCard";
import { PieceImage } from "@/components/product/PieceImage";
import { ProductActions } from "@/components/product/ProductActions";
import { ViewBeacon } from "@/components/product/ViewBeacon";
import { Arrow } from "@/components/ui/Arrow";
import { getProduct, getProducts, related } from "@/lib/catalog";
import { formatPrice, statusLabel, statusLine } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pieces/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const title = `${product.name}${product.drop ? ` — Drop ${product.drop.code}` : ""}`;
  const description = [product.tagline, product.description].filter(Boolean).join(" ");
  const cover = product.images[0];
  const images = cover ? [{ url: imageUrl(cover.src), width: cover.width ?? undefined, height: cover.height ?? undefined, alt: cover.alt }] : [];
  return {
    title,
    description,
    alternates: { canonical: `/pieces/${product.slug}` },
    openGraph: { title, description, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}

export default async function PiecePage({ params }: PageProps<"/pieces/[slug]">) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProduct(slug), getProducts()]);
  if (!product) notFound();

  const images = product.images.map((i) => ({ src: imageUrl(i.src), alt: i.alt, width: i.width, height: i.height }));
  const cover = product.images[0];
  const more = related(product, all, 4);
  const index = all.findIndex((p) => p.id === product.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const price = formatPrice(product.price_minor, product.currency);
  const actionMeta = { id: product.id, name: product.name, image: cover ? imageUrl(cover.src) : undefined };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.code ?? undefined,
    image: product.images.map((i) => new URL(imageUrl(i.src), site.url).toString()),
    brand: { "@type": "Brand", name: "Elsewhere" },
    category: product.category?.name,
    url: new URL(`/pieces/${product.slug}`, site.url).toString(),
  };

  return (
    <article className="pb-[clamp(4rem,8vw,7rem)] md:pt-[calc(var(--header-h)+1rem)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ViewBeacon productId={product.id} />

      <div className="md:gutter md:grid md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-7">
          <Gallery
            name={product.name}
            images={images}
            cover={cover ? <PieceImage slug={product.slug} image={cover} preload sizes="(min-width: 768px) 58vw, 100vw" /> : null}
          />
        </div>

        <div className="gutter pt-8 md:col-span-5 md:px-0 md:pt-0 lg:col-span-4 lg:col-start-9">
          <div className="flex flex-col gap-10 md:sticky md:top-[calc(var(--header-h)+1rem)]">
            <header className="flex flex-col gap-4">
              <p className="t-meta flex flex-wrap gap-x-2 text-stone">
                {product.drop && (
                  <Link href={`/drop/${product.drop.code}`} className="link-line">
                    Drop {product.drop.code}
                  </Link>
                )}
                <span aria-hidden>/</span>
                <span>{product.code}</span>
                {product.category && (
                  <>
                    <span aria-hidden>/</span>
                    <span>{product.category.name}</span>
                  </>
                )}
              </p>
              <h1 className="t-display">{product.name}</h1>
              {product.tagline && <p className="t-voice text-2xl text-stone md:text-[1.75rem]">{product.tagline}</p>}
            </header>

            <div className="flex flex-col gap-2 border-y border-ink/15 py-4">
              <p className="t-meta flex items-center gap-2.5">
                <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-signal" aria-hidden />
                {statusLabel[product.status]}
                <span className="text-stone">· {price ? `Indicative ${price}` : "Price at drop"}</span>
              </p>
              <p className="text-sm text-stone">{statusLine[product.status]}</p>
            </div>

            <ProductActions product={actionMeta} />

            {product.description && <p className="t-lede">{product.description}</p>}

            {product.details.length > 0 && (
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                {product.details.map((d) => (
                  <div key={d.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3">
                    <dt className="t-meta pt-0.5 text-stone">{d.label}</dt>
                    <dd className="text-sm leading-relaxed">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="-mt-6 text-xs text-stone">Planned spec. It can change before anything is made.</p>

            {product.story && (
              <section aria-labelledby="story" className="flex flex-col gap-3">
                <h2 id="story" className="t-meta text-stone">
                  The story
                </h2>
                <p className="t-voice text-[1.4rem] leading-[1.3]">{product.story}</p>
              </section>
            )}

            {product.vibes.length > 0 && (
              <nav aria-label="Explore the aesthetic" className="flex flex-col gap-3">
                <p className="t-meta text-stone">Explore the aesthetic</p>
                <ul className="flex flex-wrap gap-2">
                  {product.vibes.map((v) => (
                    <li key={v.id}>
                      <Link
                        href={`/vibe/${v.slug}`}
                        className="t-meta inline-flex h-9 items-center border border-ink/20 px-3 transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                      >
                        {v.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more" className="gutter mt-[clamp(6rem,12vw,10rem)]">
          <div className="mb-10 flex items-end justify-between gap-6 border-t border-ink/15 pt-5">
            <Lines as="h2" id="more" lines={[<>More <span className="t-voice">like this</span></>]} className="t-headline" />
            <Link href="/pieces" className="t-meta link-line shrink-0">
              All pieces
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-6">
            {more.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className={i % 2 === 1 ? "md:mt-24" : ""}>
                <PieceCard product={p} sizes="(min-width: 768px) 25vw, 50vw" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {next && next.id !== product.id && (
        <Link
          href={`/pieces/${next.slug}`}
          className="gutter group mt-[clamp(6rem,12vw,10rem)] grid items-end gap-6 border-t border-ink/15 pt-5 md:grid-cols-12 md:gap-x-6"
        >
          <p className="t-meta text-stone md:col-span-3">Next piece — {next.code}</p>
          <p className="t-mega flex items-end gap-4 md:col-span-7">
            <span className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">{next.name}</span>
          </p>
          {next.images[0] && (
            <span className="relative hidden aspect-[3/4] w-full overflow-hidden bg-bone-2 md:col-span-2 md:block">
              <Image
                src={imageUrl(next.images[0].src)}
                alt=""
                fill
                sizes="16vw"
                className="object-cover grayscale transition-[filter,scale] duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
            </span>
          )}
          <span className="sr-only">
            <Arrow />
          </span>
        </Link>
      )}
    </article>
  );
}
