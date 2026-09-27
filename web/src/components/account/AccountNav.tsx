"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/auth/SessionProvider";

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { saved, interested, signOut } = useSession();
  const tabs = [
    { href: "/account/saved", label: "Saved", count: saved.size },
    { href: "/account/list", label: "On the list", count: interested.size },
    { href: "/account", label: "Profile" },
  ];

  return (
    <nav aria-label="Account" className="mt-12 flex items-center justify-between gap-6 border-b border-ink/15 md:mt-16">
      <ul className="no-scrollbar -mb-px flex gap-6 overflow-x-auto md:gap-10">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`t-meta flex h-12 items-center gap-2 whitespace-nowrap border-b transition-colors ${
                  active ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink"
                }`}
              >
                {t.label}
                {t.count !== undefined && <span className="tabular-nums text-stone">{String(t.count).padStart(2, "0")}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex shrink-0 items-center gap-6">
        {isAdmin && (
          <Link href="/admin" className="t-meta link-line hidden md:inline">
            Admin
          </Link>
        )}
        <button onClick={signOut} className="t-meta link-line text-stone hover:text-ink">
          Sign out
        </button>
      </div>
    </nav>
  );
}
