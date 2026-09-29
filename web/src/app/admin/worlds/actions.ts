"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { CATALOG_TAG } from "@/lib/catalog";

const KINDS = ["style_icon", "anime", "essentials", "aesthetic", "collection"] as const;

const WorldInput = z.object({
  kind: z.enum(KINDS),
  name: z.string().trim().min(1, "Name it.").max(80),
  slug: z.string().trim().max(60).optional(),
  eyebrow: z.string().trim().max(60).optional(),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(800).optional(),
  cover_src: z.string().trim().max(400).optional(),
  cover_alt: z.string().trim().max(300).optional(),
  accent: z
    .string()
    .trim()
    .regex(/^(#[0-9a-fA-F]{6})?$/, "Accent must be a hex colour like #c73a1f.")
    .optional(),
  pattern: z.string().trim().max(40).optional(),
  theme_key: z.string().trim().max(60).optional(),
  is_public: z.boolean(),
  sort: z.coerce.number().int().min(0).max(9999),
});

export type WorldFormState = { error?: string; ok?: boolean };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

function refresh() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

export async function saveWorld(_: WorldFormState, form: FormData): Promise<WorldFormState> {
  const { supabase } = await requireAdmin();
  const id = (form.get("id") as string) || null;
  const parsed = WorldInput.safeParse({ ...Object.fromEntries(form), is_public: form.get("is_public") === "on" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const v = parsed.data;
  const slug = slugify(v.slug || v.name);
  if (!slug) return { error: "The name needs at least one letter or number." };

  const row = {
    kind: v.kind,
    name: v.name,
    slug,
    eyebrow: v.eyebrow || null,
    tagline: v.tagline || null,
    description: v.description || null,
    cover_src: v.cover_src || null,
    cover_alt: v.cover_alt || null,
    accent: v.accent || null,
    pattern: v.pattern || null,
    theme_key: v.theme_key || null,
    is_public: v.is_public,
    sort: v.sort,
  };

  const result = id
    ? await supabase.from("worlds").update(row).eq("id", id).select("id").single()
    : await supabase.from("worlds").insert(row).select("id").single();
  if (result.error) {
    if (result.error.code === "23505") return { error: `There is already a world at /${slug} in this family.` };
    return { error: result.error.message };
  }

  refresh();
  if (!id) redirect(`/admin/worlds/${result.data.id}?created=1`);
  return { ok: true };
}

export async function deleteWorld(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("worlds").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
  redirect("/admin/worlds");
}
