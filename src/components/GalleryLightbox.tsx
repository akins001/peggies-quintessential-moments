import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { galleryAlt, type GalleryItem } from "@/lib/gallery";

type Props = {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function GalleryLightbox({ items, index, onClose, onChange }: Props) {
  const open = index !== null;

  const next = useCallback(() => {
    if (index === null || items.length === 0) return;
    onChange((index + 1) % items.length);
  }, [index, items.length, onChange]);

  const prev = useCallback(() => {
    if (index === null || items.length === 0) return;
    onChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, next, prev, onClose]);

  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title || "Portfolio image"} — image ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[100] flex flex-col bg-espresso/97 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-champagne/15 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          {item.title ? (
            <p className="truncate font-display text-xl text-cream sm:text-2xl">{item.title}</p>
          ) : null}
          <p className="eyebrow truncate text-champagne/70">
            {item.category} &middot; {item.location}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs tracking-[0.2em] text-cream/50 sm:inline">
            {index + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="border border-champagne/30 p-2 text-cream transition-colors hover:bg-cream/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
        {item.image ? (
          <img
            src={item.image}
            alt={galleryAlt(item)}
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center gap-4 border border-champagne/25 px-8 text-center">
            <span className="font-display text-5xl text-champagne/50">P</span>
            <span className="eyebrow text-champagne/70">Photography coming soon</span>
          </div>
        )}

        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 border border-champagne/25 bg-espresso/70 p-3 text-cream transition-colors hover:bg-cream/10 sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 border border-champagne/25 bg-espresso/70 p-3 text-cream transition-colors hover:bg-cream/10 sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="border-t border-champagne/15 px-4 py-3 text-center text-xs tracking-[0.2em] text-cream/50 sm:hidden">
        {index + 1} / {items.length}
      </div>
    </div>
  );
}
