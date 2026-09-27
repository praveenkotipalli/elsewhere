import type Lenis from "lenis";

let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Nested-safe page scroll lock used by overlays (menu, search, auth, lightbox). */
export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    document.documentElement.dataset.scrollLocked = "";
    lenis?.stop();
  }
  return () => {
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      delete document.documentElement.dataset.scrollLocked;
      lenis?.start();
    }
  };
}
