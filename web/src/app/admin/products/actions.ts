"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { CATALOG_TAG } from "@/lib/catalog";
import { statusOptions } from "@/lib/format";

function refreshCatalog() {
  // Public pages read through a tagged cache; drop it so edits show immediately.
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

const ProductInput = z.object({
  name: z.string().trim().min(1, "Name it.").max(80),
  slug: z.string().trim().max(60).optional(),
  code: z.string().trim().max(20).optional(),
  tagline: z.string().trim().max(140).optional(),
  description: z.string().trim().max(600).optional(),
  story: z.string().trim().max(1500).optional(),
  details: z.string().max(3000).optional(),
  tags: z.string().max(400).optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  drop_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(statusOptions as [string, ...string[]]),
  is_public: z.boolean(),
  price: z.string().trim().regex(/^\d*$/, "Whole rupees only.").optional(),
  sort: z.coerce.number().int().min(0).max(9999),
});

export type ProductFormState = { error?: string; ok?: boolean };

/** "Label: value" per line ⇄ [{label, value}] */
function parseDetails(text = "") {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i === -1 ? { label: "Note", value: l } : { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() };
    })
    .filter((d) => d.label && d.value);
}

export async function saveProduct(_: ProductFormState, form: FormData): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();
  const id = (form.get("id") as string) || null;

  const parsed = ProductInput.safeParse({
    ...Object.fromEntries(form),
    is_public: form.get("is_public") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const v = parsed.data;

  const slug = slugify(v.slug || v.name);
  if (!slug) return { error: "The name needs at least one letter or number." };

  const row = {
    name: v.name,
    slug,
    code: v.code || null,
    tagline: v.tagline || null,
    description: v.description || null,
    story: v.story || null,
    details: parseDetails(v.details),
    tags: (v.tags ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    category_id: v.category_id || null,
    drop_id: v.drop_id || null,
    status: v.status,
    is_public: v.is_public,
    price_minor: v.price ? Number(v.price) * 100 : null,
    sort: v.sort,
  };

  const result = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert(row).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") return { error: `The URL "/pieces/${slug}" is taken. Change the slug.` };
    return { error: result.error.message };
  }
  const productId = result.data.id as string;

  const vibeIds = form.getAll("vibes").map(String).filter(Boolean);
  await supabase.from("product_vibes").delete().eq("product_id", productId);
  if (vibeIds.length) {
    const { error } = await supabase.from("product_vibes").insert(vibeIds.map((vibe_id) => ({ product_id: productId, vibe_id })));
    if (error) return { error: error.message };
  }

  refreshCatalog();
  if (!id) redirect(`/admin/products/${productId}?created=1`);
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data: images } = await supabase.from("product_images").select("src").eq("product_id", id);
  const stored = (images ?? []).map((i) => i.src).filter((s) => !s.startsWith("/") && !/^https?:/.test(s));
  if (stored.length) await supabase.storage.from("product-images").remove(stored);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refreshCatalog();
  redirect("/admin/products");
}

export async function setVisibility(id: string, isPublic: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ is_public: isPublic }).eq("id", id);
  if (error) throw new Error(error.message);
  refreshCatalog();
  revalidatePath("/admin/products");
}

const ImageInput = z.array(
  z.object({
    src: z.string().min(1).max(400),
    alt: z.string().max(300),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
  }),
);

export async function addImages(productId: string, images: z.infer<typeof ImageInput>) {
  const { supabase } = await requireAdmin();
  const list = ImageInput.parse(images);
  const { data: last } = await supabase
    .from("product_images")
    .select("sort")
    .eq("product_id", productId)
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  let sort = (last?.sort ?? -1) + 1;
  const { error } = await supabase.from("product_images").insert(list.map((i) => ({ ...i, product_id: productId, sort: sort++ })));
  if (error) throw new Error(error.message);
  refreshCatalog();
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteImage(imageId: string) {
  const { supabase } = await requireAdmin();
  const { data: img } = await supabase.from("product_images").select("src, product_id").eq("id", imageId).single();
  if (!img) return;
  if (!img.src.startsWith("/") && !/^https?:/.test(img.src)) {
    await supabase.storage.from("product-images").remove([img.src]);
  }
  await supabase.from("product_images").delete().eq("id", imageId);
  refreshCatalog();
  revalidatePath(`/admin/products/${img.product_id}`);
}

export async function updateImageAlt(imageId: string, alt: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_images").update({ alt: alt.slice(0, 300) }).eq("id", imageId);
  refreshCatalog();
}

/** Persist a new order (first = cover). */
export async function reorderImages(productId: string, orderedIds: string[]) {
  const { supabase } = await requireAdmin();
  await Promise.all(
    orderedIds.map((id, sort) => supabase.from("product_images").update({ sort }).eq("id", id).eq("product_id", productId)),
  );
  refreshCatalog();
  revalidatePath(`/admin/products/${productId}`);
}
