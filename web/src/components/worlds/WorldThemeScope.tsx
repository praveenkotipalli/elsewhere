import type { ReactNode } from "react";
import { themeCss } from "@/lib/worlds/themes";
import type { ResolvedTheme } from "@/lib/worlds/themes/types";
import { WorldArt } from "./WorldArt";

/**
 * Puts a page inside a world. The marker attribute switches the whole document's
 * tokens via :has() (see themeCss); the backdrop and entrance are the world's
 * atmosphere. Leaving the page removes the marker and the house style returns.
 */
export function WorldThemeScope({
  theme,
  scope,
  accent,
  children,
}: {
  theme: ResolvedTheme;
  /** Unique per world, e.g. "anime-naruto". */
  scope: string;
  accent: string;
  children: ReactNode;
}) {
  const css = themeCss(theme, scope);
  const backdrop = theme.backdrop ?? "none";

  return (
    <div data-world-theme={scope} data-world-scheme={theme.scheme} className="relative isolate">
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}

      {backdrop !== "none" && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {backdrop === "grain" ? (
            <div className="grain absolute inset-0" />
          ) : (
            <WorldArt
              pattern={backdrop}
              accent={accent}
              seed={`${scope}-backdrop`}
              intensity={0.12}
              className="world-backdrop absolute inset-0 size-full"
            />
          )}
        </div>
      )}

      {theme.entrance === "wipe" && <div aria-hidden className="world-wipe" style={{ background: theme.palette.accent }} />}
      {theme.entrance === "fade" && <div aria-hidden className="world-fade" />}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
