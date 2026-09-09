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
import hero1w from "@/assets/hero/hero-1.webp";
import hero2w from "@/assets/hero/hero-2.webp";
import hero3w from "@/assets/hero/hero-3.webp";
import hero4w from "@/assets/hero/hero-4.webp";
import hero5w from "@/assets/hero/hero-5.webp";
import hero6w from "@/assets/hero/hero-6.webp";
import hero7w from "@/assets/hero/hero-7.webp";
import hero8w from "@/assets/hero/hero-8.webp";
import hero9w from "@/assets/hero/hero-9.webp";

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
 * Each slide ships in two formats: a WebP (roughly 35% smaller, used by
 * every current browser) and the original JPEG, which older iOS Safari
 * (pre-14) falls back to automatically via <picture>. Both are the same
 * photo at the same dimensions, so the design is identical either way.
 *
 * To change these photos, replace the files in src/assets/hero/ (or add/
 * remove entries here) and redeploy — there's no Admin Dashboard control
 * for this carousel by design; that's the trade made for zero-latency,
 * always-reliable hero images.
 */
type Slide = { jpg: string; webp: string };

export const HERO_SLIDE_SOURCES: Slide[] = [
  { jpg: hero3, webp: hero3w },
  { jpg: hero1, webp: hero1w },
  { jpg: hero2, webp: hero2w },
  { jpg: hero4, webp: hero4w },
  { jpg: hero5, webp: hero5w },
  { jpg: hero6, webp: hero6w },
  { jpg: hero7, webp: hero7w },
  { jpg: hero8, webp: hero8w },
  { jpg: hero9, webp: hero9w },
];

/** JPEG URLs, kept for the route's preload link and any legacy consumer. */
export const HERO_SLIDES = HERO_SLIDE_SOURCES.map((s) => s.jpg);

/** WebP URL of the first slide — what modern browsers actually download. */
export const HERO_FIRST_WEBP = HERO_SLIDE_SOURCES[0]!.webp;

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
 * the image to silently fail to render. It also means the browser only ever
 * downloads the slides actually shown — the other eight are never fetched
 * up front. Advancing to the next slide on an image error, rather than
 * getting stuck, is a further safety net for that same class of device.
 *
 * Rotation pauses while the tab is in the background or the hero has been
 * scrolled out of view, so no decoding work happens where it can't be seen.
 */
export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const advancing = useRef(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  function advance() {
    if (advancing.current) return;
    advancing.current = true;
    setVisible(false);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % HERO_SLIDE_SOURCES.length);
      setVisible(true);
      advancing.current = false;
    }, 500);
  }

  useEffect(() => {
    if (HERO_SLIDE_SOURCES.length < 2) return;

    let timer = 0;
    let onScreen = true;

    const start = () => {
      if (timer) return;
      timer = window.setInterval(advance, SLIDE_INTERVAL_MS);
    };
    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
    };
    const sync = () => {
      const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
      if (onScreen && !hidden) start();
      else stop();
    };

    // Pause when the hero scrolls away. Where IntersectionObserver is missing
    // (older iOS Safari) the slideshow simply keeps running as before.
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined" && wrap.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry ? entry.isIntersecting : true;
          sync();
        },
        { threshold: 0 }
      );
      observer.observe(wrap.current);
    }

    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const slide = HERO_SLIDE_SOURCES[index]!;

  return (
    <div
      ref={wrap}
      className="absolute inset-0 h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      <picture key={slide.jpg}>
        <source srcSet={slide.webp} type="image/webp" />
        <img
          src={slide.jpg}
          alt=""
          width={1080}
          height={1080}
          loading="eager"
          decoding={index === 0 ? "sync" : "async"}
          fetchPriority={index === 0 ? "high" : "low"}
          onError={advance}
          className={`animate-ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />
      </picture>
    </div>
  );
}
