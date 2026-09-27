import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type InterestFilters = {
  product?: string;
  category?: string;
  from?: string; // yyyy-mm-dd
  to?: string;
  status?: "active" | "withdrawn" | "all";
};

export type InterestRow = {
  id: string;
  status: "active" | "withdrawn";
  created_at: string;
  updated_at: string;
  profile: { id: string; full_name: string | null; email: string | null; college: string | null } | null;
  product: { id: string; name: string; code: string | null; category: { name: string } | null } | null;
};

/** Interest records with the person and the piece. RLS limits this to admins. */
export async function queryInterests(supabase: SupabaseClient, f: InterestFilters, limit = 1000) {
  let q = supabase
    .from("product_interests")
    .select(
      `id, status, created_at, updated_at,
       profile:profiles(id, full_name, email, college),
       product:products!inner(id, name, code, category_id, category:categories(name))`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  const status = f.status ?? "active";
  if (status !== "all") q = q.eq("status", status);
  if (f.product) q = q.eq("product_id", f.product);
  if (f.category) q = q.eq("product.category_id", f.category);
  // Dates are IST calendar days.
  if (f.from) q = q.gte("created_at", `${f.from}T00:00:00+05:30`);
  if (f.to) q = q.lte("created_at", `${f.to}T23:59:59.999+05:30`);

  const { data, error, count } = await q;
  if (error) throw error;
  return { rows: (data ?? []) as unknown as InterestRow[], count: count ?? 0 };
}
