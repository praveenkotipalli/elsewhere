"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Something the visitor tried to do before signing in, replayed right after. */
export type Intent =
  | { kind: "save"; productId: string; productName: string; image?: string }
  | { kind: "interest"; productId: string; productName: string; image?: string }
  | { kind: "signin"; next?: string };

type Toast = { id: number; message: string; tone: "plain" | "signal" };

type Session = {
  user: User | null;
  ready: boolean;
  saved: Set<string>;
  interested: Set<string>;
  authOpen: boolean;
  intent: Intent | null;
  openAuth: (intent?: Intent) => void;
  closeAuth: () => void;
  toggleSave: (p: { id: string; name: string; image?: string }) => Promise<void>;
  setInterest: (p: { id: string; name: string; image?: string }, on: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  toast: Toast | null;
  notify: (message: string, tone?: Toast["tone"]) => void;
};

const Ctx = createContext<Session | null>(null);
const INTENT_KEY = "ew:intent";
const INTENT_TTL = 15 * 60 * 1000;

function stashIntent(intent: Intent | null) {
  try {
    if (intent) localStorage.setItem(INTENT_KEY, JSON.stringify({ intent, at: Date.now() }));
    else localStorage.removeItem(INTENT_KEY);
  } catch {}
}

function takeStashedIntent(): Intent | null {
  try {
    const raw = localStorage.getItem(INTENT_KEY);
    localStorage.removeItem(INTENT_KEY);
    if (!raw) return null;
    const { intent, at } = JSON.parse(raw);
    return Date.now() - at < INTENT_TTL ? intent : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const intentRef = useRef<Intent | null>(null);

  const notify = useCallback((message: string, tone: Toast["tone"] = "plain") => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  const loadSignals = useCallback(
    async (uid: string) => {
      const [w, i] = await Promise.all([
        supabase.from("wishlists").select("product_id").eq("user_id", uid),
        supabase.from("product_interests").select("product_id").eq("user_id", uid).eq("status", "active"),
      ]);
      setSaved(new Set((w.data ?? []).map((r) => r.product_id)));
      setInterested(new Set((i.data ?? []).map((r) => r.product_id)));
    },
    [supabase],
  );

  // Raw writes. Optimistic, rolled back on failure.
  const writeSave = useCallback(
    async (uid: string, productId: string, on: boolean) => {
      setSaved((s) => {
        const n = new Set(s);
        if (on) n.add(productId);
        else n.delete(productId);
        return n;
      });
      const { error } = on
        ? await supabase.from("wishlists").upsert({ user_id: uid, product_id: productId }, { ignoreDuplicates: true })
        : await supabase.from("wishlists").delete().eq("user_id", uid).eq("product_id", productId);
      if (error) {
        setSaved((s) => {
          const n = new Set(s);
          if (on) n.delete(productId);
          else n.add(productId);
          return n;
        });
        throw error;
      }
    },
    [supabase],
  );

  const writeInterest = useCallback(
    async (productId: string, on: boolean) => {
      setInterested((s) => {
        const n = new Set(s);
        if (on) n.add(productId);
        else n.delete(productId);
        return n;
      });
      const { error } = await supabase.rpc("set_interest", { p_product_id: productId, p_interested: on });
      if (error) {
        setInterested((s) => {
          const n = new Set(s);
          if (on) n.delete(productId);
          else n.add(productId);
          return n;
        });
        throw error;
      }
    },
    [supabase],
  );

  const runIntent = useCallback(
    async (uid: string, it: Intent) => {
      try {
        if (it.kind === "save") {
          await writeSave(uid, it.productId, true);
          notify(`${it.productName} — saved.`);
        } else if (it.kind === "interest") {
          await writeInterest(it.productId, true);
          notify(`You're on the list for ${it.productName}.`, "signal");
        } else if (it.next) {
          router.push(it.next);
        } else {
          notify("You're in.");
        }
      } catch {
        notify("That didn't go through. Try once more.");
      }
    },
    [writeSave, writeInterest, notify, router],
  );

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      const u = data.session?.user ?? null;
      setUser(u);
      setReady(true);
      if (u) {
        await loadSignals(u.id);
        // Returning from a Google redirect: finish what they started.
        const pending = takeStashedIntent();
        if (pending) runIntent(u.id, pending);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_IN" && u) {
        loadSignals(u.id).then(() => {
          const pending = intentRef.current ?? takeStashedIntent();
          intentRef.current = null;
          stashIntent(null);
          setIntent(null);
          if (pending) runIntent(u.id, pending);
        });
        router.refresh();
      }
      if (event === "SIGNED_OUT") {
        setSaved(new Set());
        setInterested(new Set());
        router.refresh();
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAuth = useCallback((it?: Intent) => {
    const next = it ?? null;
    intentRef.current = next;
    setIntent(next);
    stashIntent(next);
    setAuthOpen(true);
  }, []);

  // A Google redirect unloads the page before this can run, so the stash survives
  // exactly when it's needed and is dropped when the visitor simply walks away.
  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    intentRef.current = null;
    stashIntent(null);
  }, []);

  const toggleSave = useCallback(
    async (p: { id: string; name: string; image?: string }) => {
      if (!user) return openAuth({ kind: "save", productId: p.id, productName: p.name, image: p.image });
      const on = !saved.has(p.id);
      try {
        await writeSave(user.id, p.id, on);
        notify(on ? `${p.name} — saved.` : `${p.name} — removed.`);
      } catch {
        notify("That didn't go through. Try once more.");
      }
    },
    [user, saved, openAuth, writeSave, notify],
  );

  const setInterest = useCallback(
    async (p: { id: string; name: string; image?: string }, on: boolean) => {
      if (!user) return openAuth({ kind: "interest", productId: p.id, productName: p.name, image: p.image });
      try {
        await writeInterest(p.id, on);
        notify(on ? `You're on the list for ${p.name}.` : `Taken off the list for ${p.name}.`, on ? "signal" : "plain");
      } catch {
        notify("That didn't go through. Try once more.");
      }
    },
    [user, openAuth, writeInterest, notify],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [supabase, router]);

  const value = useMemo<Session>(
    () => ({
      user,
      ready,
      saved,
      interested,
      authOpen,
      intent,
      openAuth,
      closeAuth,
      toggleSave,
      setInterest,
      signOut,
      toast,
      notify,
    }),
    [user, ready, saved, interested, authOpen, intent, openAuth, closeAuth, toggleSave, setInterest, signOut, toast, notify],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
