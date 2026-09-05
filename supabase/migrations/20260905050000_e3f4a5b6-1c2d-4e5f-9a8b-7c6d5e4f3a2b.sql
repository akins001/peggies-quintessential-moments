-- Full removal of the hero slideshow feature: the hero background is now a
-- fixed set of images bundled directly with the site build (see
-- src/components/HeroSlideshow.tsx), so this table/bucket are no longer used.

DROP POLICY IF EXISTS "Public can read hero slide images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero slide images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero slide images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero slide images" ON storage.objects;

DELETE FROM storage.objects WHERE bucket_id = 'hero-slides';
DELETE FROM storage.buckets WHERE id = 'hero-slides';

DROP TRIGGER IF EXISTS hero_slides_touch ON public.hero_slides;
DROP TABLE IF EXISTS public.hero_slides;
