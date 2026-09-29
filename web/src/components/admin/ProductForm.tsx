"use client";

import { useActionState, useTransition } from "react";
import { deleteProduct, saveProduct, type ProductFormState } from "@/app/admin/products/actions";
import { statusLabel, statusOptions } from "@/lib/format";
import type { Detail, ProductStatus } from "@/lib/types";

export type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  code: string | null;
  tagline: string | null;
  description: string | null;
  story: string | null;
  details: Detail[];
  tags: string[];
  category_id: string | null;
  drop_id: string | null;
  status: ProductStatus;
  is_public: boolean;
  price_minor: number | null;
  sort: number;
  vibe_ids: string[];
  world_ids: string[];
  has_images: boolean;
};

type Opt = { id: string; name: string };

const WORLD_GROUPS = [
  { kind: "style_icon", label: "Style icons" },
  { kind: "anime", label: "Anime" },
  { kind: "essentials", label: "Essentials" },
  { kind: "aesthetic", label: "Aesthetics" },
  { kind: "collection", label: "Collections" },
];

export function ProductForm({
  product,
  categories,
  drops,
  vibes,
  worlds,
}: {
  product: ProductDraft;
  categories: Opt[];
  drops: Opt[];
  vibes: Opt[];
  worlds: (Opt & { kind: string; is_public: boolean })[];
}) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [deleting, startDelete] = useTransition();

  return (
    <form action={action} className="flex flex-col gap-10">
      {product.id && <input type="hidden" name="id" value={product.id} />}

      <Group title="Identity">
        <Field label="Name" name="name" defaultValue={product.name} required className="md:col-span-4" />
        <Field label="Code" name="code" defaultValue={product.code ?? ""} placeholder="E-009" className="md:col-span-2" />
        <Field
          label="URL slug"
          name="slug"
          defaultValue={product.slug}
          placeholder="from the name"
          hint="/pieces/…"
          className="md:col-span-3"
        />
        <Field label="Order" name="sort" type="number" defaultValue={String(product.sort)} className="md:col-span-1" />
        <Field
          label="Indicative price (₹)"
          name="price"
          inputMode="numeric"
          defaultValue={product.price_minor != null ? String(product.price_minor / 100) : ""}
          placeholder="Blank = “Price at drop”"
          className="md:col-span-2"
        />
      </Group>

      <Group title="Words">
        <Field label="Tagline" name="tagline" defaultValue={product.tagline ?? ""} hint="One line, italic on the site" className="md:col-span-6" />
        <Area label="Description" name="description" defaultValue={product.description ?? ""} rows={3} className="md:col-span-6" />
        <Area label="The story" name="story" defaultValue={product.story ?? ""} rows={4} className="md:col-span-6" />
        <Area
          label="Details"
          name="details"
          defaultValue={product.details.map((d) => `${d.label}: ${d.value}`).join("\n")}
          rows={5}
          hint="One per line — Label: value"
          className="md:col-span-6"
        />
      </Group>

      <Group title="Placement">
        <Select label="Category" name="category_id" defaultValue={product.category_id ?? ""} options={categories} className="md:col-span-2" />
        <Select label="Drop" name="drop_id" defaultValue={product.drop_id ?? ""} options={drops} className="md:col-span-2" />
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className="t-meta text-stone">Status</span>
          <select name="status" defaultValue={product.status} className="h-10 border border-ink/15 bg-bone px-2 text-sm outline-none focus:border-ink">
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-2 md:col-span-4">
          <legend className="t-meta mb-1.5 text-stone">Vibes</legend>
          <div className="flex flex-wrap gap-2">
            {vibes.map((v) => (
              <label key={v.id} className="t-meta flex h-9 cursor-pointer items-center gap-2 border border-ink/15 px-3 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bone">
                <input type="checkbox" name="vibes" value={v.id} defaultChecked={product.vibe_ids.includes(v.id)} className="sr-only" />
                {v.name}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-4 md:col-span-6">
          <legend className="t-meta mb-1.5 text-stone">Worlds — where customers discover this piece</legend>
          {WORLD_GROUPS.map((g) => {
            const list = worlds.filter((w) => w.kind === g.kind);
            if (list.length === 0) return null;
            return (
              <div key={g.kind} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <span className="t-meta w-28 shrink-0 text-stone">{g.label}</span>
                <div className="flex flex-wrap gap-2">
                  {list.map((w) => (
                    <label key={w.id} className="t-meta flex h-9 cursor-pointer items-center gap-2 border border-ink/15 px-3 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bone">
                      <input type="checkbox" name="worlds" value={w.id} defaultChecked={product.world_ids.includes(w.id)} className="sr-only" />
                      {w.name}
                      {!w.is_public && <span className="opacity-60">(hidden)</span>}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>
        <Field label="Tags" name="tags" defaultValue={product.tags.join(", ")} hint="Comma separated, helps search" className="md:col-span-2" />
        <label className="flex items-center gap-3 md:col-span-6">
          <input type="checkbox" name="is_public" defaultChecked={product.is_public} disabled={!product.has_images && !product.is_public} className="size-4 accent-[var(--color-ink)]" />
          <span className="text-sm">
            Visible on the site
            {!product.has_images && <span className="text-stone"> — add a photograph first</span>}
          </span>
        </label>
      </Group>

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-4 border-t border-ink/15 bg-bone/95 px-5 py-4 md:-mx-10 md:px-10">
        <div className="flex items-center gap-4">
          <button disabled={pending} className="t-meta h-11 bg-ink px-6 text-bone hover:bg-char-2 disabled:opacity-60">
            {pending ? "Saving" : product.id ? "Save changes" : "Create piece"}
          </button>
          <p role="status" className={`t-meta ${state.error ? "text-signal" : "text-stone"}`}>
            {state.error ?? (state.ok ? "Saved. The site is updated." : "")}
          </p>
        </div>
        {product.id && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (confirm(`Delete ${product.name}? Its photographs, saves and interest records go with it. This can't be undone.`)) {
                startDelete(() => deleteProduct(product.id!));
              }
            }}
            className="t-meta link-line text-signal disabled:opacity-50"
          >
            {deleting ? "Deleting" : "Delete piece"}
          </button>
        )}
      </div>
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-t border-ink/15 pt-4 md:grid-cols-6">
      <legend className="t-title float-left mb-2 w-full md:col-span-6">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, hint, className = "", ...rest }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="t-meta flex justify-between gap-2 text-stone">
        {label}
        {hint && <span className="normal-case tracking-normal text-fog">{hint}</span>}
      </span>
      <input className="h-10 border border-ink/15 bg-bone px-3 text-sm outline-none focus:border-ink" {...rest} />
    </label>
  );
}

function Area({ label, hint, className = "", ...rest }: { label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="t-meta flex justify-between gap-2 text-stone">
        {label}
        {hint && <span className="normal-case tracking-normal text-fog">{hint}</span>}
      </span>
      <textarea className="border border-ink/15 bg-bone px-3 py-2 text-sm leading-relaxed outline-none focus:border-ink" {...rest} />
    </label>
  );
}

function Select({ label, options, className = "", ...rest }: { label: string; options: Opt[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="t-meta text-stone">{label}</span>
      <select className="h-10 border border-ink/15 bg-bone px-2 text-sm outline-none focus:border-ink" {...rest}>
        <option value="">None</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
