"use client";

import Link from "next/link";
import { useSession } from "@/components/auth/SessionProvider";
import { Arrow } from "@/components/ui/Arrow";

export function FinalCallActions() {
  const { user, ready, openAuth, saved, interested } = useSession();

  if (ready && user) {
    return (
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
        <Link href="/account" className="group flex h-14 w-full items-center justify-between bg-bone px-5 text-ink transition-colors hover:bg-white md:w-80">
          <span className="t-meta">
            You&rsquo;re in — {saved.size} saved, {interested.size} on the list
          </span>
          <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
        <Link href="/drop/001" className="t-meta link-line w-fit text-ash hover:text-bone">
          Back to Drop 001
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
      <button
        onClick={() => openAuth()}
        className="group flex h-14 w-full items-center justify-between bg-bone px-5 text-ink transition-colors hover:bg-white md:w-80"
      >
        <span className="t-meta">Get on the list</span>
        <Arrow className="transition-transform duration-500 group-hover:translate-x-1" />
      </button>
      <Link href="/drop/001" className="t-meta link-line w-fit text-ash hover:text-bone">
        Or keep looking
      </Link>
    </div>
  );
}
