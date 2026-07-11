-- ═══ ADD TIER TO PROFILES + PRODUCTS TABLE ═══

-- ── Add tier column to profiles ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier text DEFAULT 'assetClass'
  CHECK (tier IN ('assetClass', 'cohort', 'insiders', 'privateLessons'));

-- ── PRODUCTS TABLE ──
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  full_description text,
  category text NOT NULL DEFAULT 'template',
  price decimal(10,2) NOT NULL DEFAULT 0,
  original_price decimal(10,2),
  is_free boolean DEFAULT false,
  image text,
  purchase_url text,
  download_url text,
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  -- SEO/AEO/EEAT
  seo_title text,
  seo_description text,
  keywords text[] DEFAULT '{}',
  faq_schema jsonb DEFAULT '[]',
  author_name text DEFAULT 'Frank Lawrence Jr.',
  author_credentials text DEFAULT 'AI Educator & Digital Product Builder',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read published products
CREATE POLICY "Public read published products" ON products
  FOR SELECT USING (status = 'published');

-- Admins can read all products including drafts
CREATE POLICY "Admin read all products" ON products
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Only admins can create products
CREATE POLICY "Admin create products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Only admins can update products
CREATE POLICY "Admin update products" ON products
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Only admins can delete products
CREATE POLICY "Admin delete products" ON products
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ── PRODUCT DOWNLOADS (email capture for free products) ──
CREATE TABLE IF NOT EXISTS product_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  user_id uuid REFERENCES profiles(id),
  newsletter_opted_in boolean DEFAULT false,
  downloaded_at timestamptz DEFAULT now(),
  UNIQUE(product_id, email)
);

ALTER TABLE product_downloads ENABLE ROW LEVEL SECURITY;

-- Users can see their own downloads
CREATE POLICY "Users read own downloads" ON product_downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all downloads
CREATE POLICY "Admin read all downloads" ON product_downloads
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Anyone authenticated can register a download
CREATE POLICY "Authenticated insert downloads" ON product_downloads
  FOR INSERT WITH CHECK (true);

-- ── INDEXES ──
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_downloads_product ON product_downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_product_downloads_email ON product_downloads(email);

-- ── TRIGGERS ──
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
