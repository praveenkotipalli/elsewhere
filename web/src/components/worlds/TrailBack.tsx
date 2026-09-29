"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrail } from "@/lib/track";

/** "← Back to Naruto": shown on a piece when the visitor arrived from a world. */
export function TrailBack() {
  const [trail, setTrail] = useState<{ name: string; href: string } | null>(null);
  // Read after mount: the trail lives in sessionStorage, which the server can't see.
  useEffect(() => {
    const t = getTrail();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t) setTrail({ name: t.name, href: t.href });
  }, []);
  if (!trail) return null;
  return (
    <Link href={trail.href} className="t-meta link-line w-fit text-stone hover:text-ink">
      ← Back to {trail.name}
    </Link>
  );
}
