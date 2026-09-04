import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { GalleryLightbox } from "@/components/GalleryLightbox";
import { GalleryCaptionOverlay } from "@/components/GalleryCaptionOverlay";
import { Reveal } from "@/components/Reveal";
import { useTapReveal } from "@/hooks/use-tap-reveal";
import { useQuery } from "@tanstack/react-query";

import { GALLERY_CATEGORIES, galleryAlt, portfolioAspect, type GalleryCategory } from "@/lib/gallery";
import { fetchPublicGallery } from "@/lib/gallery-data";

const WHATSAPP =
  "https://wa.me/2349134153272?text=Hello%20Peggies%20Events%2C%20I%27d%20like%20to%20discuss%20an%20event.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Peggies Events — Luxury Event Decor in Abuja" },
      {
        name: "description",
        content:
          "Browse the full Peggies Events portfolio: weddings, traditional ceremonies, corporate functions, showers, proposals and gala dinners styled in Abuja.",
      },
      { property: "og:title", content: "Gallery | Peggies Events" },
      {
        property: "og:description",
        content:
          "The complete Peggies Events portfolio of weddings, traditional ceremonies, corporate events and luxury celebrations in Abuja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: all = [] } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: fetchPublicGallery,
  });
  const [filter, setFilter] = useState<GalleryCategory | "All">("All");
  const [active, setActive] = useState<number | null>(null);
  const { revealedId, handleTap } = useTapReveal();

  const items = useMemo(
    () => (filter === "All" ? all : all.filter((i) => i.category === filter)),
    [all, filter],
  );

  const filters: (GalleryCategory | "All")[] = ["All", ...GALLERY_CATEGORIES];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
          <Link to="/" className="min-w-0">
            <span className="block font-display text-2xl leading-none tracking-wide text-primary">
              Peggies Events
            </span>
            <span className="eyebrow mt-1 block truncate text-muted-foreground">
              Exclusive Events &middot; Abuja
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 border border-border px-4 py-2.5 text-xs tracking-[0.2em] uppercase text-primary transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <Reveal>
          <p className="eyebrow text-accent">The Full Portfolio</p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Every celebration, in cream, gold and candlelight.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Select an image to view it full-screen and move through the collection. New galleries are
            published as each celebration is photographed.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {filters.map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setActive(null);
                }}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "border border-accent bg-accent px-4 py-2 text-[0.6875rem] tracking-[0.2em] uppercase text-accent-foreground"
                    : "border border-border px-4 py-2 text-[0.6875rem] tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:border-accent hover:text-primary"
                }
              >
                {f}
              </button>
            );
          })}
        </div>

        <p className="eyebrow mt-6 text-muted-foreground">
          {items.length} {items.length === 1 ? "celebration" : "celebrations"}
        </p>

        <ul className="mt-8 columns-2 gap-4 sm:columns-3 sm:gap-5 lg:columns-4 [&>*]:mb-4 sm:[&>*]:mb-5">
          {items.map((item, i) => (
            <li key={item.id} className="break-inside-avoid">
              <Reveal delay={Math.min(i * 50, 400)}>
                <button
                  type="button"
                  onClick={() => handleTap(item.id, () => setActive(i))}
                  className={`group relative block w-full overflow-hidden border border-border bg-secondary/60 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.5)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_26px_55px_-20px_rgba(0,0,0,0.6)] text-left ${portfolioAspect(
                    i
                  )}`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={galleryAlt(item)}
                      width={1024}
                      height={1280}
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
                        revealedId === item.id ? "scale-[1.04]" : ""
                      }`}
                    />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
                      <span className="font-display text-4xl text-accent/50">P</span>
                      <span className="eyebrow text-muted-foreground">Coming soon</span>
                    </span>
                  )}

                  {/* Caption overlay: hidden by default, fades in on hover/focus (desktop),
                      or on a first tap that reveals it before a second tap opens the
                      lightbox (touch devices — see useTapReveal). */}
                  <GalleryCaptionOverlay
                    title={item.title}
                    category={item.category}
                    revealed={revealedId === item.id}
                  />
                </button>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl text-primary sm:text-3xl">
            Ready to design yours?
          </h2>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-accent px-8 py-4 text-xs tracking-[0.22em] uppercase text-accent-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Book a consultation
          </a>
        </Reveal>
      </main>

      <GalleryLightbox items={items} index={active} onClose={() => setActive(null)} onChange={setActive} />
    </div>
  );
}
