import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import portfolio7 from "@/assets/portfolio-7.jpg";

/**
 * Single source of truth for the portfolio gallery.
 *
 * The shape intentionally mirrors a future admin-managed gallery record
 * (id, title, category, location, image, featured, sortOrder). When an admin
 * gallery is added, replace `GALLERY_ITEMS` with data fetched from the
 * database — `getFeaturedItems()` and `getAllItems()` keep the UI unchanged.
 * The homepage only ever renders featured items; the /gallery route renders all.
 */
export type GalleryCategory =
  | "Weddings"
  | "Traditional"
  | "Corporate"
  | "Birthdays"
  | "Showers"
  | "Proposals"
  | "Dinners";

export type GalleryItem = {
  id: string;
  /** Optional caption. Null/empty when the admin left it blank. */
  title: string | null;
  category: GalleryCategory;
  location: string;
  /** Null until photography for this celebration is published. */
  image: string | null;
  featured: boolean;
  sortOrder: number;
};

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Weddings",
  "Traditional",
  "Corporate",
  "Birthdays",
  "Showers",
  "Proposals",
  "Dinners",
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "ivory-vows", title: "Ivory Vows", category: "Weddings", location: "Abuja", image: portfolio1, featured: true, sortOrder: 1 },
  { id: "espresso-gala", title: "The Espresso Gala", category: "Dinners", location: "Abuja", image: portfolio2, featured: true, sortOrder: 2 },
  { id: "champagne-shower", title: "Champagne Shower", category: "Showers", location: "Abuja", image: portfolio3, featured: true, sortOrder: 3 },
  { id: "golden-thrones", title: "Golden Thrones", category: "Traditional", location: "Abuja", image: portfolio4, featured: true, sortOrder: 4 },
  { id: "award-night", title: "Award Night", category: "Corporate", location: "Abuja", image: portfolio5, featured: true, sortOrder: 5 },
  { id: "candlelit-yes", title: "A Candlelit Yes", category: "Proposals", location: "Abuja", image: portfolio6, featured: true, sortOrder: 6 },
  { id: "gilded-forty", title: "The Gilded Forty", category: "Birthdays", location: "Abuja", image: portfolio7, featured: true, sortOrder: 7 },

  // Awaiting photography — these appear in the full gallery only.
  { id: "rose-quartz-wedding", title: "Rose Quartz Wedding", category: "Weddings", location: "Abuja", image: null, featured: false, sortOrder: 8 },
  { id: "cream-court", title: "Cream Court", category: "Weddings", location: "Abuja", image: null, featured: false, sortOrder: 9 },
  { id: "aso-oke-affair", title: "Aso Oke Affair", category: "Traditional", location: "Abuja", image: null, featured: false, sortOrder: 10 },
  { id: "palm-wine-ceremony", title: "Palm Wine Ceremony", category: "Traditional", location: "Abuja", image: null, featured: false, sortOrder: 11 },
  { id: "founders-dinner", title: "Founders' Dinner", category: "Corporate", location: "Abuja", image: null, featured: false, sortOrder: 12 },
  { id: "product-launch", title: "Launch Night", category: "Corporate", location: "Abuja", image: null, featured: false, sortOrder: 13 },
  { id: "annual-conference", title: "Annual Conference", category: "Corporate", location: "Abuja", image: null, featured: false, sortOrder: 14 },
  { id: "sweet-sixteen", title: "Sweet Sixteen", category: "Birthdays", location: "Abuja", image: null, featured: false, sortOrder: 15 },
  { id: "diamond-sixty", title: "Diamond Sixty", category: "Birthdays", location: "Abuja", image: null, featured: false, sortOrder: 16 },
  { id: "little-one-shower", title: "Little One", category: "Showers", location: "Abuja", image: null, featured: false, sortOrder: 17 },
  { id: "bride-to-be-brunch", title: "Bride-To-Be Brunch", category: "Showers", location: "Abuja", image: null, featured: false, sortOrder: 18 },
  { id: "rooftop-proposal", title: "Rooftop Proposal", category: "Proposals", location: "Abuja", image: null, featured: false, sortOrder: 19 },
  { id: "garden-engagement", title: "Garden Engagement", category: "Proposals", location: "Abuja", image: null, featured: false, sortOrder: 20 },
  { id: "harvest-festival", title: "Harvest Festival", category: "Dinners", location: "Abuja", image: null, featured: false, sortOrder: 21 },
  { id: "charity-gala", title: "Charity Gala", category: "Dinners", location: "Abuja", image: null, featured: false, sortOrder: 22 },
];

const bySort = (a: GalleryItem, b: GalleryItem) => a.sortOrder - b.sortOrder;

/** Compact, curated set rendered on the homepage (max 8). */
export function getFeaturedItems(limit = 8): GalleryItem[] {
  return GALLERY_ITEMS.filter((i) => i.featured)
    .sort(bySort)
    .slice(0, limit);
}

/** Everything, for the dedicated gallery route. */
export function getAllItems(): GalleryItem[] {
  return [...GALLERY_ITEMS].sort(bySort);
}

/** Accessible alt text; never shows a filename or generic visible title. */
export function galleryAlt(item: GalleryItem): string {
  if (!item.title || item.title.trim() === "") return "Peggies Events portfolio image";
  return `${item.title} — ${item.category} styled by Peggies Events in ${item.location}`;
}

/**
 * A small rotating set of aspect ratios for the portfolio-style masonry grids
 * (Featured Celebrations on the homepage, the full /gallery). Cycling through
 * a handful of ratios — rather than one uniform size or a simple two-way
 * alternation — gives the grid an organic, editorial rhythm instead of rows
 * of identically-sized boxes lined up in lockstep, while staying tidy since
 * every tile still fits one of a small, deliberate set of shapes.
 */
const PORTFOLIO_ASPECTS = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[6/7]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[5/6]",
] as const;

export function portfolioAspect(i: number): string {
  return PORTFOLIO_ASPECTS[i % PORTFOLIO_ASPECTS.length] ?? PORTFOLIO_ASPECTS[0];
}
