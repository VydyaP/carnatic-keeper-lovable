CREATE POLICY "Members can read notation files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'notations');
CREATE POLICY "Members can upload notation files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'notations');
CREATE POLICY "Members can update notation files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'notations') WITH CHECK (bucket_id = 'notations');
CREATE POLICY "Members can delete notation files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'notations');
