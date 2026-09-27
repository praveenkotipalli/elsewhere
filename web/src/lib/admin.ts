import "server-only";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

/** Admin pages 404 for everyone else, so the admin area's existence isn't advertised. */
export async function requireAdmin() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/?signin=/admin");
  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) notFound();
  return { supabase, user: data.user };
}

export const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;

export type RangeKey = (typeof RANGES)[number]["key"];

/**
 * Resolves ?range= (or explicit ?from=&to= dates) into an inclusive window.
 * "All time" charts start at the first day there is any data, capped at a year.
 */
export function resolveRange(sp: { range?: string; from?: string; to?: string }) {
  const to = sp.to ? endOfDay(new Date(sp.to)) : new Date();
  if (sp.from) {
    return { key: "custom" as const, from: new Date(sp.from), to, label: `${sp.from} → ${sp.to ?? "today"}` };
  }
  const r = RANGES.find((x) => x.key === sp.range) ?? RANGES[1];
  const from = r.days ? new Date(to.getTime() - (r.days - 1) * 86_400_000) : null;
  return { key: r.key, from, to, label: r.label };
}

function endOfDay(d: Date) {
  d.setHours(23, 59, 59, 999);
  return d;
}

export function pct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(n < 0.1 ? 1 : 0)}%`;
}

export function toQuery(sp: Record<string, string | undefined>, patch: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}
