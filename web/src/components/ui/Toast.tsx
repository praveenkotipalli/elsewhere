"use client";

import { useSession } from "@/components/auth/SessionProvider";

/** CSS-only so the always-mounted chrome doesn't pull the animation library into every page. */
export function Toast() {
  const { toast } = useSession();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[90] flex justify-center px-4 md:bottom-8"
    >
      {toast && (
        <p
          key={toast.id}
          className="flex animate-[toast-in_0.5s_var(--ease-out-expo)_both] items-center gap-3 bg-ink px-4 py-3 text-sm tracking-tight text-bone shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]"
        >
          <span aria-hidden className={`size-1.5 rounded-full ${toast.tone === "signal" ? "bg-signal" : "bg-fog"}`} />
          {toast.message}
        </p>
      )}
    </div>
  );
}
