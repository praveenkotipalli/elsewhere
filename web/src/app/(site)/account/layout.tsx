import type { Metadata } from "next";
import { AccountNav } from "@/components/account/AccountNav";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const { supabase, user } = await requireUser("/account");
  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.rpc("is_admin"),
  ]);
  const name = profile?.full_name?.split(" ")[0];

  return (
    <div className="gutter min-h-[80svh] pb-[clamp(5rem,10vw,9rem)] pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))]">
      <header className="grid gap-y-6 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">(Your corner)</p>
        <h1 className="t-display md:col-span-9">
          {name ? (
            <>
              Hey, <span className="t-voice">{name}.</span>
            </>
          ) : (
            <>
              Your <span className="t-voice">corner.</span>
            </>
          )}
        </h1>
      </header>
      <AccountNav isAdmin={admin === true} />
      <div className="mt-10 md:mt-14">{children}</div>
    </div>
  );
}
