import { useEffect, useRef, useState } from "react";

import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";
import hero4 from "@/assets/hero/hero-4.jpg";
import hero5 from "@/assets/hero/hero-5.jpg";
import hero6 from "@/assets/hero/hero-6.jpg";
import hero7 from "@/assets/hero/hero-7.jpg";
import hero8 from "@/assets/hero/hero-8.jpg";
import hero9 from "@/assets/hero/hero-9.jpg";

/** Time each slide stays on screen before advancing to the next. */
const SLIDE_INTERVAL_MS = 4500;

/**
 * Bundled directly with the site build — these ship in the same asset
 * bundle as everything else, so there is no runtime fetch and therefore no
 * possibility of a loading gap or flash before the carousel appears.
 *
 * hero-3 leads the rotation because it's the smallest file — the first
 * image the visitor sees should be the fastest one to finish downloading
 * (see the matching <link rel="preload"> in the route's head() config).
 *
 * To change these photos, replace the files in src/assets/hero/ (or add/
 * remove entries here) and redeploy — there's no Admin Dashboard control
 * for this carousel by design; that's the trade made for zero-latency,
 * always-reliable hero images.
 */
export const HERO_SLIDES = [hero3, hero1, hero2, hero4, hero5, hero6, hero7, hero8, hero9];

/**
 * Full-background hero slideshow. Every image is bundled at build time, so
 * the very first paint already has a real photo in it — nothing to fetch,
 * nothing to flash. Starts advancing immediately on mount, no interaction
 * needed.
 *
 * Only ONE image is ever mounted/decoded at a time (a brief fade-to-black
 * between slides, rather than two images cross-fading simultaneously).
 * That's deliberate: holding all slides decoded in memory at once is fine
 * on modern hardware but can overwhelm older, lower-memory phones, causing
 * the image to silently fail to render. Advancing to the next slide on an
 * image error, rather than getting stuck, is a further safety net for that
 * same class of device.
 */
export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const advancing = useRef(false);

  function advance() {
    if (advancing.current) return;
    advancing.current = true;
    setVisible(false);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
      setVisible(true);
      advancing.current = false;
    }, 500);
  }

  useEffect(() => {
    const id = window.setInterval(advance, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      <img
        key={HERO_SLIDES[index]}
        src={HERO_SLIDES[index]}
        alt=""
        width={1920}
        height={1280}
        loading="eager"
        fetchPriority="high"
        onError={advance}
        className={`animate-ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
