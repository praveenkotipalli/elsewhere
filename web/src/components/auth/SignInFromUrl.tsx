"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { safeNext } from "@/lib/safe-next";
import { useSession } from "./SessionProvider";

/** `?signin=/account` (from the proxy) opens the sheet; `?auth=failed` explains a bounced link. */
export function SignInFromUrl() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { openAuth, notify, ready, user } = useSession();

  useEffect(() => {
    if (!ready) return;
    const signin = params.get("signin");
    const failed = params.get("auth") === "failed";
    if (!signin && !failed) return;

    if (signin) {
      const next = safeNext(signin);
      if (user) router.push(next);
      else openAuth({ kind: "signin", next });
    }
    if (failed) notify("That sign-in link expired or was already used. Try again.");
    router.replace(pathname, { scroll: false });
  }, [params, ready, user, openAuth, notify, router, pathname]);

  return null;
}
