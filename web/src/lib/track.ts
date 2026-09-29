"use client";

import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Discovery analytics. Every event carries the world the visitor most recently
 * entered (the "trail"), so the admin can answer "people who explore Naruto end
 * up wanting these pieces". The trail lives in sessionStorage and expires after
 * 30 minutes of not being refreshed.
 */
export type TrackEvent = "family_view" | "world_view" | "world_time" | "product_view" | "save" | "interest" | "world_vote";

type Trail = { worldId: string; name: string; family: string; href: string; at: number };

const VISITOR_KEY = "ew:visitor";
const TRAIL_KEY = "ew:trail";
const TRAIL_TTL = 30 * 60 * 1000;
const recent = new Map<string, number>();

export function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function setTrail(trail: Omit<Trail, "at">) {
  try {
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify({ ...trail, at: Date.now() }));
  } catch {}
}

export function getTrail(): Trail | null {
  try {
    const raw = sessionStorage.getItem(TRAIL_KEY);
    if (!raw) return null;
    const trail = JSON.parse(raw) as Trail;
    if (Date.now() - trail.at > TRAIL_TTL) return null;
    // Any activity keeps the trail warm.
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify({ ...trail, at: Date.now() }));
    return trail;
  } catch {
    return null;
  }
}

export function track(
  event: TrackEvent,
  data: { worldId?: string | null; productId?: string | null; family?: string | null; durationMs?: number } = {},
) {
  const visitor = visitorId();
  if (!visitor) return;
  const worldId = data.worldId !== undefined ? data.worldId : (getTrail()?.worldId ?? null);

  // The same event twice within a few seconds is a double-mount, not a second look.
  if (event !== "world_time") {
    const key = `${event}:${worldId}:${data.productId ?? ""}`;
    const now = Date.now();
    if (now - (recent.get(key) ?? 0) < 4000) return;
    recent.set(key, now);
  }
  // Fire and forget: analytics must never get in the way of the page.
  supabaseBrowser()
    .rpc("track_event", {
      p_event: event,
      p_visitor_id: visitor,
      p_world_id: worldId,
      p_product_id: data.productId ?? null,
      p_family: data.family ?? null,
      p_duration_ms: data.durationMs != null ? Math.round(data.durationMs) : null,
    })
    .then(
      () => {},
      () => {},
    );
}
