"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSession } from "@/components/auth/SessionProvider";

export function Toast() {
  const { toast } = useSession();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[90] flex justify-center px-4 md:bottom-8">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.p
            key={toast.id}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 bg-ink px-4 py-3 text-sm tracking-tight text-bone shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]"
          >
            <span
              aria-hidden
              className={`size-1.5 rounded-full ${toast.tone === "signal" ? "bg-signal" : "bg-fog"}`}
            />
            {toast.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
