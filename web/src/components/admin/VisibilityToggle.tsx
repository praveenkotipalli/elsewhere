"use client";

import { useOptimistic, useTransition } from "react";
import { setVisibility } from "@/app/admin/products/actions";

export function VisibilityToggle({ id, isPublic, disabled }: { id: string; isPublic: boolean; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useOptimistic(isPublic);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending || (disabled && !on)}
      title={disabled && !on ? "Add a photograph first" : undefined}
      onClick={() =>
        start(async () => {
          setOn(!on);
          await setVisibility(id, !on);
        })
      }
      className="t-meta flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className={`relative h-4 w-7 border transition-colors ${on ? "border-ink bg-ink" : "border-ink/30"}`}>
        <span className={`absolute top-0.5 size-2.5 transition-all ${on ? "left-3.5 bg-bone" : "left-0.5 bg-ink/40"}`} />
      </span>
      {on ? "Public" : "Hidden"}
    </button>
  );
}
