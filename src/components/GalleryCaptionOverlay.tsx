type Props = {
  title: string | null;
  category: string;
  /**
   * Force the overlay to display, bypassing the hover/focus-only classes.
   * Used on touch devices (see `useTapReveal`) where a first tap reveals the
   * caption — the same look as desktop hover — before a second tap activates
   * the tile.
   */
  revealed?: boolean;
};

/**
 * Full-image caption overlay for the portfolio-style image tiles shared by
 * the /gallery grid and the homepage Featured Celebrations preview.
 *
 * A soft dark tint covers the whole image and the title/category fade in
 * together, centred over the photo — a quiet, editorial reveal rather than a
 * permanent caption strip. On pointer devices (desktop) it's hidden until
 * hover or keyboard focus. On touch devices there's no hover state, so the
 * parent drives visibility explicitly via the `revealed` prop instead (see
 * `useTapReveal`).
 *
 * The parent element must be positioned (`relative`, `overflow-hidden`) and
 * carry the `group` class so `group-hover`/`group-focus-visible` apply.
 */
export function GalleryCaptionOverlay({ title, category, revealed = false }: Props) {
  const shown = revealed
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100";

  const settled = revealed
    ? "translate-y-0"
    : "translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0";

  return (
    <span
      className={`absolute inset-0 flex flex-col items-center justify-center bg-espresso/60 px-6 text-center transition-opacity duration-500 ease-out ${shown}`}
      aria-hidden={!title}
    >
      <span className={`h-px w-9 bg-champagne/70 transition-transform duration-500 ease-out ${settled}`} />

      {title ? (
        <span
          className={`mt-4 block max-w-[16rem] truncate font-display text-xl text-cream transition-transform duration-500 ease-out ${settled}`}
        >
          {title}
        </span>
      ) : null}

      <span
        className={`eyebrow mt-2 block text-champagne/80 transition-transform duration-500 ease-out ${settled}`}
      >
        {category}
      </span>
    </span>
  );
}
