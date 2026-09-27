import Image from "next/image";
import { ViewTransition } from "react";
import { imageUrl } from "@/lib/images";
import type { ProductImage } from "@/lib/types";

/**
 * The cover image of a piece. Named so it morphs between the card and the
 * product page during navigation.
 */
export function PieceImage({
  slug,
  image,
  sizes,
  preload,
  className = "object-cover",
  morph = true,
}: {
  slug: string;
  image: ProductImage;
  sizes: string;
  preload?: boolean;
  className?: string;
  morph?: boolean;
}) {
  const img = (
    <Image
      src={imageUrl(image.src)}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      quality={80}
      className={className}
    />
  );
  if (!morph) return img;
  return (
    <ViewTransition name={`piece-${slug}`} share="piece-morph" default="none">
      {img}
    </ViewTransition>
  );
}
