import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { GalleryLightbox } from "@/components/GalleryLightbox";
import { GalleryImage } from "@/components/GalleryImage";
import { GalleryCaptionOverlay } from "@/components/GalleryCaptionOverlay";
import { Reveal } from "@/components/Reveal";
import { useTapReveal } from "@/hooks/use-tap-reveal";
import { useQuery } from "@tanstack/react-query";

import {
  GALLERY_CATEGORIES,
  galleryAlt,
  PORTFOLIO_CARD_ASPECT,
  type GalleryCategory,
} from "@/lib/gallery";
import { fetchPublicGallery } from "@/lib/gallery-data";

const WHATSAPP =
  "https://wa.me/2349134153272?text=Hello%20Peggies%20Events%2C%20I%27d%20like%20to%20discuss%20an%20event.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Luxury Event Decor & Weddings in Abuja | Peggies Events" },
      {
        name: "description",
        content:
          "Browse the full Peggies Events portfolio: luxury weddings, traditional ceremonies, corporate galas, showers, proposals and gala dinners styled in Abuja, Nigeria.",
      },
      { property: "og:title", content: "Gallery | Peggies Events — Luxury Event Decor in Abuja" },
      {
        property: "og:description",
        content:
          "The complete Peggies Events portfolio of weddings, traditional ceremonies, corporate events and luxury celebrations in Abuja, Nigeria.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Peggies Events" },
      { property: "og:url", content: "https://peggies-quintessential-moments.lovable.app/gallery" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Gallery | Peggies Events" },
      {
        name: "twitter:description",
        content:
          "Luxury weddings, traditional ceremonies and corporate celebrations styled by Peggies Events in Abuja, Nigeria.",
      },
    ],
    links: [{ rel: "canonical", href: "https://peggies-quintessential-moments.lovable.app/gallery" }],
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

        <ul className="mt-10 grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.id}>
              <Reveal delay={Math.min(i * 50, 400)}>
                <button
                  type="button"
                  onClick={() => handleTap(item.id, () => setActive(i))}
                  className="group block w-full text-left"
                >
                  <span
                    className={`relative block w-full overflow-hidden border border-border bg-secondary/60 ${PORTFOLIO_CARD_ASPECT}`}
                  >
                    {item.image ? (
                      <GalleryImage
                        src={item.image}
                        webp={item.imageWebp}
                        alt={galleryAlt(item)}
                        eager={i < 3}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
                        <span className="font-display text-4xl text-accent/50">P</span>
                        <span className="eyebrow text-muted-foreground">Coming soon</span>
                      </span>
                    )}

                    <GalleryCaptionOverlay
                      title={item.title}
                      category={item.category}
                      revealed={revealedId === item.id}
                    />
                  </span>
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
