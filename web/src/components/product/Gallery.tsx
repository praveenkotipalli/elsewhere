"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { pad } from "@/lib/format";

export type GalleryImage = { src: string; alt: string; width: number | null; height: number | null };

/**
 * Desktop: a vertical editorial stack. Phone: a full-bleed swipe strip.
 * Either opens a zoom view; `cover` is the server-rendered first frame so the
 * card→page morph has something to land on.
 */
export function Gallery({ images, cover, name }: { images: GalleryImage[]; cover: ReactNode; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  const onStripScroll = () => {
    const el = strip.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <>
      {/* One track: a swipe strip on phones, an editorial stack from md up. */}
      <div className="relative">
        <div
          ref={strip}
          onScroll={onStripScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:flex-col md:gap-3 md:overflow-visible"
          aria-label={`${name} photographs`}
        >
          {images.map((img, i) => {
            const landscape = (img.width ?? 3) > (img.height ?? 4);
            return (
              <button
                key={img.src}
                onClick={() => setOpen(i)}
                className={`group relative block aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-bone-2 md:cursor-zoom-in ${
                  landscape ? "md:aspect-[4/3]" : ""
                } ${i > 0 && !landscape ? "md:w-[72%] md:self-end" : ""}`}
                aria-label={`Zoom photograph ${i + 1} of ${images.length}`}
              >
                {i === 0 ? (
                  cover
                ) : (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    quality={80}
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] md:group-hover:scale-[1.02]"
                  />
                )}
                <span className="t-meta absolute bottom-3 left-3 hidden text-white opacity-0 mix-blend-difference transition-opacity duration-500 group-hover:opacity-100 md:block">
                  {pad(i + 1)} — Zoom
                </span>
              </button>
            );
          })}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-between px-4 text-white mix-blend-difference md:hidden">
            <span className="t-meta tabular-nums">
              {pad(slide + 1)} / {pad(images.length)}
            </span>
            <span className="flex gap-1.5" aria-hidden>
              {images.map((_, i) => (
                <span key={i} className={`h-px w-5 bg-current transition-opacity ${i === slide ? "opacity-100" : "opacity-35"}`} />
              ))}
            </span>
          </div>
        )}
      </div>

      <Lightbox images={images} index={open} onIndex={setOpen} />
    </>
  );
}

function Lightbox({ images, index, onIndex }: { images: GalleryImage[]; index: number | null; onIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const close = useCallback(() => onIndex(null), [onIndex]);
  useScrollLock(open);
  useFocusTrap(ref, open, close);

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      onIndex((index + d + images.length) % images.length);
    },
    [index, images.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Photograph"
          data-lenis-prevent
          className="fixed inset-0 z-[75] flex flex-col bg-ink text-bone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="gutter flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <span className="t-meta tabular-nums text-ash">
              {pad(index + 1)} / {pad(images.length)}
            </span>
            <div className="flex items-center gap-6">
              {images.length > 1 && (
                <>
                  <button onClick={() => go(-1)} className="t-meta link-line">
                    Prev
                  </button>
                  <button onClick={() => go(1)} className="t-meta link-line">
                    Next
                  </button>
                </>
              )}
              <button onClick={close} className="t-meta link-line" data-autofocus>
                Close
              </button>
            </div>
          </div>
          <ZoomFrame key={index} image={images[index]} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Click to zoom; the magnified image tracks the pointer. On touch it becomes a pannable canvas. */
function ZoomFrame({ image }: { image: GalleryImage }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);

  if (touch) {
    return (
      <div className="min-h-0 flex-1 overflow-auto" data-lenis-prevent>
        <button
          onClick={() => setZoom((z) => !z)}
          className={`relative block ${zoom ? "h-[180svh] w-[240vw]" : "h-full w-full"}`}
          aria-label={zoom ? "Zoom out" : "Zoom in"}
        >
          <Image src={image.src} alt={image.alt} fill sizes={zoom ? "240vw" : "100vw"} quality={80} className={zoom ? "object-cover" : "object-contain"} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <button
        onClick={() => setZoom((z) => !z)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        className={`absolute inset-0 ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        aria-label={zoom ? "Zoom out" : "Zoom in"}
      >
        <motion.span
          className="absolute inset-0 block"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: zoom ? 2.3 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: origin }}
        >
          <Image src={image.src} alt={image.alt} fill sizes="100vw" quality={80} className="object-contain" />
        </motion.span>
      </button>
    </div>
  );
}
