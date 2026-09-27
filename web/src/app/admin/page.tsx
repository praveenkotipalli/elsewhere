import Image from "next/image";
import Link from "next/link";
import { DailyBars } from "@/components/admin/DailyBars";
import { RangeBar } from "@/components/admin/RangeBar";
import { pct, requireAdmin, resolveRange } from "@/lib/admin";
import { statusLabel } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { ProductStatus } from "@/lib/types";

type Stat = {
  product_id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  is_public: boolean;
  category: string | null;
  cover: string | null;
  viewers: number;
  saves: number;
  interested: number;
  conversion: number | null;
};

type Overview = {
  total_users: number;
  new_users: number;
  active_interests: number;
  new_interests: number;
  interested_users: number;
  total_saves: number;
  new_saves: number;
  viewers: number;
  public_products: number;
  total_products: number;
};

export default async function AdminOverview({ searchParams }: PageProps<"/admin">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const { supabase } = await requireAdmin();
  const range = resolveRange(sp);

  // Charts need a concrete start; "all time" begins at the earliest signal, up to a year back.
  let chartFrom = range.from;
  if (!chartFrom) {
    const { data: first } = await supabase.from("profiles").select("created_at").order("created_at").limit(1).maybeSingle();
    const earliest = first ? new Date(first.created_at) : new Date();
    chartFrom = new Date(Math.max(earliest.getTime(), range.to.getTime() - 365 * 86_400_000));
  }

  const [overview, stats, daily] = await Promise.all([
    supabase.rpc("admin_overview", { p_from: (range.from ?? new Date(0)).toISOString(), p_to: range.to.toISOString() }),
    supabase.rpc("admin_product_stats", {
      p_from: range.from?.toISOString() ?? null,
      p_to: range.to.toISOString(),
      p_category: null,
    }),
    supabase.rpc("admin_daily_activity", { p_from: chartFrom.toISOString(), p_to: range.to.toISOString(), p_product: null }),
  ]);

  const o = (overview.data ?? {}) as Overview;
  const rows = ((stats.data ?? []) as Stat[]).sort((a, b) => b.interested - a.interested || b.saves - a.saves);
  const maxInterest = Math.max(1, ...rows.map((r) => r.interested));
  const days = (daily.data ?? []) as { day: string; interests: number; saves: number; signups: number; viewers: number }[];
  const topSaved = [...rows].sort((a, b) => b.saves - a.saves).slice(0, 5);

  const tiles = [
    { label: "Registered people", value: o.total_users, note: `+${o.new_users ?? 0} in range` },
    { label: "People who want something", value: o.interested_users, note: `${pct(o.total_users ? o.interested_users / o.total_users : null)} of everyone` },
    { label: "Active interests", value: o.active_interests, note: `+${o.new_interests ?? 0} in range` },
    { label: "Saves", value: o.total_saves, note: `+${o.new_saves ?? 0} in range` },
    { label: "Product viewers", value: o.viewers, note: "unique, in range" },
    { label: "Pieces live", value: o.public_products, note: `of ${o.total_products ?? 0} total` },
  ];

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-meta text-stone">Validation</p>
          <h1 className="t-headline mt-2">
            What should we <span className="t-voice">make?</span>
          </h1>
        </div>
        <RangeBar current={range.key} base="/admin" sp={sp} />
      </header>

      <section aria-label="Totals" className="grid grid-cols-2 border-l border-t border-ink/15 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-3 border-b border-r border-ink/15 p-4">
            <p className="t-meta text-stone">{t.label}</p>
            <p className="text-4xl font-[520] tabular-nums tracking-[-0.04em]">{t.value ?? 0}</p>
            <p className="t-meta text-stone">{t.note}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="board">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="board" className="t-title">
            Decision board
          </h2>
          <p className="t-meta text-stone">Ranked by interest · conversion = interested ÷ viewers</p>
        </div>
        <div className="overflow-x-auto border-t border-ink/15">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="t-meta text-left text-stone">
                <th className="py-3 pr-4 font-normal">#</th>
                <th className="py-3 pr-4 font-normal">Piece</th>
                <th className="py-3 pr-4 font-normal">Status</th>
                <th className="w-[26%] py-3 pr-4 font-normal">Interested</th>
                <th className="py-3 pr-4 text-right font-normal">Saves</th>
                <th className="py-3 pr-4 text-right font-normal">Viewers</th>
                <th className="py-3 text-right font-normal">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 border-y border-ink/10">
              {rows.map((r, i) => (
                <tr key={r.product_id} className="group hover:bg-bone-2">
                  <td className="t-meta py-3 pr-4 text-stone">{String(i + 1).padStart(2, "0")}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/interest?product=${r.product_id}`} className="flex items-center gap-3">
                      <span className="relative block aspect-[3/4] w-8 shrink-0 overflow-hidden bg-bone-3">
                        {r.cover && <Image src={imageUrl(r.cover)} alt="" fill sizes="32px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="link-line font-medium">{r.name}</span>
                        <span className="t-meta block text-stone">
                          {r.category}
                          {!r.is_public && " · hidden"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="t-meta py-3 pr-4">{statusLabel[r.status]}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-right tabular-nums">{r.interested}</span>
                      <span className="h-2 flex-1 bg-ink/5" aria-hidden>
                        <span className="block h-full bg-signal" style={{ width: `${(r.interested / maxInterest) * 100}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{r.saves}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{r.viewers}</td>
                  <td className="py-3 text-right tabular-nums">{pct(r.conversion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Activity over time" className="grid gap-10 md:grid-cols-3">
        <DailyBars title="Interests per day" tone="signal" data={days.map((d) => ({ day: d.day, value: Number(d.interests) }))} />
        <DailyBars title="Saves per day" data={days.map((d) => ({ day: d.day, value: Number(d.saves) }))} />
        <DailyBars title="New people per day" data={days.map((d) => ({ day: d.day, value: Number(d.signups) }))} />
      </section>

      <section aria-labelledby="saved" className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="saved" className="t-title mb-4">
            Most saved
          </h2>
          <ol className="divide-y divide-ink/10 border-y border-ink/10">
            {topSaved.map((r, i) => (
              <li key={r.product_id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="flex items-baseline gap-3">
                  <span className="t-meta text-stone">{String(i + 1).padStart(2, "0")}</span>
                  {r.name}
                </span>
                <span className="tabular-nums">{r.saves}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-3 text-sm text-stone">
          <h2 className="t-title text-ink">Reading this</h2>
          <p>
            <strong className="font-medium text-ink">Interested</strong> is the vote: a signed-in person asking for the piece to exist.
            Withdrawn interest is not counted. <strong className="font-medium text-ink">Saves</strong> are softer — someone bookmarking it.
          </p>
          <p>
            <strong className="font-medium text-ink">Conversion</strong> compares interested people with unique viewers of the piece page in
            the same window. Low views with high conversion usually means the piece is strong but under-shown.
          </p>
        </div>
      </section>
    </div>
  );
}
