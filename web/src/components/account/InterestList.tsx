"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "@/components/auth/SessionProvider";

export function InterestList({ items }: { items: { id: string; name: string; row: ReactNode }[] }) {
  const { interested, ready, user, setInterest } = useSession();
  const visible = ready && user ? items.filter((i) => interested.has(i.id)) : items;

  if (visible.length === 0) {
    return (
      <div className="py-16">
        <p className="t-headline max-w-[18ch]">
          You haven&rsquo;t asked for <span className="t-voice">anything yet.</span>
        </p>
        <p className="t-body mt-4 max-w-[38ch] text-stone">
          &ldquo;I&rsquo;m interested&rdquo; is how a piece gets made. Find one you&rsquo;d actually wear.
        </p>
        <Link href="/drop/001" className="t-meta link-line mt-8 inline-block">
          See Drop 001
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="t-body mb-6 max-w-[52ch] text-stone">
        You&rsquo;re counted for these. If one gets made, you&rsquo;ll hear before it&rsquo;s announced anywhere.
      </p>
      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {visible.map((i) => (
          <li key={i.id} className="relative">
            {i.row}
            <button
              onClick={() => setInterest({ id: i.id, name: i.name }, false)}
              className="t-meta link-line absolute right-0 top-5 text-stone hover:text-ink md:top-1/2 md:-translate-y-1/2"
            >
              Leave list
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
