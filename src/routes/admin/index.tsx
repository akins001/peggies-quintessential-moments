import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  Loader2,
  LogOut,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import {
  fetchAdminGallery,
  fetchHeadshot,
  removePortfolioImage,
  uploadPortfolioImage,
  type AdminGalleryItem,
  type GalleryRow,
} from "@/lib/gallery-data";
import {
  fetchAdminHeroSlides,
  removeHeroImage,
  uploadHeroImage,
  type AdminHeroSlide,
} from "@/lib/hero-data";

export const Route = createFileRoute("/admin/")({
  ssr: false,

  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw redirect({ to: "/admin/login" });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login" });
    }

    return { user: data.user };
  },

  head: () => ({
    meta: [
      { title: "Studio Dashboard | Peggies Events" },
      {
        name: "description",
        content:
          "Manage the Peggies Events portfolio gallery, featured selections and founder portrait.",
      },
      {
        property: "og:title",
        content: "Studio Dashboard | Peggies Events",
      },
      {
        property: "og:description",
        content:
          "Manage the Peggies Events portfolio gallery and founder portrait.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),

  component: AdminDashboard,
});

/** Maximum number of published images that can be featured on the homepage. */
const FEATURED_LIMIT = 8;

const FEATURED_LIMIT_MESSAGE =
  "Featured limit reached. You can have a maximum of 8 featured images. Please remove one of the current featured images before adding another.";


function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const headshotRef = useRef<HTMLInputElement>(null);
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const heroReplaceRef = useRef<HTMLInputElement>(null);

  const [replaceTarget, setReplaceTarget] =
    useState<AdminGalleryItem | null>(null);

  const [heroBusyId, setHeroBusyId] = useState<string | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroReplaceTarget, setHeroReplaceTarget] =
    useState<AdminHeroSlide | null>(null);

  const gallery = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: fetchAdminGallery,
  });

  const headshot = useQuery({
    queryKey: ["headshot"],
    queryFn: fetchHeadshot,
  });

  const heroSlides = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: fetchAdminHeroSlides,
  });

  const heroItems = heroSlides.data ?? [];

  const items = gallery.data ?? [];

  const featuredCount = items.filter(
    (i) => i.featured && i.active
  ).length;

  const featuredLimitReached =
    featuredCount >= FEATURED_LIMIT;


  function refresh() {
    void queryClient.invalidateQueries({
      queryKey: ["admin-gallery"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["public-gallery"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["headshot"],
    });
  }

  function refreshHero() {
    void queryClient.invalidateQueries({
      queryKey: ["admin-hero-slides"],
    });

    // Public homepage slideshow query key — see src/lib/hero-data.ts consumer.
    void queryClient.invalidateQueries({
      queryKey: ["hero-slides"],
    });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();

    await supabase.auth.signOut();

    navigate({
      to: "/admin/login",
      replace: true,
    });
  }

  /**
   * Upload new gallery images.
   *
   * IMPORTANT:
   * title is explicitly set to an empty string.
   * This prevents the database default from using
   * the uploaded filename as the title/caption.
   */
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);

    let nextOrder = items.reduce(
      (max, i) => Math.max(max, i.sort_order),
      0
    );

    try {
      for (const file of Array.from(files)) {
        const path = await uploadPortfolioImage(file);

        nextOrder += 10;

        const { error } = await supabase
          .from("gallery_items")
          .insert({
            title: "",
            category: "Weddings",
            location: "Abuja",
            image_path: path,
            featured: false,
            active: true,
            sort_order: nextOrder,
          });

        if (error) {
          throw error;
        }
      }

      toast.success(
        `${files.length} image${files.length === 1 ? "" : "s"} uploaded.`
      );

      refresh();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);

      if (uploadRef.current) {
        uploadRef.current.value = "";
      }
    }
  }

  /**
   * Update gallery item.
   *
   * title is included here so captions can be:
   * - added
   * - changed
   * - completely cleared
   */
  async function patchItem(
    item: AdminGalleryItem,
    patch: Partial<
      Pick<
        GalleryRow,
        "title" | "category" | "featured" | "active" | "sort_order"
      >
    >
  ) {
    setBusyId(item.id);

    const { error } = await supabase
      .from("gallery_items")
      .update(patch)
      .eq("id", item.id);

    setBusyId(null);

    if (error) {
      if (
        error.message.includes(
          "FEATURED_LIMIT_REACHED"
        )
      ) {
        toast.error(FEATURED_LIMIT_MESSAGE);
        refresh();
        return;
      }

      toast.error("Could not save that change.");
      return;
    }

    refresh();
  }

  /**
   * Featured toggle.
   *
   * Unfeaturing is always permitted. Featuring is
   * verified against the live database count first,
   * and the database trigger is the final authority.
   */
  async function toggleFeatured(
    item: AdminGalleryItem
  ) {
    if (item.featured) {
      await patchItem(item, { featured: false });
      return;
    }

    setBusyId(item.id);

    const { count, error } = await supabase
      .from("gallery_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("featured", true)
      .eq("active", true);

    setBusyId(null);

    if (error) {
      toast.error("Could not save that change.");
      return;
    }

    if ((count ?? 0) >= FEATURED_LIMIT) {
      toast.error(FEATURED_LIMIT_MESSAGE);
      refresh();
      return;
    }

    await patchItem(item, { featured: true });
  }


  async function move(
    item: AdminGalleryItem,
    direction: -1 | 1
  ) {
    const index = items.findIndex(
      (i) => i.id === item.id
    );

    const swapWith = items[index + direction];

    if (!swapWith) return;

    setBusyId(item.id);

    const a = supabase
      .from("gallery_items")
      .update({
        sort_order: swapWith.sort_order,
      })
      .eq("id", item.id);

    const b = supabase
      .from("gallery_items")
      .update({
        sort_order: item.sort_order,
      })
      .eq("id", swapWith.id);

    const [r1, r2] = await Promise.all([a, b]);

    setBusyId(null);

    if (r1.error || r2.error) {
      toast.error("Could not reorder the gallery.");
      return;
    }

    refresh();
  }

  async function handleReplace(files: FileList | null) {
    const target = replaceTarget;

    if (!files || files.length === 0 || !target) return;

    setBusyId(target.id);

    try {
      const path = await uploadPortfolioImage(files[0]!);

      const { error } = await supabase
        .from("gallery_items")
        .update({
          image_path: path,
        })
        .eq("id", target.id);

      if (error) {
        throw error;
      }

      await removePortfolioImage(target.image_path);

      toast.success("Image replaced.");

      refresh();
    } catch {
      toast.error("Could not replace that image.");
    } finally {
      setBusyId(null);
      setReplaceTarget(null);

      if (replaceRef.current) {
        replaceRef.current.value = "";
      }
    }
  }

  async function handleDelete(item: AdminGalleryItem) {
    const displayName = item.title || "this image";

    if (
      !window.confirm(
        `Delete "${displayName}" from the gallery? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(item.id);

    const { error } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", item.id);

    if (!error) {
      await removePortfolioImage(item.image_path);
    }

    setBusyId(null);

    if (error) {
      toast.error("Could not delete that item.");
      return;
    }

    toast.success("Gallery item deleted.");

    refresh();
  }

  async function handleHeadshot(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const previous = headshot.data?.path ?? null;

      const path = await uploadPortfolioImage(
        files[0]!,
        "headshot"
      );

      const { error } = await supabase
        .from("site_assets")
        .upsert(
          {
            key: "founder_headshot",
            image_path: path,
          },
          {
            onConflict: "key",
          }
        );

      if (error) {
        throw error;
      }

      await removePortfolioImage(previous);

      toast.success("Portrait updated.");

      refresh();
    } catch {
      toast.error("Could not update the portrait.");
    } finally {
      setUploading(false);

      if (headshotRef.current) {
        headshotRef.current.value = "";
      }
    }
  }

  async function handleRemoveHeadshot() {
    const previous = headshot.data?.path ?? null;

    if (!previous) return;

    if (
      !window.confirm(
        "Remove the founder portrait and restore the placeholder?"
      )
    ) {
      return;
    }

    setUploading(true);

    const { error } = await supabase
      .from("site_assets")
      .upsert(
        {
          key: "founder_headshot",
          image_path: null,
        },
        {
          onConflict: "key",
        }
      );

    if (!error) {
      await removePortfolioImage(previous);
    }

    setUploading(false);

    if (error) {
      toast.error("Could not remove the portrait.");
      return;
    }

    toast.success("Portrait removed.");

    refresh();
  }

  /** Upload one or more hero background images. New slides start hidden. */
  async function handleHeroUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setHeroUploading(true);

    let nextOrder = heroItems.reduce(
      (max, s) => Math.max(max, s.sort_order),
      0
    );

    try {
      for (const file of Array.from(files)) {
        const path = await uploadHeroImage(file);

        nextOrder += 10;

        const { error } = await supabase.from("hero_slides").insert({
          image_path: path,
          active: true,
          sort_order: nextOrder,
        });

        if (error) {
          throw error;
        }
      }

      toast.success(
        `${files.length} hero image${files.length === 1 ? "" : "s"} uploaded.`
      );

      refreshHero();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setHeroUploading(false);

      if (heroUploadRef.current) {
        heroUploadRef.current.value = "";
      }
    }
  }

  async function toggleHeroActive(slide: AdminHeroSlide) {
    setHeroBusyId(slide.id);

    const { error } = await supabase
      .from("hero_slides")
      .update({ active: !slide.active })
      .eq("id", slide.id);

    setHeroBusyId(null);

    if (error) {
      toast.error("Could not save that change.");
      return;
    }

    refreshHero();
  }

  async function moveHero(slide: AdminHeroSlide, direction: -1 | 1) {
    const index = heroItems.findIndex((s) => s.id === slide.id);
    const swapWith = heroItems[index + direction];

    if (!swapWith) return;

    setHeroBusyId(slide.id);

    const a = supabase
      .from("hero_slides")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", slide.id);

    const b = supabase
      .from("hero_slides")
      .update({ sort_order: slide.sort_order })
      .eq("id", swapWith.id);

    const [r1, r2] = await Promise.all([a, b]);

    setHeroBusyId(null);

    if (r1.error || r2.error) {
      toast.error("Could not reorder the slideshow.");
      return;
    }

    refreshHero();
  }

  async function handleHeroReplace(files: FileList | null) {
    const target = heroReplaceTarget;

    if (!files || files.length === 0 || !target) return;

    setHeroBusyId(target.id);

    try {
      const path = await uploadHeroImage(files[0]!);

      const { error } = await supabase
        .from("hero_slides")
        .update({ image_path: path })
        .eq("id", target.id);

      if (error) {
        throw error;
      }

      await removeHeroImage(target.image_path);

      toast.success("Hero image replaced.");

      refreshHero();
    } catch {
      toast.error("Could not replace that image.");
    } finally {
      setHeroBusyId(null);
      setHeroReplaceTarget(null);

      if (heroReplaceRef.current) {
        heroReplaceRef.current.value = "";
      }
    }
  }

  async function handleHeroDelete(slide: AdminHeroSlide) {
    if (
      !window.confirm(
        "Delete this hero slideshow image? This cannot be undone."
      )
    ) {
      return;
    }

    setHeroBusyId(slide.id);

    const { error } = await supabase
      .from("hero_slides")
      .delete()
      .eq("id", slide.id);

    if (!error) {
      await removeHeroImage(slide.image_path);
    }

    setHeroBusyId(null);

    if (error) {
      toast.error("Could not delete that image.");
      return;
    }

    toast.success("Hero image deleted.");

    refreshHero();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div>
            <span className="block font-display text-2xl leading-none text-primary">
              Peggies Events
            </span>

            <span className="eyebrow mt-1 block text-muted-foreground">
              Studio Dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="border border-border px-4 py-2.5 text-[0.6875rem] tracking-[0.18em] uppercase text-primary transition-colors hover:bg-secondary"
            >
              View site
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[0.6875rem] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-primary"
            >
              <LogOut
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        {/* Founder portrait */}
        <section aria-labelledby="portrait-heading">
          <p className="eyebrow text-accent">
            About Section
          </p>

          <h2
            id="portrait-heading"
            className="mt-4 font-display text-3xl leading-tight"
          >
            Founder portrait
          </h2>

          <div className="mt-8 flex flex-wrap items-center gap-8 border border-border bg-secondary/50 p-6">
            <div className="h-40 w-32 shrink-0 overflow-hidden border border-accent/40 bg-cream">
              {headshot.data?.url ? (
                <img
                  src={headshot.data.url}
                  alt="Current founder portrait of Peggy Adugba"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-4xl text-accent/60">
                  PA
                </div>
              )}
            </div>

            <div className="min-w-[16rem] flex-1">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Upload a portrait of Peggy Adugba to replace the
                placeholder in the public About section. Portrait
                orientation (4:5) works best.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() =>
                    headshotRef.current?.click()
                  }
                  className="inline-flex items-center gap-2 bg-accent px-6 py-3 text-[0.6875rem] tracking-[0.18em] uppercase text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <ImagePlus
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  {headshot.data?.url
                    ? "Replace portrait"
                    : "Upload portrait"}
                </button>

                {headshot.data?.url && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={handleRemoveHeadshot}
                    className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[0.6875rem] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-primary disabled:opacity-60"
                  >
                    <Trash2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={headshotRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) =>
                  void handleHeadshot(e.target.files)
                }
              />
            </div>
          </div>
        </section>

        {/* Hero slideshow */}
        <section aria-labelledby="hero-heading" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-accent">Homepage Hero</p>

              <h2
                id="hero-heading"
                className="mt-4 font-display text-3xl leading-tight"
              >
                Hero background slideshow
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Images published here rotate behind the homepage hero text.
                With no published image, the site shows the default
                background. With one, it displays as a static image. With two
                or more, they crossfade automatically every few seconds. These
                are separate from the Portfolio gallery below.
              </p>
            </div>

            <div>
              <button
                type="button"
                disabled={heroUploading}
                onClick={() => heroUploadRef.current?.click()}
                className="inline-flex items-center gap-2 bg-accent px-6 py-3.5 text-[0.6875rem] tracking-[0.18em] uppercase text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {heroUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Images className="h-4 w-4" aria-hidden="true" />
                )}
                Upload hero images
              </button>

              <input
                ref={heroUploadRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => void handleHeroUpload(e.target.files)}
              />

              <input
                ref={heroReplaceRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleHeroReplace(e.target.files)}
              />
            </div>
          </div>

          {heroSlides.isLoading ? (
            <p className="mt-10 text-sm text-muted-foreground">
              Loading hero slideshow&hellip;
            </p>
          ) : heroItems.length === 0 ? (
            <p className="mt-10 border border-dashed border-border p-10 text-center text-sm leading-relaxed text-muted-foreground">
              No hero images yet. Upload one or more photos above — until
              then the site shows the default hero background.
            </p>
          ) : (
            <ul className="mt-10 space-y-4">
              {heroItems.map((slide, index) => (
                <li
                  key={slide.id}
                  className="grid gap-5 border border-border bg-card p-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
                >
                  <div className="aspect-video w-full overflow-hidden border border-border bg-secondary sm:aspect-[4/5] sm:w-28">
                    {slide.url ? (
                      <img
                        src={slide.url}
                        alt="Hero slideshow image"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="eyebrow text-muted-foreground">
                        Position {index + 1} of {heroItems.length}
                      </span>

                      <span
                        className={
                          slide.active
                            ? "border border-accent/50 px-2.5 py-1 text-[0.625rem] tracking-[0.18em] uppercase text-accent"
                            : "border border-border px-2.5 py-1 text-[0.625rem] tracking-[0.18em] uppercase text-muted-foreground"
                        }
                      >
                        {slide.active ? "Published" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2 sm:flex-col">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={index === 0 || heroBusyId === slide.id}
                        onClick={() => void moveHero(slide, -1)}
                        aria-label="Move hero image earlier"
                        className="border border-border p-2.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        disabled={
                          index === heroItems.length - 1 ||
                          heroBusyId === slide.id
                        }
                        onClick={() => void moveHero(slide, 1)}
                        aria-label="Move hero image later"
                        className="border border-border p-2.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={heroBusyId === slide.id}
                      onClick={() => void toggleHeroActive(slide)}
                      className="inline-flex w-full items-center gap-2 border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                    >
                      {slide.active ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {slide.active ? "Hide" : "Publish"}
                    </button>

                    <button
                      type="button"
                      disabled={heroBusyId === slide.id}
                      onClick={() => {
                        setHeroReplaceTarget(slide);
                        heroReplaceRef.current?.click();
                      }}
                      className="w-full border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                    >
                      Replace image
                    </button>

                    <button
                      type="button"
                      disabled={heroBusyId === slide.id}
                      onClick={() => void handleHeroDelete(slide)}
                      className="inline-flex w-full items-center gap-2 border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.16em] uppercase text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Gallery */}
        <section
          aria-labelledby="gallery-heading"
          className="mt-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-accent">
                Portfolio
              </p>

              <h2
                id="gallery-heading"
                className="mt-4 font-display text-3xl leading-tight"
              >
                Gallery images
              </h2>

              <p
                className="mt-3 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {items.length} total &middot; Featured:{" "}
                {featuredCount} / {FEATURED_LIMIT}
              </p>

              {featuredLimitReached && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Featured limit reached — unfeature an
                  image to add another.
                </p>
              )}

            </div>

            <div>
              <button
                type="button"
                disabled={uploading}
                onClick={() =>
                  uploadRef.current?.click()
                }
                className="inline-flex items-center gap-2 bg-accent px-6 py-3.5 text-[0.6875rem] tracking-[0.18em] uppercase text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <UploadCloud
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                Upload images
              </button>

              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) =>
                  void handleUpload(e.target.files)
                }
              />

              <input
                ref={replaceRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) =>
                  void handleReplace(e.target.files)
                }
              />
            </div>
          </div>

          {gallery.isLoading ? (
            <p className="mt-10 text-sm text-muted-foreground">
              Loading gallery&hellip;
            </p>
          ) : items.length === 0 ? (
            <p className="mt-10 border border-dashed border-border p-10 text-center text-sm leading-relaxed text-muted-foreground">
              No images yet. Upload your first celebration
              photographs — until then the site shows the
              curated placeholder set.
            </p>
          ) : (
            <ul className="mt-10 space-y-4">
              {items.map((item, index) => {
                const displayName =
                  item.title || "Gallery image";

                return (
                  <li
                    key={item.id}
                    className="grid gap-5 border border-border bg-card p-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
                  >
                    <div className="aspect-[4/5] w-full overflow-hidden border border-border bg-secondary sm:w-28">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={
                            item.title
                              ? `${item.title} — ${item.category}`
                              : "Peggies Events portfolio image"
                          }
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <label className="block">
                        <span className="sr-only">
                          Caption
                        </span>

                        <input
                          defaultValue={item.title ?? ""}
                          placeholder="Caption (optional)"
                          onBlur={(e) => {
                            const value =
                              e.target.value.trim();

                            /*
                             * This intentionally allows
                             * value to be an empty string.
                             *
                             * Example:
                             * "Wedding in Abuja"
                             * -> user deletes it
                             * -> ""
                             * -> saved to Supabase
                             */
                            if (
                              value !==
                              (item.title ?? "")
                            ) {
                              void patchItem(item, {
                                title: value,
                              });
                            }
                          }}
                          className="w-full border border-border bg-background px-3 py-2 font-display text-lg text-primary outline-none focus:border-accent"
                          aria-label={`Caption for ${displayName}`}
                        />
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-xs text-muted-foreground">
                          <span className="sr-only">
                            Category
                          </span>

                          <select
                            value={item.category}
                            onChange={(e) =>
                              void patchItem(item, {
                                category:
                                  e.target.value,
                              })
                            }
                            className="border border-border bg-background px-3 py-2 text-xs tracking-[0.12em] uppercase text-primary outline-none focus:border-accent"
                            aria-label={`Category for ${displayName}`}
                          >
                            {GALLERY_CATEGORIES.map(
                              (c) => (
                                <option
                                  key={c}
                                  value={c}
                                >
                                  {c}
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <span className="eyebrow text-muted-foreground">
                          Position {index + 1} of{" "}
                          {items.length}
                        </span>

                        <span
                          className={
                            item.active
                              ? "border border-accent/50 px-2.5 py-1 text-[0.625rem] tracking-[0.18em] uppercase text-accent"
                              : "border border-border px-2.5 py-1 text-[0.625rem] tracking-[0.18em] uppercase text-muted-foreground"
                          }
                        >
                          {item.active
                            ? "Published"
                            : "Hidden"}
                        </span>

                        {item.featured && (
                          <span className="border border-accent bg-accent/10 px-2.5 py-1 text-[0.625rem] tracking-[0.18em] uppercase text-accent">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-start gap-2 sm:flex-col">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={
                            index === 0 ||
                            busyId === item.id
                          }
                          onClick={() =>
                            void move(item, -1)
                          }
                          aria-label={`Move ${displayName} earlier`}
                          className="border border-border p-2.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                        >
                          <ArrowUp
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                              items.length - 1 ||
                            busyId === item.id
                          }
                          onClick={() =>
                            void move(item, 1)
                          }
                          aria-label={`Move ${displayName} later`}
                          className="border border-border p-2.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                        >
                          <ArrowDown
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      {(() => {
                        const blocked =
                          !item.featured &&
                          featuredLimitReached;

                        return (
                          <button
                            type="button"
                            disabled={
                              busyId === item.id ||
                              blocked
                            }
                            aria-disabled={
                              blocked || undefined
                            }
                            title={
                              blocked
                                ? FEATURED_LIMIT_MESSAGE
                                : undefined
                            }
                            onClick={() => {
                              if (blocked) {
                                toast.error(
                                  FEATURED_LIMIT_MESSAGE
                                );
                                return;
                              }
                              void toggleFeatured(item);
                            }}
                            className="inline-flex w-full items-center gap-2 border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Star
                              className={
                                item.featured
                                  ? "h-3.5 w-3.5 fill-accent text-accent"
                                  : "h-3.5 w-3.5"
                              }
                              aria-hidden="true"
                            />

                            {item.featured
                              ? "Unfeature"
                              : "Feature"}
                          </button>
                        );
                      })()}


                      <button
                        type="button"
                        disabled={
                          busyId === item.id
                        }
                        onClick={() =>
                          void patchItem(item, {
                            active: !item.active,
                          })
                        }
                        className="w-full border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                      >
                        {item.active
                          ? "Hide"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          busyId === item.id
                        }
                        onClick={() => {
                          setReplaceTarget(item);
                          replaceRef.current?.click();
                        }}
                        className="w-full border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.18em] uppercase text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                      >
                        Replace image
                      </button>

                      <button
                        type="button"
                        disabled={
                          busyId === item.id
                        }
                        onClick={() =>
                          void handleDelete(item)
                        }
                        className="inline-flex w-full items-center gap-2 border border-border px-3 py-2.5 text-[0.625rem] tracking-[0.16em] uppercase text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

