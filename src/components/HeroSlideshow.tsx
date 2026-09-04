import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import heroBallroom from "@/assets/hero-ballroom.jpg";
import { fetchPublicHeroSlides } from "@/lib/hero-data";

/** Time each slide stays on screen before crossfading to the next. */
const SLIDE_INTERVAL_MS = 4500;

const FALLBACK_ALT =
  "Cream and gold draped ballroom with chandeliers and floral centrepieces styled by Peggies Events";

/**
 * Full-background hero slideshow.
 *
 * The fallback ballroom photo is always rendered as a base layer underneath
 * everything else, with its Ken Burns zoom running immediately on mount. Any
 * admin-uploaded slide sits on top of it. This matters because admin images
 * are fetched at runtime (fresh signed URLs, not bundled with the app), so
 * there's a brief network delay before they're actually downloaded — with
 * the fallback always present behind them, that gap simply shows the
 * fallback photo (already in motion) instead of a flash of the bare overlay
 * behind an image that hasn't painted yet.
 *
 * - No published hero images -> the fallback stays, indefinitely (site never breaks).
 * - Exactly one published image -> fades in over the fallback once loaded, static after that.
 * - Two or more -> once loaded, auto-advancing crossfade every ~4.5s.
 *
 * Slide images are also preloaded as soon as they're known, so later
 * crossfades in the rotation don't have their own loading gap either.
 *
 * Images come exclusively from the Admin Dashboard's hero slideshow manager
 * (Supabase `hero_slides` table + `hero-slides` storage bucket) and are never
 * mixed with the portfolio Gallery images.
 */
export function HeroSlideshow() {
  const { data: slides = [] } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: fetchPublicHeroSlides,
    staleTime: 5 * 60 * 1000,
  });

  const [active, setActive] = useState(0);

  // Keep the active index valid if the slide count changes underneath us.
  useEffect(() => {
    setActive((i) => (slides.length === 0 ? 0 : i % slides.length));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  // Warm the browser cache for every slide as soon as URLs are known, so the
  // <img> tags below can paint instantly instead of each waiting on its own
  // network round trip the first time it's shown.
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.url;
    });
  }, [slides]);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      {/* Always-present base layer — see the note above on why this never goes away. */}
      <img
        src={heroBallroom}
        alt={slides.length === 0 ? FALLBACK_ALT : ""}
        width={1920}
        height={1280}
        className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
      />

      {slides.length === 1 && (
        <img
          src={slides[0]!.url}
          alt=""
          width={1920}
          height={1280}
          className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
        />
      )}

      {slides.length > 1 &&
        slides.map((slide, i) => (
          <img
            key={slide.id}
            src={slide.url}
            alt=""
            width={1920}
            height={1280}
            className={`animate-ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
    </div>
  );
}
