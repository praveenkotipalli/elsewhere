"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSession } from "./SessionProvider";

const AuthSheet = dynamic(() => import("./AuthSheet").then((m) => m.AuthSheet), { ssr: false });

/** Loads the sheet the first time anyone needs it, then keeps it mounted for exit animations. */
export function LazyAuthSheet() {
  const { authOpen } = useSession();
  const [needed, setNeeded] = useState(false);
  if (authOpen && !needed) setNeeded(true);
  return needed ? <AuthSheet /> : null;
}
