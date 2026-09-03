import { supabase } from "@/integrations/supabase/client";

/**
 * Storage + data layer for the homepage hero background slideshow.
 *
 * This is intentionally separate from the portfolio gallery (`gallery-data.ts`,
 * `PORTFOLIO_BUCKET`) — hero images live in their own bucket and table so the
 * two collections are never mixed.
 */

export const HERO_BUCKET = "hero-slides";
const SIGNED_URL_TTL = 60 * 60 * 6; // 6 hours

export type HeroSlideRow = {
  id: string;
  image_path: string;
  active: boolean;
  sort_order: number;
};

/** Admin row plus a resolved, displayable image URL. */
export type AdminHeroSlide = HeroSlideRow & { url: string | null };

/** Public-facing slide: always has a resolved URL. */
export type HeroSlide = { id: string; url: string };

async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(HERO_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((entry) => {
    if (entry.path && entry.signedUrl) map[entry.path] = entry.signedUrl;
  });
  return map;
}

/**
 * Published hero slides for the public homepage, in display order.
 * Returns an empty array when nothing has been published — the Hero
 * component falls back to the existing static background in that case.
 */
export async function fetchPublicHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image_path, active, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return [];
  const rows = data as HeroSlideRow[];
  const urls = await signPaths(rows.map((r) => r.image_path));
  return rows
    .map((row) => ({ id: row.id, url: urls[row.image_path] ?? null }))
    .filter((slide): slide is HeroSlide => Boolean(slide.url));
}

/** Every hero slide, published or not — admin dashboard only (RLS restricts this read). */
export async function fetchAdminHeroSlides(): Promise<AdminHeroSlide[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image_path, active, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as HeroSlideRow[];
  const urls = await signPaths(rows.map((r) => r.image_path));
  return rows.map((row) => ({
    ...row,
    url: urls[row.image_path] ?? null,
  }));
}

export async function uploadHeroImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(HERO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

export async function removeHeroImage(path: string | null): Promise<void> {
  if (!path) return;
  await supabase.storage.from(HERO_BUCKET).remove([path]);
}
