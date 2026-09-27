"use client";

import { useEffect } from "react";
import { lockScroll } from "@/components/motion/scroll-lock";

export function useScrollLock(active: boolean) {
  useEffect(() => (active ? lockScroll() : undefined), [active]);
}
