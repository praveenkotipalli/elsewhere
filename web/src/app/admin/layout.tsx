import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Wordmark } from "@/components/brand/Wordmark";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-svh bg-bone text-ink md:grid md:grid-cols-[13rem_1fr]">
      <aside className="border-b border-ink/15 md:sticky md:top-0 md:flex md:h-svh md:flex-col md:border-b-0 md:border-r">
        <div className="flex h-14 items-center justify-between px-5 md:h-16">
          <Link href="/" className="text-sm" aria-label="Back to the site">
            <Wordmark />
          </Link>
          <span className="t-meta text-stone md:hidden">Admin</span>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-3 border-t border-ink/15 p-5 md:flex">
          <p className="t-meta break-all text-stone">{user.email}</p>
          <form action="/auth/signout" method="post">
            <button className="t-meta link-line">Sign out</button>
          </form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-5 pb-20 pt-8 md:px-10 md:pt-10">
        {children}
      </main>
    </div>
  );
}
