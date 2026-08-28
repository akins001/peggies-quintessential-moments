CREATE POLICY "Public can read portfolio images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Admins can upload portfolio images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update portfolio images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete portfolio images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));