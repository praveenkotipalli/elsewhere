import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import type { Detail, ProductStatus } from "@/lib/types";
import { formOptions } from "../options";

export default async function EditProduct({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: p }, opts, interest, saves] = await Promise.all([
    supabase
      .from("products")
      .select("*, images:product_images(id, src, alt, width, height, sort), vibes:product_vibes(vibe_id), worlds:product_worlds(world_id)")
      .eq("id", id)
      .maybeSingle(),
    formOptions(supabase),
    supabase.from("product_interests").select("*", { count: "exact", head: true }).eq("product_id", id).eq("status", "active"),
    supabase.from("wishlists").select("*", { count: "exact", head: true }).eq("product_id", id),
  ]);
  if (!p) notFound();

  const images = [...(p.images as { id: string; src: string; alt: string; width: number | null; height: number | null; sort: number }[])].sort(
    (a, b) => a.sort - b.sort,
  );

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Link href="/admin/products" className="t-meta link-line w-fit text-stone">
          ← Pieces
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="t-headline">{p.name}</h1>
          <div className="t-meta flex gap-6">
            <Link href={`/admin/interest?product=${p.id}`} className="link-line">
              {interest.count ?? 0} interested
            </Link>
            <span className="text-stone">{saves.count ?? 0} saves</span>
            {p.is_public && (
              <Link href={`/pieces/${p.slug}`} target="_blank" className="link-line">
                View on site
              </Link>
            )}
          </div>
        </div>
        {sp.created && <p className="t-meta text-stone">Created. Add photographs below, then make it public.</p>}
      </header>

      <ImageManager productId={p.id} productName={p.name} images={images} />

      <ProductForm
        {...opts}
        product={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          code: p.code,
          tagline: p.tagline,
          description: p.description,
          story: p.story,
          details: (p.details ?? []) as Detail[],
          tags: p.tags ?? [],
          category_id: p.category_id,
          drop_id: p.drop_id,
          status: p.status as ProductStatus,
          is_public: p.is_public,
          price_minor: p.price_minor,
          sort: p.sort,
          vibe_ids: (p.vibes as { vibe_id: string }[]).map((v) => v.vibe_id),
          world_ids: (p.worlds as { world_id: string }[]).map((w) => w.world_id),
          has_images: images.length > 0,
        }}
      />
    </div>
  );
}
