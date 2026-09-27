import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export default async function PeoplePage() {
  const { supabase } = await requireAdmin();
  const [{ data: people, count }, { data: interests }, { data: saves }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, college, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("product_interests").select("user_id").eq("status", "active"),
    supabase.from("wishlists").select("user_id"),
  ]);

  const tally = (rows: { user_id: string }[] | null) =>
    (rows ?? []).reduce<Record<string, number>>((m, r) => ((m[r.user_id] = (m[r.user_id] ?? 0) + 1), m), {});
  const iCount = tally(interests);
  const sCount = tally(saves);

  const colleges = Object.entries(
    (people ?? []).reduce<Record<string, number>>((m, p) => {
      const k = p.college?.trim() || "Not given";
      m[k] = (m[k] ?? 0) + 1;
      return m;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="t-meta text-stone">People</p>
        <h1 className="t-headline mt-2">
          {count ?? 0} <span className="t-voice">signed up.</span>
        </h1>
      </header>

      {colleges.length > 0 && (
        <section aria-label="By college" className="flex flex-wrap gap-2">
          {colleges.map(([c, n]) => (
            <span key={c} className="t-meta flex h-8 items-center gap-2 border border-ink/15 px-3">
              {c} <span className="tabular-nums text-stone">{n}</span>
            </span>
          ))}
        </section>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="t-meta text-left text-stone">
              <th className="py-3 pr-4 font-normal">Name</th>
              <th className="py-3 pr-4 font-normal">Email</th>
              <th className="py-3 pr-4 font-normal">College</th>
              <th className="py-3 pr-4 text-right font-normal">Interested in</th>
              <th className="py-3 pr-4 text-right font-normal">Saved</th>
              <th className="py-3 font-normal">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 border-y border-ink/10">
            {(people ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-bone-2">
                <td className="py-3 pr-4 font-medium">{p.full_name || <span className="text-stone">—</span>}</td>
                <td className="py-3 pr-4">{p.email}</td>
                <td className="py-3 pr-4 text-stone">{p.college || "—"}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{iCount[p.id] ?? 0}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{sCount[p.id] ?? 0}</td>
                <td className="py-3 tabular-nums text-stone">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
