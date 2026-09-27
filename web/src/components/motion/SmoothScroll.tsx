"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "./scroll-lock";

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Touch devices already have great native momentum; don't fight it.
    if (reduced || coarse) return;

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    setLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
