"use client";

import { useEffect } from "react";
import { setTrail, track } from "@/lib/track";

/**
 * Records that a world (or a family index) was seen, remembers it as the trail
 * for what happens next, and reports how long the visitor actually looked
 * (visible time only, sent when they leave or hide the tab).
 */
export function WorldTracker({
  worldId,
  name,
  family,
  href,
}: {
  worldId: string | null;
  name: string;
  family: string;
  href: string;
}) {
  useEffect(() => {
    if (worldId) {
      setTrail({ worldId, name, family, href });
      track("world_view", { worldId, family });
    } else {
      track("family_view", { worldId: null, family });
      return;
    }

    let visibleSince = document.visibilityState === "visible" ? performance.now() : 0;
    let total = 0;
    let sent = false;

    const flush = () => {
      if (sent) return;
      if (visibleSince) total += performance.now() - visibleSince;
      visibleSince = 0;
      if (total > 1500) {
        sent = true;
        track("world_time", { worldId, family, durationMs: Math.min(total, 3_600_000) });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince) total += performance.now() - visibleSince;
        visibleSince = 0;
      } else if (!sent) {
        visibleSince = performance.now();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [worldId, name, family, href]);

  return null;
}
