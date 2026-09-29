import Link from "next/link";
import { RangeBar } from "@/components/admin/RangeBar";
import { requireAdmin, resolveRange } from "@/lib/admin";
import { familyForKind } from "@/lib/worlds/families";
import type { WorldKind } from "@/lib/types";

type Row = {
  world_id: string;
  kind: WorldKind;
  slug: string;
  name: string;
  is_public: boolean;
  products: number;
  visitors: number;
  avg_seconds: number | null;
  product_views: number;
  saves: number;
  interests: number;
  votes: number;
};

const KIND_LABEL: Record<WorldKind, string> = {
  style_icon: "Style icons",
  anime: "Anime",
  essentials: "Essentials",
  aesthetic: "Aesthetics",
  collection: "Collections",
};

export default async function AdminWorlds({ searchParams }: PageProps<"/admin/worlds">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const { supabase } = await requireAdmin();
  const range = resolveRange(sp);
  const { data, error } = await supabase.rpc("admin_world_stats", {
    p_from: range.from?.toISOString() ?? null,
    p_to: range.to.toISOString(),
  });
  const rows = (data ?? []) as Row[];
  const kinds = [...new Set(rows.map((r) => r.kind))];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-meta text-stone">Discovery</p>
          <h1 className="t-headline mt-2">
            Which worlds <span className="t-voice">pull people in?</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <RangeBar current={range.key} base="/admin/worlds" sp={sp} />
          <Link href="/admin/worlds/new" className="t-meta flex h-9 items-center bg-ink px-4 text-bone hover:bg-char-2">
            New world
          </Link>
        </div>
      </header>

      {error && <p className="t-meta text-signal">{error.message}</p>}

      {kinds.map((kind) => (
        <section key={kind} aria-labelledby={`k-${kind}`}>
          <h2 id={`k-${kind}`} className="t-title mb-3">
            {KIND_LABEL[kind]}
          </h2>
          <div className="overflow-x-auto border-t border-ink/15">
            <table className="w-full min-w-[52rem] border-collapse text-sm">
              <thead>
                <tr className="t-meta text-left text-stone">
                  <th className="py-3 pr-4 font-normal">World</th>
                  <th className="py-3 pr-4 text-right font-normal">Pieces</th>
                  <th className="py-3 pr-4 text-right font-normal">Visitors</th>
                  <th className="py-3 pr-4 text-right font-normal">Avg. time</th>
                  <th className="py-3 pr-4 text-right font-normal">Piece views from it</th>
                  <th className="py-3 pr-4 text-right font-normal">Saves</th>
                  <th className="py-3 pr-4 text-right font-normal">Interested</th>
                  <th className="py-3 text-right font-normal">Votes for more</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 border-y border-ink/10">
                {rows
                  .filter((r) => r.kind === kind)
                  .map((r) => {
                    const family = familyForKind(r.kind);
                    return (
                      <tr key={r.world_id} className="hover:bg-bone-2">
                        <td className="py-3 pr-4">
                          <Link href={`/admin/worlds/${r.world_id}`} className="link-line font-medium">
                            {r.name}
                          </Link>
                          <span className="t-meta ml-2 text-stone">
                            {family ? (family.single ? `/${family.key}` : `/${family.key}/${r.slug}`) : r.slug}
                            {!r.is_public && " · hidden"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">{r.products}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{r.visitors}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{r.avg_seconds != null ? `${r.avg_seconds}s` : "—"}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{r.product_views}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{r.saves}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{r.interests}</td>
                        <td className="py-3 text-right tabular-nums">{r.votes}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="max-w-[70ch] text-sm text-stone">
        Saves and interest are credited to the last world a visitor entered in the previous 30 minutes. &ldquo;Votes for
        more&rdquo; are signed-in people asking for pieces in that world — the clearest signal for what to design next.
      </p>
    </div>
  );
}
