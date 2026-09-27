import Image from "next/image";
import Link from "next/link";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { requireAdmin } from "@/lib/admin";
import { formatDate, statusLabel } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { ProductStatus } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  code: string | null;
  slug: string;
  status: ProductStatus;
  is_public: boolean;
  created_at: string;
  category: { name: string } | null;
  images: { src: string; sort: number }[];
};

export default async function AdminProducts() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("products")
    .select("id, name, code, slug, status, is_public, created_at, category:categories(name), images:product_images(src, sort)")
    .order("sort");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="t-meta text-stone">Pieces</p>
          <h1 className="t-headline mt-2">
            {rows.length} <span className="t-voice">on file.</span>
          </h1>
        </div>
        <Link href="/admin/products/new" className="t-meta flex h-10 items-center bg-ink px-4 text-bone hover:bg-char-2">
          New piece
        </Link>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead>
            <tr className="t-meta text-left text-stone">
              <th className="py-3 pr-4 font-normal">Piece</th>
              <th className="py-3 pr-4 font-normal">Category</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 pr-4 font-normal">Visible</th>
              <th className="py-3 pr-4 font-normal">Created</th>
              <th className="py-3 font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 border-y border-ink/10">
            {rows.map((r) => {
              const cover = [...r.images].sort((a, b) => a.sort - b.sort)[0];
              return (
                <tr key={r.id} className="hover:bg-bone-2">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3">
                      <span className="relative block aspect-[3/4] w-10 shrink-0 overflow-hidden bg-bone-3">
                        {cover && <Image src={imageUrl(cover.src)} alt="" fill sizes="40px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="link-line font-medium">{r.name}</span>
                        <span className="t-meta block text-stone">{r.code}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-stone">{r.category?.name ?? "—"}</td>
                  <td className="t-meta py-3 pr-4">{statusLabel[r.status]}</td>
                  <td className="py-3 pr-4">
                    <VisibilityToggle id={r.id} isPublic={r.is_public} disabled={!cover} />
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-stone">{formatDate(r.created_at)}</td>
                  <td className="py-3 text-right">
                    {r.is_public && (
                      <Link href={`/pieces/${r.slug}`} className="t-meta link-line text-stone" target="_blank">
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="t-meta text-stone">A piece can only go public once it has at least one photograph.</p>
    </div>
  );
}
