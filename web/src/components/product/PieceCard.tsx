import Image from "next/image";
import Link from "next/link";
import { statusLabel } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { Product } from "@/lib/types";
import { PieceImage } from "./PieceImage";
import { SaveIcon } from "./SaveButton";

/**
 * A piece presented as a small campaign frame: the image does the talking, the
 * second frame appears on hover, and the words stay underneath and quiet.
 */
export function PieceCard({
  product,
  sizes,
  ratio = "aspect-[3/4]",
  preload,
  tone = "light",
  showTagline = false,
  className = "",
}: {
  product: Product;
  sizes: string;
  ratio?: string;
  preload?: boolean;
  tone?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}) {
  const [cover, alt] = product.images;
  const muted = tone === "dark" ? "text-ash" : "text-stone";
  const saveMeta = { id: product.id, name: product.name, image: cover ? imageUrl(cover.src) : undefined };

  return (
    <article className={`piece relative ${className}`}>
      <Link href={`/pieces/${product.slug}`} className="block" aria-label={`${product.name}${product.tagline ? ` — ${product.tagline}` : ""}`}>
        <div className={`piece-media relative overflow-hidden ${tone === "dark" ? "bg-char" : "bg-bone-2"} ${ratio}`}>
          {cover && <PieceImage slug={product.slug} image={cover} sizes={sizes} preload={preload} />}
          {alt && (
            <Image
              src={imageUrl(alt.src)}
              alt=""
              fill
              sizes={sizes}
              quality={80}
              className="alt object-cover"
            />
          )}
          <span className="t-meta pointer-events-none absolute left-3 top-3 text-white mix-blend-difference">
            {product.code}
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="t-title">{product.name}</h3>
            {showTagline && product.tagline && (
              <p className={`t-voice mt-1 text-lg leading-snug ${muted}`}>{product.tagline}</p>
            )}
          </div>
          <p className={`t-meta shrink-0 pt-1.5 text-right ${muted}`}>
            {product.category?.name}
            {/* Validating is the default state of everything; only call out the exceptions. */}
            {product.status !== "validating" && <span className="mt-1 block">{statusLabel[product.status]}</span>}
          </p>
        </div>
      </Link>
      <SaveIcon product={saveMeta} className="absolute right-1 top-1" />
    </article>
  );
}
