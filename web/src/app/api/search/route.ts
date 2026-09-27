import { NextResponse, type NextRequest } from "next/server";
import { getProducts, getVibes } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";

export type SearchHit = {
  slug: string;
  name: string;
  code: string | null;
  tagline: string | null;
  category: string | null;
  vibes: string[];
  image: string | null;
};

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 64);
  const [products, vibes] = await Promise.all([getProducts(), getVibes()]);
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = products
    .map((p) => {
      if (terms.length === 0) return { p, score: 1 };
      const fields: [string, number][] = [
        [p.name, 6],
        [p.code ?? "", 5],
        [p.vibes.map((v) => v.name).join(" "), 4],
        [p.category?.name ?? "", 4],
        [p.tags.join(" "), 3],
        [p.tagline ?? "", 2],
        [p.description ?? "", 1],
      ];
      let score = 0;
      for (const term of terms) {
        const hit = fields.find(([text]) => text.toLowerCase().includes(term));
        if (!hit) return { p, score: 0 };
        score += hit[1];
      }
      return { p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.p.sort - b.p.sort)
    .slice(0, 12);

  const hits: SearchHit[] = scored.map(({ p }) => ({
    slug: p.slug,
    name: p.name,
    code: p.code,
    tagline: p.tagline,
    category: p.category?.name ?? null,
    vibes: p.vibes.map((v) => v.name),
    image: p.images[0] ? imageUrl(p.images[0].src) : null,
  }));

  const matchedVibes = vibes
    .filter((v) => terms.length === 0 || terms.some((t) => v.name.toLowerCase().includes(t)))
    .map((v) => ({ slug: v.slug, name: v.name, tagline: v.tagline }));

  return NextResponse.json({ hits, vibes: matchedVibes }, { headers: { "Cache-Control": "public, s-maxage=60" } });
}
