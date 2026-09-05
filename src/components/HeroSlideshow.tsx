import { useEffect, useState } from "react";

import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";
import hero4 from "@/assets/hero/hero-4.jpg";
import hero5 from "@/assets/hero/hero-5.jpg";
import hero6 from "@/assets/hero/hero-6.jpg";
import hero7 from "@/assets/hero/hero-7.jpg";
import hero8 from "@/assets/hero/hero-8.jpg";
import hero9 from "@/assets/hero/hero-9.jpg";

/** Time each slide stays on screen before crossfading to the next. */
const SLIDE_INTERVAL_MS = 4500;

/**
 * Bundled directly with the site build — these ship in the same asset
 * bundle as everything else, so there is no runtime fetch and therefore no
 * possibility of a loading gap or flash before the carousel appears.
 *
 * To change these photos, replace the files in src/assets/hero/ (or add/
 * remove entries here) and redeploy — there's no Admin Dashboard control
 * for this carousel by design; that's the trade made for zero-latency,
 * always-reliable hero images.
 */
const SLIDES = [hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8, hero9];

/**
 * Full-background hero slideshow. Every image is bundled at build time, so
 * the very first paint already has real photos in it — nothing to fetch,
 * nothing to flash. Starts crossfading immediately on mount, no interaction
 * needed.
 */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      {SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          width={1920}
          height={1280}
          // The first slide should paint immediately with priority; the rest
          // can load slightly behind it without delaying first paint.
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          className={`animate-ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
