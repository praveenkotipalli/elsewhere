import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { formOptions } from "../options";

export default async function NewProduct() {
  const { supabase } = await requireAdmin();
  const [opts, { data: last }] = await Promise.all([
    formOptions(supabase),
    supabase.from("products").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <header>
        <Link href="/admin/products" className="t-meta link-line text-stone">
          ← Pieces
        </Link>
        <h1 className="t-headline mt-3">
          A new <span className="t-voice">proposal.</span>
        </h1>
        <p className="mt-2 text-sm text-stone">Save it first, then add photographs. It stays hidden until you make it public.</p>
      </header>
      <ProductForm
        {...opts}
        product={{
          name: "",
          slug: "",
          code: null,
          tagline: null,
          description: null,
          story: null,
          details: [],
          tags: [],
          category_id: null,
          drop_id: null,
          status: "concept",
          is_public: false,
          price_minor: null,
          sort: (last?.sort ?? 0) + 1,
          vibe_ids: [],
          has_images: false,
        }}
      />
    </div>
  );
}
