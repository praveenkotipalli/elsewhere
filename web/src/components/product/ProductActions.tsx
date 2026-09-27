"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { InterestButton } from "./InterestButton";
import { SaveButton, SaveIcon } from "./SaveButton";

type P = { id: string; name: string; image?: string };

export function ProductActions({ product }: { product: P }) {
  const block = useRef<HTMLDivElement>(null);
  const [offscreen, setOffscreen] = useState(false);
  const { interested } = useSession();

  // Phones: once the in-page buttons scroll away, keep "I'm interested" in reach.
  useEffect(() => {
    const el = block.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={block} className="flex flex-col gap-4">
        <p className="t-title">
          Want this <span className="t-voice">when it drops?</span>
        </p>
        <div className="flex gap-2">
          <InterestButton product={product} className="flex-1" />
          <SaveButton product={product} className="self-start" />
        </div>
      </div>

      <AnimatePresence>
        {offscreen && !interested.has(product.id) && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink/10 bg-bone/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="min-w-0 flex-1">
              <InterestButton product={product} compact />
            </div>
            <div className="grid size-14 place-items-center border border-ink/20 text-ink [&>button]:mix-blend-normal [&>button]:text-ink">
              <SaveIcon product={product} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
