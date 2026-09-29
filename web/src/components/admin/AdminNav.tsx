"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/interest", label: "Interest" },
  { href: "/admin/products", label: "Pieces" },
  { href: "/admin/worlds", label: "Worlds" },
  { href: "/admin/people", label: "People" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0 md:pt-4">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`t-meta flex h-9 shrink-0 items-center px-2 transition-colors ${
              active ? "bg-ink text-bone" : "text-stone hover:bg-bone-2 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
