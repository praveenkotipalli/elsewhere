import "server-only";
import { redirect } from "next/navigation";
import { normalize, PRODUCT_SELECT } from "./catalog";
import { supabaseServer } from "./supabase/server";
import type { Product } from "./types";

export async function requireUser(next: string) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/?signin=${encodeURIComponent(next)}`);
  return { supabase, user: data.user };
}

export async function getSavedProducts(next = "/account/saved") {
  const { supabase, user } = await requireUser(next);
  const { data, error } = await supabase
    .from("wishlists")
    .select(`created_at, product:products(${PRODUCT_SELECT})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .filter((r) => r.product)
    .map((r) => ({ savedAt: r.created_at as string, product: normalize(r.product as never) as Product }));
}

export async function getInterests(next = "/account/list") {
  const { supabase, user } = await requireUser(next);
  const { data, error } = await supabase
    .from("product_interests")
    .select(`created_at, status, product:products(${PRODUCT_SELECT})`)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .filter((r) => r.product)
    .map((r) => ({ since: r.created_at as string, product: normalize(r.product as never) as Product }));
}
