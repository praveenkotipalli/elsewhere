"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const KEY = "ew:visitor";

function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Counts a product view once per visitor per 30 minutes (deduped in the database). */
export function ViewBeacon({ productId }: { productId: string }) {
  useEffect(() => {
    const id = visitorId();
    if (!id) return;
    supabaseBrowser().rpc("record_view", { p_product_id: productId, p_visitor_id: id }).then(() => {});
  }, [productId]);
  return null;
}
