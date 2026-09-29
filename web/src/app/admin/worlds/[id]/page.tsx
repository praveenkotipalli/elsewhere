import Link from "next/link";
import { notFound } from "next/navigation";
import { WorldForm, type WorldDraft } from "@/components/admin/WorldForm";
import { PATTERNS } from "@/components/worlds/WorldArt";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { worldHref } from "@/lib/worlds/families";
import { THEMES } from "@/lib/worlds/themes";

export default async function EditWorld({ params, searchParams }: PageProps<"/admin/worlds/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: world }, reached, votes, linked] = await Promise.all([
    supabase.from("worlds").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("admin_world_products", { p_world: id }),
    supabase
      .from("world_interests")
      .select("created_at, profile:profiles(full_name, email, college)")
      .eq("world_id", id)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("product_worlds").select("product:products(id, name, code)").eq("world_id", id),
  ]);
  if (!world) notFound();

  const themes = Object.values(THEMES).map((t) => ({ key: t.key, label: t.label }));
  const voters = (votes.data ?? []) as unknown as { created_at: string; profile: { full_name: string | null; email: string | null; college: string | null } | null }[];
  const pieces = (linked.data ?? []) as unknown as { product: { id: string; name: string; code: string | null } | null }[];
  const reachedRows = (reached.data ?? []) as { product_id: string; name: string; views: number; saves: number; interests: number }[];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Link href="/admin/worlds" className="t-meta link-line w-fit text-stone">
          ← Worlds
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="t-headline">{world.name}</h1>
          {world.is_public && (
            <Link href={worldHref(world.kind, world.slug)} target="_blank" className="t-meta link-line">
              View on site
            </Link>
          )}
        </div>
        {sp.created && <p className="t-meta text-stone">Created. Link pieces to it from each piece&rsquo;s page in Pieces.</p>}
      </header>

      <section className="grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="t-meta mb-3 text-stone">Pieces in this world ({pieces.length})</h2>
          <ul className="divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {pieces.length === 0 && <li className="py-3 text-stone">None yet. Add them from a piece&rsquo;s edit page.</li>}
            {pieces.map(({ product }) =>
              product ? (
                <li key={product.id} className="py-2.5">
                  <Link href={`/admin/products/${product.id}`} className="link-line">
                    {product.name}
                  </Link>{" "}
                  <span className="t-meta text-stone">{product.code}</span>
                </li>
              ) : null,
            )}
          </ul>
        </div>
        <div>
          <h2 className="t-meta mb-3 text-stone">Reached from this world</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="t-meta text-left text-stone">
                <th className="pb-2 font-normal">Piece</th>
                <th className="pb-2 text-right font-normal">Views</th>
                <th className="pb-2 text-right font-normal">Saves</th>
                <th className="pb-2 text-right font-normal">Int.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 border-y border-ink/10">
              {reachedRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-stone">
                    No trail yet.
                  </td>
                </tr>
              )}
              {reachedRows.map((r) => (
                <tr key={r.product_id}>
                  <td className="py-2.5">{r.name}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.views}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.saves}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.interests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="t-meta mb-3 text-stone">Asked for more ({voters.length})</h2>
          <ul className="divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {voters.length === 0 && <li className="py-3 text-stone">No votes yet.</li>}
            {voters.map((v, i) => (
              <li key={i} className="flex justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate">
                  {v.profile?.full_name || v.profile?.email}
                  {v.profile?.college && <span className="text-stone"> · {v.profile.college}</span>}
                </span>
                <span className="t-meta shrink-0 text-stone">{formatDateTime(v.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WorldForm world={world as WorldDraft} themes={themes} patterns={PATTERNS} />
    </div>
  );
}
