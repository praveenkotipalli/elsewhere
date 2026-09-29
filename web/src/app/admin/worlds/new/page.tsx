import Link from "next/link";
import { WorldForm } from "@/components/admin/WorldForm";
import { PATTERNS } from "@/components/worlds/WorldArt";
import { requireAdmin } from "@/lib/admin";
import { THEMES } from "@/lib/worlds/themes";

export default async function NewWorld({ searchParams }: PageProps<"/admin/worlds/new">) {
  const sp = await searchParams;
  await requireAdmin();
  const themes = Object.values(THEMES).map((t) => ({ key: t.key, label: t.label }));
  const kind = typeof sp.kind === "string" ? sp.kind : "style_icon";

  return (
    <div className="flex flex-col gap-10">
      <header>
        <Link href="/admin/worlds" className="t-meta link-line text-stone">
          ← Worlds
        </Link>
        <h1 className="t-headline mt-3">
          A new <span className="t-voice">world.</span>
        </h1>
        <p className="mt-2 max-w-[60ch] text-sm text-stone">
          It stays hidden until you make it public. Its look comes from the family&rsquo;s default theme unless you pick
          another; a custom theme for this world can be added in code and chosen here.
        </p>
      </header>
      <WorldForm
        themes={themes}
        patterns={PATTERNS}
        world={{
          kind,
          name: "",
          slug: "",
          eyebrow: null,
          tagline: null,
          description: null,
          cover_src: null,
          cover_alt: null,
          accent: null,
          pattern: null,
          theme_key: null,
          is_public: false,
          sort: 0,
        }}
      />
    </div>
  );
}
