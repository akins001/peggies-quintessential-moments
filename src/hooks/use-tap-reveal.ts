import { useCallback, useState } from "react";

/**
 * "Tap to reveal, tap again to activate" for gallery-style image tiles on
 * touch devices, where there's no hover state to preview the caption/zoom
 * before committing to an action (opening the lightbox).
 *
 * On hover-capable pointer devices (mouse/trackpad) the caption already
 * reveals on real `:hover`, so a tap/click there always activates
 * immediately. On touch devices, the first tap on a tile just reveals it —
 * matching the desktop hover look — and a second tap on that same tile (or
 * tapping a tile that's already revealed) activates it. Tapping a different
 * tile switches the reveal to that one instead.
 */
export function useTapReveal() {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const handleTap = useCallback(
    (id: string, onActivate: () => void) => {
      const canHover =
        typeof window !== "undefined" &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (!canHover && revealedId !== id) {
        setRevealedId(id);
        return;
      }

      setRevealedId(null);
      onActivate();
    },
    [revealedId]
  );

  return { revealedId, handleTap };
}
