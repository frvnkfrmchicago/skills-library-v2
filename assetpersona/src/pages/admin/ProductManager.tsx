/* ═══ PRODUCT MANAGER — Full CRUD for Supabase products ═══ */
import { useState, useEffect, type FormEvent } from 'react';
import { Star, LinkSimple, Plus, PencilSimple, Trash, FloppyDisk, X } from '@phosphor-icons/react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  full_description: string;
  category: string;
  price: number;
  original_price: number | null;
  is_free: boolean;
  image: string;
  purchase_url: string;
  download_url: string;
  tags: string[];
  featured: boolean;
  status: string;
  seo_title: string;
  seo_description: string;
  keywords: string[];
  faq_schema: { q: string; a: string }[];
  author_name: string;
  author_credentials: string;
}

const CATEGORIES = ['template', 'workbook', 'worksheet', 'book', 'course', 'tool'];
const STATUSES = ['draft', 'published', 'archived'];
const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  slug: '',
  title: '',
  description: '',
  full_description: '',
  category: 'template',
  price: 0,
  original_price: null,
  is_free: false,
  image: '',
  purchase_url: '',
  download_url: '',
  tags: [],
  featured: false,
  status: 'draft',
  seo_title: '',
  seo_description: '',
  keywords: [],
  faq_schema: [],
  author_name: 'Frank Lawrence Jr.',
  author_credentials: 'AI Educator & Digital Product Builder',
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('products' as any)
      .select('*')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setCreating(true);
  }

  function startEdit(p: Product) {
    setCreating(false);
    setEditing(p);
    setForm({ ...p });
  }

  function cancelEdit() {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY_PRODUCT);
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Upload failed.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('digital-products')
        .upload(fileName, file);

      if (error) {
        alert(`Upload error: ${error.message}`);
        return;
      }

      const { data } = supabase.storage
        .from('digital-products')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        setForm(prev => ({ ...prev, download_url: data.publicUrl }));
        alert('File uploaded successfully!');
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      slug: form.slug || autoSlug(form.title),
      price: form.is_free ? 0 : Number(form.price),
    };

    if (creating) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('products') as any).insert(payload);
      if (error) { alert(error.message); setSaving(false); return; }
    } else if (editing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('products') as any).update(payload).eq('id', editing.id);
      if (error) { alert(error.message); setSaving(false); return; }
    }

    setSaving(false);
    cancelEdit();
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product permanently?')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('products') as any).delete().eq('id', id);
    fetchProducts();
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  const showForm = creating || editing;

  if (loading) return <p style={{ color: 'var(--color-text-secondary)' }}>Loading products...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800 }}>
            Products ({products.length})
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Create and manage digital products. Toggle free/paid per product.
          </p>
        </div>
        {!showForm && (
          <button className="btn btn--primary btn--sm" onClick={startCreate}>
            <Plus size={16} /> New Product
          </button>
        )}
      </div>

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <form onSubmit={handleSave} className="liquid-glass" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontWeight: 700 }}>{creating ? 'New Product' : `Editing: ${editing?.title}`}</h2>
            <button type="button" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {/* Title */}
            <label style={labelStyle}>
              <span>Title *</span>
              <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>

            {/* Slug */}
            <label style={labelStyle}>
              <span>Slug</span>
              <input style={inputStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
            </label>

            {/* Category */}
            <label style={labelStyle}>
              <span>Category</span>
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            {/* Status */}
            <label style={labelStyle}>
              <span>Status</span>
              <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            {/* Free toggle + Price */}
            <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} />
              <span>Free product</span>
            </label>

            {!form.is_free && (
              <label style={labelStyle}>
                <span>Price ($)</span>
                <input type="number" step="0.01" style={inputStyle} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </label>
            )}

            {/* Image URL */}
            <label style={labelStyle}>
              <span>Image URL</span>
              <input style={inputStyle} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </label>

            {/* Purchase URL / Download URL */}
            {form.is_free ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={labelStyle}>
                  <span>Download URL</span>
                  <input style={inputStyle} value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })} placeholder="Link to file" />
                </label>
                <label style={{ ...labelStyle, border: '1px dashed var(--color-border)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: 'var(--text-xs)' }}>{uploading ? 'Uploading to Supabase Storage...' : 'Upload product file directly'}</span>
                  <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                  <span className="btn btn--secondary btn--sm" style={{ pointerEvents: 'none', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>Choose File</span>
                </label>
              </div>
            ) : (
              <label style={labelStyle}>
                <span>Stripe Payment Link</span>
                <input style={inputStyle} value={form.purchase_url} onChange={(e) => setForm({ ...form, purchase_url: e.target.value })} placeholder="https://buy.stripe.com/..." />
              </label>
            )}
          </div>

          {/* Description */}
          <label style={{ ...labelStyle, marginTop: 'var(--space-md)' }}>
            <span>Description</span>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>

          {/* Full Description */}
          <label style={{ ...labelStyle, marginTop: 'var(--space-md)' }}>
            <span>Full Description (Markdown)</span>
            <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} />
          </label>

          {/* Tags */}
          <div style={{ ...labelStyle, marginTop: 'var(--space-md)' }}>
            <span>Tags</span>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {form.tags.map((t) => (
                <span key={t} style={{ padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t}
                  <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>×</button>
                </span>
              ))}
              <input
                style={{ ...inputStyle, flex: 1, minWidth: '120px' }}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag + Enter"
              />
            </div>
          </div>

          {/* ── SEO / AEO / EEAT Panel ── */}
          <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>SEO / AEO / EEAT</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <label style={labelStyle}>
                <span>SEO Title ({form.seo_title?.length ?? 0}/60)</span>
                <input style={inputStyle} value={form.seo_title} maxLength={60} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
              </label>

              <label style={labelStyle}>
                <span>Author (EEAT)</span>
                <input style={inputStyle} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
              </label>
            </div>

            <label style={{ ...labelStyle, marginTop: 'var(--space-md)' }}>
              <span>SEO Description ({form.seo_description?.length ?? 0}/160)</span>
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.seo_description} maxLength={160} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
            </label>

            <label style={{ ...labelStyle, marginTop: 'var(--space-md)' }}>
              <span>Author Credentials</span>
              <input style={inputStyle} value={form.author_credentials} onChange={(e) => setForm({ ...form, author_credentials: e.target.value })} />
            </label>
          </div>

          {/* Featured */}
          <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span>Featured product</span>
          </label>

          <button type="submit" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)', width: '100%' }} disabled={saving}>
            <FloppyDisk size={16} /> {saving ? 'Saving...' : creating ? 'Create Product' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* ── Product List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {products.length === 0 && !showForm && (
          <div className="liquid-glass" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>No products yet.</p>
            <button className="btn btn--primary btn--sm" onClick={startCreate}>
              <Plus size={16} /> Create Your First Product
            </button>
          </div>
        )}

        {products.map((p) => (
          <div key={p.id} className="liquid-glass" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{p.title}</h3>
                  {p.featured && <Star size={14} weight="fill" style={{ color: 'var(--color-warning)' }} />}
                  <span style={{
                    padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    background: p.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)',
                    color: p.status === 'published' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                  }}>
                    {p.status}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  {p.description?.slice(0, 100)}{p.description?.length > 100 ? '...' : ''}
                </p>
              </div>

              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  {p.is_free ? 'Free' : `$${p.price}`}
                </p>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                  {p.category}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button className="btn btn--ghost btn--sm" onClick={() => startEdit(p)} title="Edit">
                  <PencilSimple size={16} />
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(p.id)} title="Delete" style={{ color: 'var(--color-error)' }}>
                  <Trash size={16} />
                </button>
                {!p.is_free && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: p.purchase_url ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>
                    <LinkSimple size={14} />
                    {p.purchase_url ? 'Stripe ✓' : 'No link'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--color-bg-deep)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};
