-- ═══════════════════════════════════════════════
-- Wave 10: Storage bucket for digital products / free resources
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('digital-products', 'digital-products', true)
ON CONFLICT (id) DO NOTHING;

-- ── public read ──
DROP POLICY IF EXISTS "Public read digital products" ON storage.objects;
CREATE POLICY "Public read digital products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'digital-products');

-- ── admin insert ──
DROP POLICY IF EXISTS "Admin insert digital products" ON storage.objects;
CREATE POLICY "Admin insert digital products"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'digital-products'
    AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ── admin update ──
DROP POLICY IF EXISTS "Admin update digital products" ON storage.objects;
CREATE POLICY "Admin update digital products"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'digital-products'
    AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'digital-products'
    AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ── admin delete ──
DROP POLICY IF EXISTS "Admin delete digital products" ON storage.objects;
CREATE POLICY "Admin delete digital products"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'digital-products'
    AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );
