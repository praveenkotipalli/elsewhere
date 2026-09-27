"use client";

import { useSession } from "@/components/auth/SessionProvider";

type P = { id: string; name: string; image?: string };

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" aria-hidden className="shrink-0">
      <path
        d="M8 13.7S1.2 9.6 1.2 5a3.6 3.6 0 0 1 6.8-1.7A3.6 3.6 0 0 1 14.8 5C14.8 9.6 8 13.7 8 13.7Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.2"
        style={{ transition: "fill .3s" }}
      />
    </svg>
  );
}

/** Heart on imagery (cards). */
export function SaveIcon({ product, className = "" }: { product: P; className?: string }) {
  const { saved, toggleSave } = useSession();
  const on = saved.has(product.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(product);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${product.name} from saved` : `Save ${product.name}`}
      className={`grid size-10 place-items-center text-white mix-blend-difference transition-transform duration-300 active:scale-90 ${className}`}
    >
      <Heart filled={on} />
    </button>
  );
}

/** Labelled save control (product page). */
export function SaveButton({ product, className = "" }: { product: P; className?: string }) {
  const { saved, toggleSave } = useSession();
  const on = saved.has(product.id);
  return (
    <button
      type="button"
      onClick={() => toggleSave(product)}
      aria-pressed={on}
      className={`flex h-14 items-center justify-center gap-3 border border-ink/20 px-5 transition-colors hover:border-ink ${className}`}
    >
      <Heart filled={on} />
      <span className="t-meta">{on ? "Saved" : "Save"}</span>
    </button>
  );
}
