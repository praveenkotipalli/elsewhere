"use client";

import { useSession } from "@/components/auth/SessionProvider";

/**
 * "Make something for this world." A vote for the world itself — the signal for
 * which worlds deserve pieces next. Signed-out visitors sign in and the vote lands.
 */
export function WorldVote({ world, prompt }: { world: { id: string; name: string }; prompt: string }) {
  const { voted, setVote } = useSession();
  const on = voted.has(world.id);

  return (
    <div className="flex flex-col gap-4">
      <p className="t-title max-w-[26ch]">{prompt}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => !on && setVote(world, true)}
          aria-pressed={on}
          className={`flex h-14 items-center gap-3 px-6 transition-colors ${
            on ? "cursor-default bg-ink text-bone" : "bg-ink text-bone hover:bg-signal"
          }`}
        >
          {on && <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-signal" aria-hidden />}
          <span className="t-meta">{on ? "You asked for this" : `Make something for ${world.name}`}</span>
        </button>
        {on ? (
          <button type="button" onClick={() => setVote(world, false)} className="t-meta link-line text-stone">
            Take my vote back
          </button>
        ) : (
          <span className="text-xs text-stone">Free. It&rsquo;s how we decide what to design next.</span>
        )}
      </div>
    </div>
  );
}
