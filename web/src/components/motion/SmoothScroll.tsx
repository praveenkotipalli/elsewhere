"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { setLenis } from "./scroll-lock";

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Touch devices already have great native momentum; don't fight it.
    if (reduced || coarse) return;

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    lenisRef.current = lenis;
    setLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  // After a navigation Next positions the page (top, or the restored spot on back).
  // Kill any glide still in flight and adopt that position instead of fighting it.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const id = requestAnimationFrame(() => lenis.scrollTo(window.scrollY, { immediate: true, force: true }));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
