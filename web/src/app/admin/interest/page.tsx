import Link from "next/link";
import { toQuery, requireAdmin } from "@/lib/admin";
import { queryInterests, type InterestFilters } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/format";

export default async function InterestPage({ searchParams }: PageProps<"/admin/interest">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const { supabase } = await requireAdmin();

  const filters: InterestFilters = {
    product: sp.product || undefined,
    category: sp.category || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    status: (sp.status as InterestFilters["status"]) || "active",
  };

  const [{ rows, count }, products, categories] = await Promise.all([
    queryInterests(supabase, filters),
    supabase.from("products").select("id, name, code").order("sort"),
    supabase.from("categories").select("id, name").order("sort"),
  ]);

  const selected = products.data?.find((p) => p.id === filters.product);
  const saves = selected
    ? (await supabase.from("wishlists").select("*", { count: "exact", head: true }).eq("product_id", selected.id)).count
    : null;
  const exportHref = `/admin/export${toQuery(sp)}`;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="t-meta text-stone">Interest</p>
        {selected ? (
          <h1 className="t-headline">
            {selected.name} <span className="t-voice text-stone">— {count} interested</span>
          </h1>
        ) : (
          <h1 className="t-headline">
            Who wants <span className="t-voice">what.</span>
          </h1>
        )}
        {selected && (
          <p className="t-meta text-stone">
            {selected.code} · {saves ?? 0} saves ·{" "}
            <Link href="/admin/interest" className="link-line">
              all pieces
            </Link>
          </p>
        )}
      </header>

      {/* Plain GET form: every filtered view is a shareable URL. */}
      <form method="get" className="grid grid-cols-2 items-end gap-3 border-y border-ink/15 py-4 md:grid-cols-6">
        <Select name="product" label="Piece" value={filters.product} options={(products.data ?? []).map((p) => [p.id, `${p.code ?? ""} ${p.name}`.trim()])} />
        <Select name="category" label="Category" value={filters.category} options={(categories.data ?? []).map((c) => [c.id, c.name])} />
        <DateField name="from" label="From" value={filters.from} />
        <DateField name="to" label="To" value={filters.to} />
        <Select
          name="status"
          label="Status"
          value={filters.status}
          allLabel={null}
          options={[
            ["active", "Interested"],
            ["withdrawn", "Withdrawn"],
            ["all", "Everything"],
          ]}
        />
        <div className="col-span-2 flex gap-2 md:col-span-1">
          <button className="t-meta h-10 flex-1 bg-ink px-4 text-bone hover:bg-char-2">Apply</button>
          <Link href="/admin/interest" className="t-meta grid h-10 place-items-center border border-ink/15 px-3 hover:bg-bone-2">
            Reset
          </Link>
        </div>
      </form>

      <div className="flex items-center justify-between gap-4">
        <p className="t-meta text-stone">
          {count} record{count === 1 ? "" : "s"}
          {count > rows.length && ` · showing latest ${rows.length}`}
        </p>
        <a href={exportHref} className="t-meta link-line">
          Download CSV
        </a>
      </div>

      {rows.length === 0 ? (
        <p className="t-lede py-10 text-stone">No one yet, for this filter. That&rsquo;s a real zero — nothing here is padded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <thead>
              <tr className="t-meta text-left text-stone">
                <th className="py-3 pr-4 font-normal">Person</th>
                <th className="py-3 pr-4 font-normal">Email</th>
                <th className="py-3 pr-4 font-normal">College</th>
                {!selected && <th className="py-3 pr-4 font-normal">Piece</th>}
                <th className="py-3 pr-4 font-normal">Interested on</th>
                <th className="py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 border-y border-ink/10">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-bone-2">
                  <td className="py-3 pr-4 font-medium">{r.profile?.full_name || <span className="text-stone">—</span>}</td>
                  <td className="py-3 pr-4">
                    {r.profile?.email && (
                      <a href={`mailto:${r.profile.email}`} className="link-line">
                        {r.profile.email}
                      </a>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-stone">{r.profile?.college || "—"}</td>
                  {!selected && (
                    <td className="py-3 pr-4">
                      <Link href={`/admin/interest${toQuery(sp, { product: r.product?.id })}`} className="link-line">
                        {r.product?.name}
                      </Link>
                    </td>
                  )}
                  <td className="py-3 pr-4 tabular-nums text-stone">{formatDateTime(r.created_at)}</td>
                  <td className="t-meta py-3">
                    <span className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${r.status === "active" ? "bg-signal" : "bg-fog"}`} aria-hidden />
                      {r.status === "active" ? "Interested" : "Withdrawn"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Select({
  name,
  label,
  value,
  options,
  allLabel = "All",
}: {
  name: string;
  label: string;
  value?: string;
  options: [string, string][];
  allLabel?: string | null;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-meta text-stone">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="h-10 border border-ink/15 bg-bone px-2 text-sm outline-none focus:border-ink">
        {allLabel && <option value="">{allLabel}</option>}
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateField({ name, label, value }: { name: string; label: string; value?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-meta text-stone">{label}</span>
      <input type="date" name={name} defaultValue={value} className="h-10 border border-ink/15 bg-bone px-2 text-sm outline-none focus:border-ink" />
    </label>
  );
}
