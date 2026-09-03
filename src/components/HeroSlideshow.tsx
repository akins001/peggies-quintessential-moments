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
 * - No published hero images -> the existing static ballroom photo (site never breaks).
 * - Exactly one published image -> shown as a plain static background, no animation.
 * - Two or more -> auto-advancing, smooth crossfade every ~4.5s.
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

  if (slides.length === 0) {
    return (
      <img
        src={heroBallroom}
        alt={FALLBACK_ALT}
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (slides.length === 1) {
    return (
      <img
        src={slides[0]!.url}
        alt=""
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      {slides.map((slide, i) => (
        <img
          key={slide.id}
          src={slide.url}
          alt=""
          width={1920}
          height={1280}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
