type Props = {
  title: string | null;
  category: string;
};

/**
 * Full-image caption overlay for the portfolio-style image tiles shared by
 * the /gallery grid and the homepage Featured Celebrations preview.
 *
 * A soft dark tint covers the whole image and the title/category fade in
 * together, centred over the photo — a quiet, editorial reveal rather than a
 * permanent caption strip. On pointer devices (desktop) it's hidden until
 * hover or keyboard focus; on touch devices, where there's no hover state,
 * it stays visible so the caption is never hidden behind an interaction.
 *
 * The parent element must be positioned (`relative`, `overflow-hidden`) and
 * carry the `group` class so `group-hover`/`group-focus-visible` apply.
 */
export function GalleryCaptionOverlay({ title, category }: Props) {
  return (
    <span
      className="absolute inset-0 flex flex-col items-center justify-center bg-espresso/55 px-6 text-center opacity-100 transition-opacity duration-500 ease-out sm:bg-espresso/60 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
      aria-hidden={!title}
    >
      <span className="h-px w-9 bg-champagne/70 transition-transform duration-500 ease-out sm:-translate-y-1 sm:group-hover:translate-y-0 sm:group-focus-visible:translate-y-0" />

      {title ? (
        <span className="mt-4 block max-w-[16rem] truncate font-display text-xl text-cream transition-transform duration-500 ease-out sm:translate-y-1 sm:group-hover:translate-y-0 sm:group-focus-visible:translate-y-0">
          {title}
        </span>
      ) : null}

      <span className="eyebrow mt-2 block text-champagne/80 transition-transform duration-500 ease-out sm:translate-y-1 sm:group-hover:translate-y-0 sm:group-focus-visible:translate-y-0">
        {category}
      </span>
    </span>
  );
}
