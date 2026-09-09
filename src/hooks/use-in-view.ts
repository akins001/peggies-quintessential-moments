import { useEffect, useRef, useState } from "react";

/**
 * Reports whether an element has scrolled into the viewport, so content can
 * ease into place as the visitor scrolls instead of everything snapping in
 * at once. Fires once, then stops observing.
 *
 * Respects `prefers-reduced-motion`: reveals immediately, no observer at all.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Older iOS Safari (and any browser without IntersectionObserver) would
    // otherwise leave every wrapped section stuck at opacity-0 — i.e. blank
    // page. Reveal immediately instead of enhancing.
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }


    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
