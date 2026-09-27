"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "@/components/auth/SessionProvider";

/**
 * Server renders the cards; the client hides the ones un-saved in this session
 * so removing a piece feels immediate without a refetch.
 */
export function SavedGrid({ items }: { items: { id: string; card: ReactNode }[] }) {
  const { saved, ready, user } = useSession();
  const visible = ready && user ? items.filter((i) => saved.has(i.id)) : items;

  if (visible.length === 0) {
    return (
      <div className="py-16">
        <p className="t-headline max-w-[16ch]">
          Nothing saved <span className="t-voice">yet.</span>
        </p>
        <p className="t-body mt-4 max-w-[36ch] text-stone">Tap the heart on anything that stops you. It lands here.</p>
        <Link href="/drop/001" className="t-meta link-line mt-8 inline-block">
          Start with Drop 001
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-6">
      {visible.map((i) => (
        <div key={i.id}>{i.card}</div>
      ))}
    </div>
  );
}
