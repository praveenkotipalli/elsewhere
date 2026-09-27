import { NextResponse, type NextRequest } from "next/server";
import { queryInterests, type InterestFilters } from "@/lib/admin-queries";
import { supabaseServer } from "@/lib/supabase/server";

// Formula-injection safe CSV cell.
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  const supabase = await supabaseServer();
  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) return new NextResponse("Not found", { status: 404 });

  const sp = request.nextUrl.searchParams;
  const filters: InterestFilters = {
    product: sp.get("product") || undefined,
    category: sp.get("category") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    status: (sp.get("status") as InterestFilters["status"]) || "active",
  };
  const { rows } = await queryInterests(supabase, filters, 50_000);

  const header = ["name", "email", "college", "piece_code", "piece", "category", "status", "interested_at", "updated_at"];
  const lines = rows.map((r) =>
    [
      r.profile?.full_name,
      r.profile?.email,
      r.profile?.college,
      r.product?.code,
      r.product?.name,
      r.product?.category?.name,
      r.status,
      r.created_at,
      r.updated_at,
    ]
      .map(cell)
      .join(","),
  );
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="elsewhere-interest-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
