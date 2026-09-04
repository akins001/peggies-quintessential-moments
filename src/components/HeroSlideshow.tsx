import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchPublicHeroSlides } from "@/lib/hero-data";

/** Time each slide stays on screen before crossfading to the next. */
const SLIDE_INTERVAL_MS = 4500;

/**
 * Full-background hero slideshow, built entirely from images published in
 * the Admin Dashboard's hero slideshow manager — there is no bundled stock
 * photo. Until at least one image is published, the hero shows a plain
 * brand-toned gradient (never a placeholder photo) so the section still
 * looks intentional rather than broken.
 *
 * - No published hero images -> a quiet espresso/champagne gradient.
 * - Exactly one published image -> fades in over the gradient once loaded, static after that.
 * - Two or more -> once loaded, auto-advancing crossfade every ~4.5s.
 *
 * Every published slide is preloaded as soon as its URL is known, so the
 * first paint and every later crossfade in the rotation are ready to
 * display instantly rather than waiting on a network round trip.
 *
 * Images come exclusively from Supabase (`hero_slides` table + `hero-slides`
 * storage bucket) and are never mixed with the portfolio Gallery images.
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
      {/* Base layer for when there are no published slides yet (or before the
          first one has loaded) — a plain brand-toned gradient, never a stock photo. */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-espresso via-espresso to-primary" />

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
