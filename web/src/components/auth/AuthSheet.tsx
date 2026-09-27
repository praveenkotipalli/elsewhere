"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { site } from "@/lib/site";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useSession, type Intent } from "./SessionProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

function copyFor(intent: Intent | null) {
  switch (intent?.kind) {
    case "interest":
      return {
        kicker: "Early access",
        title: (
          <>
            Want first <span className="t-voice">access?</span>
          </>
        ),
        body: "Make an account and we'll count you in. If it gets made, you hear before anyone else.",
      };
    case "save":
      return {
        kicker: "Saved pieces",
        title: (
          <>
            Keep it <span className="t-voice">close.</span>
          </>
        ),
        body: "Make an account to save pieces and find them again, on any device.",
      };
    default:
      return {
        kicker: "The list",
        title: (
          <>
            You found <span className="t-voice">us.</span>
          </>
        ),
        body: "Save what you like, tell us what you want made, and hear first when it drops.",
      };
  }
}

export function AuthSheet() {
  const { authOpen, closeAuth, intent, user } = useSession();
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(authOpen);
  useFocusTrap(panel, authOpen, closeAuth);

  // Signing in finishes the job; get out of the way.
  useEffect(() => {
    if (authOpen && user) {
      const t = window.setTimeout(closeAuth, 900);
      return () => window.clearTimeout(t);
    }
  }, [authOpen, user, closeAuth]);

  return (
    <AnimatePresence>
      {authOpen && (
        <div className="fixed inset-0 z-[80]" role="presentation">
          <motion.button
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-ink/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={closeAuth}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            data-lenis-prevent
            className="grain absolute inset-x-0 bottom-0 max-h-[94svh] overflow-y-auto bg-ink text-bone md:inset-y-0 md:left-auto md:max-h-none md:w-[min(34rem,100%)]"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.75, ease: EASE }}
            style={{ willChange: "transform" }}
          >
            <SheetBody />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SheetBody() {
  const { intent, closeAuth, user } = useSession();
  const pathname = usePathname();
  const supabase = supabaseBrowser();
  const [step, setStep] = useState<"start" | "code">("start");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const copy = copyFor(intent);
  const product = intent && intent.kind !== "signin" ? intent : null;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const next = intent?.kind === "signin" && intent.next ? intent.next : pathname;

  async function google() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setBusy(false);
      setError("Google sign-in isn't available right now. Use your email instead.");
    }
  }

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("That email doesn't look right.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.status === 429 ? "Too many tries. Give it a minute." : "We couldn't send the code. Try again.");
      return;
    }
    setStep("code");
    setCooldown(45);
  }

  async function verify(e?: FormEvent) {
    e?.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setBusy(false);
    if (error) setError("That code didn't work. Check the latest email and try again.");
  }

  if (user) {
    return (
      <div className="flex min-h-[50svh] flex-col justify-between gap-16 p-6 md:min-h-full md:p-10">
        <p className="t-meta text-ash">Elsewhere</p>
        <p id="auth-title" className="t-display" aria-live="polite">
          You&rsquo;re <span className="t-voice">in.</span>
        </p>
        <p className="t-meta text-ash">{user.email}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-10 p-6 pb-10 md:gap-14 md:p-10">
      <div className="flex items-center justify-between">
        <p className="t-meta text-ash">
          Elsewhere <span className="px-2 text-graphite">/</span> {copy.kicker}
        </p>
        <button onClick={closeAuth} className="t-meta link-line -mr-1 px-1 py-2 text-bone">
          Close
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <h2 id="auth-title" className="t-display max-w-[11ch]">
          {copy.title}
        </h2>
        <p className="t-lede max-w-[34ch] text-fog">{copy.body}</p>
      </div>

      {product && (
        <div className="flex items-center gap-4 border-y border-char-2 py-4">
          {product.image && (
            <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-char">
              <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <p className="t-meta text-ash">{product.kind === "interest" ? "Joining the list for" : "Saving"}</p>
            <p className="t-title truncate">{product.productName}</p>
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-6" aria-busy={busy}>
        {step === "start" ? (
          <>
            {site.googleAuth && (
              <>
                <button
                  onClick={google}
                  disabled={busy}
                  className="group flex h-14 w-full items-center justify-between bg-bone px-5 text-ink transition-colors hover:bg-white disabled:opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <GoogleMark />
                    <span className="font-medium tracking-tight">Continue with Google</span>
                  </span>
                  <Arrow />
                </button>
                <div className="flex items-center gap-4 text-graphite" aria-hidden>
                  <span className="h-px flex-1 bg-char-2" />
                  <span className="t-meta">or</span>
                  <span className="h-px flex-1 bg-char-2" />
                </div>
              </>
            )}
            <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
              <label htmlFor="auth-email" className="t-meta text-ash">
                Email
              </label>
              <div className="flex items-end gap-3 border-b border-graphite focus-within:border-bone">
                <input
                  id="auth-email"
                  data-autofocus
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="h-12 min-w-0 flex-1 bg-transparent text-lg tracking-tight text-bone outline-none placeholder:text-graphite"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="t-meta flex h-12 shrink-0 items-center gap-2 text-bone disabled:opacity-50"
                >
                  {busy ? "Sending" : "Send code"} <Arrow />
                </button>
              </div>
              <p className="t-meta text-graphite">No password. We email you a 6-digit code.</p>
            </form>
          </>
        ) : (
          <form onSubmit={verify} className="flex flex-col gap-4">
            <label htmlFor="auth-code" className="t-meta text-ash">
              Code sent to <span className="normal-case text-bone">{email}</span>
            </label>
            <input
              id="auth-code"
              data-autofocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(v);
              }}
              placeholder="••••••"
              className="h-20 w-full border-b border-graphite bg-transparent font-mono text-5xl tracking-[0.4em] text-bone outline-none placeholder:text-char-2 focus:border-bone"
            />
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="mt-2 flex h-14 w-full items-center justify-between bg-bone px-5 text-ink transition-colors hover:bg-white disabled:bg-char-2 disabled:text-ash"
            >
              <span className="font-medium tracking-tight">{busy ? "Checking" : "Continue"}</span>
              <Arrow />
            </button>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep("start");
                  setCode("");
                  setError(null);
                }}
                className="t-meta link-line text-ash"
              >
                Different email
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || busy}
                onClick={() => sendCode()}
                className="t-meta link-line text-ash disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        <p role="alert" className="t-meta min-h-4 text-signal">
          {error}
        </p>

        <p className="text-xs leading-relaxed text-graphite">
          We only email you about pieces you asked for, and the drops they end up in. No newsletters you didn&rsquo;t
          ask for.
        </p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden className="shrink-0">
      <path d="M0 5h12.5M8.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#0d0d0c" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
    </svg>
  );
}
