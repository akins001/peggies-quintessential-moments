import { supabase } from "@/integrations/supabase/client";

import { GALLERY_ITEMS, type GalleryCategory, type GalleryItem } from "./gallery";

export const PORTFOLIO_BUCKET = "portfolio";
const SIGNED_URL_TTL = 60 * 60 * 6; // 6 hours

export type GalleryRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  image_path: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
};

/** Admin row plus a resolved, displayable image URL. */
export type AdminGalleryItem = GalleryRow & { url: string | null };

async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((entry) => {
    if (entry.path && entry.signedUrl) map[entry.path] = entry.signedUrl;
  });
  return map;
}

function toGalleryItem(row: GalleryRow, urls: Record<string, string>): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category as GalleryCategory,
    location: row.location,
    image: row.image_path ? (urls[row.image_path] ?? null) : null,
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

/**
 * Active gallery items for the public site. Falls back to the curated static
 * set while the admin gallery is still empty, so the design never renders bare.
 */
export async function fetchPublicGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, title, category, location, image_path, featured, active, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return GALLERY_ITEMS;
  const rows = data as GalleryRow[];
  const urls = await signPaths(rows.map((r) => r.image_path ?? ""));
  return rows.map((row) => toGalleryItem(row, urls));
}

/** Every item, active or not — admin dashboard only (RLS restricts this read). */
export async function fetchAdminGallery(): Promise<AdminGalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, title, category, location, image_path, featured, active, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as GalleryRow[];
  const urls = await signPaths(rows.map((r) => r.image_path ?? ""));
  return rows.map((row) => ({
    ...row,
    url: row.image_path ? (urls[row.image_path] ?? null) : null,
  }));
}

export async function fetchHeadshot(): Promise<{ path: string | null; url: string | null }> {
  const { data } = await supabase
    .from("site_assets")
    .select("image_path")
    .eq("key", "founder_headshot")
    .maybeSingle();
  const path = (data?.image_path as string | null) ?? null;
  if (!path) return { path: null, url: null };
  const urls = await signPaths([path]);
  return { path, url: urls[path] ?? null };
}

export async function uploadPortfolioImage(file: File, prefix = "gallery"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

export async function removePortfolioImage(path: string | null): Promise<void> {
  if (!path) return;
  await supabase.storage.from(PORTFOLIO_BUCKET).remove([path]);
}
