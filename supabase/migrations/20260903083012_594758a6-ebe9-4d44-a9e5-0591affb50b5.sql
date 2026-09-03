CREATE POLICY "Public can read hero slide images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'hero-slides');
CREATE POLICY "Admins can upload hero slide images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update hero slide images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hero slide images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'));