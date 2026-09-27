/**
 * product_images.src is either a site path ("/images/…"), an absolute URL,
 * or a path inside the public `product-images` bucket.
 */
export function imageUrl(src: string) {
  if (src.startsWith("/") || /^https?:\/\//.test(src)) return src;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/product-images/${src}`;
}
