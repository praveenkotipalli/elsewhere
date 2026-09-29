import Link from "next/link";

/**
 * Where you are: Elsewhere → Anime → Naruto, with a way back to every world.
 */
export function WorldBreadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="You are here" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <ol className="t-meta flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href="/" className="link-line text-stone hover:text-ink">
            Elsewhere
          </Link>
        </li>
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-2">
            <span aria-hidden className="text-ash">
              /
            </span>
            {t.href && i < trail.length - 1 ? (
              <Link href={t.href} className="link-line text-stone hover:text-ink">
                {t.label}
              </Link>
            ) : (
              <span aria-current="page">{t.label}</span>
            )}
          </li>
        ))}
      </ol>
      <Link href="/discover" className="t-meta link-line text-stone hover:text-ink">
        ← All worlds
      </Link>
    </nav>
  );
}
