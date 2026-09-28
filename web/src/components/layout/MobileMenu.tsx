"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { pad } from "@/lib/format";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { NAV } from "./nav";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileMenu({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, openAuth, saved } = useSession();
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="grain fixed inset-0 z-[45] flex flex-col bg-ink text-bone md:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <nav aria-label="Menu" className="gutter flex flex-1 flex-col justify-center pt-[var(--header-h)]">
            <ul className="flex flex-col gap-1">
              {NAV.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.06 }}
                  >
                    <Link href={item.href} onClick={onClose} className="flex items-baseline gap-4 py-1">
                      <span className="t-meta w-6 text-graphite">{pad(i + 1)}</span>
                      <span className="text-[clamp(2.75rem,13vw,4.5rem)] font-[540] leading-[0.95] tracking-[-0.05em]">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="gutter grid grid-cols-2 gap-x-4 gap-y-5 border-t border-char-2 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            <button onClick={onSearch} className="t-meta text-left">
              Search
            </button>
            {user ? (
              <>
                <Link href="/account/saved" onClick={onClose} className="t-meta">
                  Saved ({saved.size})
                </Link>
                <Link href="/account" onClick={onClose} className="t-meta">
                  Account
                </Link>
                <Link href="/account/list" onClick={onClose} className="t-meta">
                  On the list
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openAuth();
                }}
                className="t-meta text-left"
              >
                Sign in
              </button>
            )}
            <p className="t-meta col-span-2 text-graphite">Nothing here is for sale yet. Tell us what to make.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
