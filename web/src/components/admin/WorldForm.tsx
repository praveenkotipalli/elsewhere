"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { deleteWorld, saveWorld, type WorldFormState } from "@/app/admin/worlds/actions";
import { imageUrl } from "@/lib/images";
import { supabaseBrowser } from "@/lib/supabase/client";

export type WorldDraft = {
  id?: string;
  kind: string;
  name: string;
  slug: string;
  eyebrow: string | null;
  tagline: string | null;
  description: string | null;
  cover_src: string | null;
  cover_alt: string | null;
  accent: string | null;
  pattern: string | null;
  theme_key: string | null;
  is_public: boolean;
  sort: number;
};

const KINDS = [
  ["style_icon", "Style icon"],
  ["anime", "Anime"],
  ["essentials", "Essentials"],
  ["aesthetic", "Aesthetic"],
  ["collection", "Collection"],
];

export function WorldForm({
  world,
  themes,
  patterns,
}: {
  world: WorldDraft;
  themes: { key: string; label: string }[];
  patterns: readonly string[];
}) {
  const [state, action, pending] = useActionState<WorldFormState, FormData>(saveWorld, {});
  const [deleting, startDelete] = useTransition();
  const [cover, setCover] = useState(world.cover_src ?? "");
  const [uploading, setUploading] = useState(false);
  const [accent, setAccent] = useState(world.accent ?? "#c73a1f");

  async function upload(file: File) {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return alert("JPG, PNG, WebP or AVIF only.");
    if (file.size > 10 * 1024 * 1024) return alert("Over 10 MB. Export it smaller.");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `worlds/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseBrowser().storage.from("product-images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    setUploading(false);
    if (error) return alert(`Upload failed: ${error.message}`);
    setCover(path);
  }

  const input = "h-10 border border-ink/15 bg-bone px-3 text-sm outline-none focus:border-ink";
  const label = "t-meta text-stone";

  return (
    <form action={action} className="flex flex-col gap-10">
      {world.id && <input type="hidden" name="id" value={world.id} />}
      <input type="hidden" name="cover_src" value={cover} />

      <fieldset className="grid gap-4 border-t border-ink/15 pt-4 md:grid-cols-6">
        <legend className="t-title mb-2 w-full md:col-span-6">Identity</legend>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>Family</span>
          <select name="kind" defaultValue={world.kind} className={input}>
            {KINDS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>Name</span>
          <input name="name" required defaultValue={world.name} className={input} />
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>URL slug</span>
          <input name="slug" defaultValue={world.slug} placeholder="from the name" className={input} />
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>Eyebrow</span>
          <input name="eyebrow" defaultValue={world.eyebrow ?? ""} placeholder="The Classic" className={input} />
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-4">
          <span className={label}>Tagline</span>
          <input name="tagline" defaultValue={world.tagline ?? ""} className={input} />
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-6">
          <span className={label}>Description</span>
          <textarea name="description" rows={3} defaultValue={world.description ?? ""} className="border border-ink/15 bg-bone px-3 py-2 text-sm outline-none focus:border-ink" />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 border-t border-ink/15 pt-4 md:grid-cols-6">
        <legend className="t-title mb-2 w-full md:col-span-6">Look</legend>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>Theme</span>
          <select name="theme_key" defaultValue={world.theme_key ?? ""} className={input}>
            <option value="">Family default</option>
            {themes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>Accent colour</span>
          <span className="flex gap-2">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-10 w-12 border border-ink/15 bg-bone" aria-label="Pick accent" />
            <input name="accent" value={accent} onChange={(e) => setAccent(e.target.value)} className={`${input} flex-1 font-mono`} />
          </span>
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className={label}>Placeholder art</span>
          <select name="pattern" defaultValue={world.pattern ?? ""} className={input}>
            <option value="">None</option>
            {patterns.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 md:col-span-6">
          <span className={label}>Cover — original or licensed artwork only. Leave empty to use the placeholder art.</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="relative block aspect-[3/4] w-24 overflow-hidden border border-ink/15 bg-bone-2">
              {cover && <Image src={imageUrl(cover)} alt="" fill sizes="96px" className="object-cover" />}
            </span>
            <label className="t-meta cursor-pointer border border-ink/20 px-4 py-2 hover:border-ink">
              {uploading ? "Uploading" : cover ? "Replace" : "Upload cover"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            {cover && (
              <button type="button" onClick={() => setCover("")} className="t-meta link-line text-stone">
                Remove
              </button>
            )}
            <input name="cover_alt" defaultValue={world.cover_alt ?? ""} placeholder="Describe the cover" className={`${input} min-w-64 flex-1`} />
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 border-t border-ink/15 pt-4 md:grid-cols-6">
        <legend className="t-title mb-2 w-full md:col-span-6">Publishing</legend>
        <label className="flex flex-col gap-1.5 md:col-span-1">
          <span className={label}>Order</span>
          <input name="sort" type="number" defaultValue={world.sort} className={input} />
        </label>
        <label className="flex items-center gap-3 md:col-span-5 md:self-end md:pb-2.5">
          <input type="checkbox" name="is_public" defaultChecked={world.is_public} className="size-4 accent-[var(--color-ink)]" />
          <span className="text-sm">Visible on the site</span>
        </label>
      </fieldset>

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-4 border-t border-ink/15 bg-bone/95 px-5 py-4 md:-mx-10 md:px-10">
        <div className="flex items-center gap-4">
          <button disabled={pending || uploading} className="t-meta h-11 bg-ink px-6 text-bone hover:bg-char-2 disabled:opacity-60">
            {pending ? "Saving" : world.id ? "Save changes" : "Create world"}
          </button>
          <p role="status" className={`t-meta ${state.error ? "text-signal" : "text-stone"}`}>
            {state.error ?? (state.ok ? "Saved. The site is updated." : "")}
          </p>
        </div>
        {world.id && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (confirm(`Delete ${world.name}? Its product links and votes go with it. Pieces themselves stay.`)) {
                startDelete(() => deleteWorld(world.id!));
              }
            }}
            className="t-meta link-line text-signal disabled:opacity-50"
          >
            {deleting ? "Deleting" : "Delete world"}
          </button>
        )}
      </div>
    </form>
  );
}
