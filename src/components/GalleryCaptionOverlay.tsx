type Props = {
  title: string | null;
  category: string;
};

/**
 * Caption overlay for gallery-style image tiles.
 *
 * Hidden by default and fades in on hover/keyboard focus (desktop, pointer
 * devices). Always visible at readable opacity on touch devices, where
 * there's no hover state, so the caption stays accessible.
 *
 * The parent element must be positioned (`relative`) and carry the `group`
 * class so `group-hover`/`group-focus-visible` apply.
 */
export function GalleryCaptionOverlay({ title, category }: Props) {
  return (
    <span
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-transparent px-3 pb-3 pt-8 opacity-100 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:opacity-0"
      aria-hidden={!title}
    >
      {title ? (
        <span className="block truncate font-display text-lg text-cream">{title}</span>
      ) : null}
      <span className="eyebrow block truncate text-cream/70">{category}</span>
    </span>
  );
}
