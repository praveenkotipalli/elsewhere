"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSession } from "@/components/auth/SessionProvider";

type P = { id: string; name: string; image?: string };
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The validation mechanism. One tap says "I want this"; the button becomes the
 * confirmation, and withdrawing is a quiet secondary link, never an accident.
 */
export function InterestButton({ product, className = "", compact = false }: { product: P; className?: string; compact?: boolean }) {
  const { interested, setInterest } = useSession();
  const on = interested.has(product.id);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => !on && setInterest(product, true)}
        aria-pressed={on}
        aria-disabled={on}
        className={`relative flex h-14 w-full items-center justify-between overflow-hidden px-5 transition-colors duration-500 ${
          on ? "cursor-default bg-ink text-bone" : "bg-ink text-bone hover:bg-char-2"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {on ? (
            <motion.span
              key="on"
              className="flex items-center gap-3"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-signal" aria-hidden />
              <span className="t-meta">You&rsquo;re on the list</span>
            </motion.span>
          ) : (
            <motion.span
              key="off"
              className="t-meta"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              I&rsquo;m interested
            </motion.span>
          )}
        </AnimatePresence>
        {!on && (
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path d="M0 5h12.5M8.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        )}
      </button>
      {!compact && (
        <p className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-stone">
          {on ? (
            <>
              <span>We&rsquo;ll tell you first if it gets made.</span>
              <button type="button" onClick={() => setInterest(product, false)} className="link-line">
                Take me off the list
              </button>
            </>
          ) : (
            <span>Not for sale. Tapping this is how we decide what gets made.</span>
          )}
        </p>
      )}
    </div>
  );
}
