"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { addImages, deleteImage, reorderImages, updateImageAlt } from "@/app/admin/products/actions";
import { imageUrl } from "@/lib/images";
import { supabaseBrowser } from "@/lib/supabase/client";

type Img = { id: string; src: string; alt: string; width: number | null; height: number | null };

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Photographs go straight from the browser to the public bucket (storage RLS
 * only admits admins), then their rows are written by a server action.
 * First image is the cover; the second shows on hover.
 */
export function ImageManager({ productId, productName, images }: { productId: string; productName: string; images: Img[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [drag, setDrag] = useState(false);

  async function upload(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).filter((f) => TYPES.includes(f.type));
    if (list.length === 0) return setError("JPG, PNG, WebP or AVIF only.");
    const tooBig = list.find((f) => f.size > MAX_BYTES);
    if (tooBig) return setError(`${tooBig.name} is over 10 MB. Export it smaller.`);

    const supabase = supabaseBrowser();
    const done: { src: string; alt: string; width: number | null; height: number | null }[] = [];
    for (const [i, file] of list.entries()) {
      setBusy(`Uploading ${i + 1} of ${list.length}`);
      let width: number | null = null;
      let height: number | null = null;
      try {
        const bmp = await createImageBitmap(file);
        width = bmp.width;
        height = bmp.height;
        bmp.close();
      } catch {}
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (error) {
        setBusy(null);
        return setError(`Upload failed: ${error.message}`);
      }
      done.push({ src: path, alt: productName, width, height });
    }
    setBusy("Saving");
    try {
      await addImages(productId, done);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the images.");
    } finally {
      setBusy(null);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const ids = images.map((i) => i.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    start(() => reorderImages(productId, ids));
  }

  return (
    <section aria-labelledby="images" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4 border-t border-ink/15 pt-4">
        <h2 id="images" className="t-title">
          Photographs
        </h2>
        <p className="t-meta text-stone">01 is the cover · 02 appears on hover</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
        {images.map((img, i) => (
          <li key={img.id} className="flex flex-col gap-2">
            <div className="relative aspect-[3/4] overflow-hidden bg-bone-2">
              <Image src={imageUrl(img.src)} alt={img.alt} fill sizes="200px" className="object-cover" />
              <span className="t-meta absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-bone">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <input
              defaultValue={img.alt}
              aria-label={`Alt text for photograph ${i + 1}`}
              placeholder="Describe the photo"
              onBlur={(e) => e.target.value !== img.alt && start(() => updateImageAlt(img.id, e.target.value))}
              className="h-9 border border-ink/15 bg-bone px-2 text-xs outline-none focus:border-ink"
            />
            <div className="t-meta flex items-center justify-between text-stone">
              <span className="flex gap-3">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || pending} className="hover:text-ink disabled:opacity-30" aria-label="Move earlier">
                  ←
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1 || pending} className="hover:text-ink disabled:opacity-30" aria-label="Move later">
                  →
                </button>
              </span>
              <button
                type="button"
                onClick={() => confirm("Remove this photograph?") && start(() => deleteImage(img.id))}
                className="link-line hover:text-signal"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files);
            }}
            disabled={!!busy}
            className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 border border-dashed p-4 text-center transition-colors ${
              drag ? "border-ink bg-bone-2" : "border-ink/30 hover:border-ink"
            }`}
          >
            <span className="t-meta">{busy ?? "Add photographs"}</span>
            {!busy && <span className="text-xs text-stone">Drop files or click. Several at once is fine.</span>}
          </button>
          <input
            ref={input}
            type="file"
            accept={TYPES.join(",")}
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </li>
      </ul>
      {error && (
        <p role="alert" className="t-meta text-signal">
          {error}
        </p>
      )}
    </section>
  );
}
