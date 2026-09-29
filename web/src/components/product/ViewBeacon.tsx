"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { track, visitorId } from "@/lib/track";

/**
 * Counts a product view once per visitor per 30 minutes (deduped in the database),
 * and records it on the discovery trail with the world the visitor came from.
 */
export function ViewBeacon({ productId }: { productId: string }) {
  useEffect(() => {
    const id = visitorId();
    if (!id) return;
    supabaseBrowser().rpc("record_view", { p_product_id: productId, p_visitor_id: id }).then(() => {});
    track("product_view", { productId });
  }, [productId]);
  return null;
}
