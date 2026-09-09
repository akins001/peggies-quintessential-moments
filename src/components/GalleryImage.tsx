type Props = {
  /** JPEG (or signed URL) source — always present. */
  src: string;
  /** Optional smaller WebP of the same photo, used where supported. */
  webp?: string | null;
  alt: string;
  className?: string;
  /** First row of tiles can load eagerly; everything else waits. */
  eager?: boolean;
};

/**
 * Portfolio tile image. Serves a WebP where one exists (bundled photos) and
 * falls back to the JPEG everywhere else — including older iOS Safari, which
 * ignores the <source> entirely. Intrinsic dimensions are always declared so
 * the tile reserves its space and nothing shifts as photos arrive.
 */
export function GalleryImage({ src, webp, alt, className = "", eager = false }: Props) {
  return (
    <picture>
      {webp ? <source srcSet={webp} type="image/webp" /> : null}
      <img
        src={src}
        alt={alt}
        width={1024}
        height={1280}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "low"}
        className={className}
      />
    </picture>
  );
}
