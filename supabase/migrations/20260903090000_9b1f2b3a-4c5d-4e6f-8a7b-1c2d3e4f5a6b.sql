-- Ensure the hero-slides storage bucket exists. Kept private (not publicly
-- listable); read access is already granted via the "Public can read hero
-- slide images" storage.objects policy, and the app reads images through
-- signed URLs, matching the existing "portfolio" bucket pattern.
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', false)
ON CONFLICT (id) DO NOTHING;
