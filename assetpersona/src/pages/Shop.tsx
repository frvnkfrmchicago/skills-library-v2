import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { ShoppingBag } from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import { useStaggerReveal } from '../hooks/useGSAP';
import { PRODUCTS, PRODUCT_CATEGORIES, type ProductCategory } from '../data/products';
import './Shop.css';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const containerRef = useStaggerReveal('.shop__card', {
    stagger: 0.08,
    y: 30,
    duration: 0.6,
  });

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEOHead
        title="Shop: Digital Products | Asset Persona"
        description="AI templates, workbooks, worksheets, and books. Practical resources for AI literacy, prompt engineering, and vibe coding."
      />

      <section className="shop">
        <div className="container">
          <div className="shop__hero">
            <p className="text-uppercase text-accent-blue">
              <ShoppingBag size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Digital Products
            </p>
            <h1 className="shop__title">
              AI Resources That <span className="text-accent-salmon">Work</span>
            </h1>
            <p className="shop__subtitle">
              Templates, workbooks, worksheets, and books built from real experience. No fluff. Priced to be accessible.
            </p>
          </div>

          <div className="shop__controls">
            <div className="shop__categories">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`shop__category-btn ${activeCategory === cat.value ? 'shop__category-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="shop__search">
              <Search size={16} className="shop__search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="shop__search-input"
              />
            </div>
          </div>

          <div className="shop__grid" ref={containerRef}>
            {filtered.map((product) => (
              <div
                key={product.id}
                className={`shop__card liquid-glass border-glow cursor-glow ${product.featured ? 'shop__card--featured' : ''}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
                  e.currentTarget.style.setProperty('--glow-opacity', '1');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('--glow-opacity', '0');
                }}
              >
                {product.featured && <div className="shop__featured-badge">Featured</div>}

                {/* Product cover image */}
                {product.image && (
                  <div className="shop__card-img-wrap">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="shop__card-img"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="shop__card-body">
                  <div className="shop__card-header">
                    <span className="shop__card-category">{product.category}</span>
                    <span className="shop__card-price">
                      ${product.price}
                      {product.originalPrice && (
                        <span className="shop__card-original-price">${product.originalPrice}</span>
                      )}
                    </span>
                  </div>

                  <Link to={`/shop/${product.id}`} className="shop__card-title-link">
                    <h2 className="shop__card-title">{product.title}</h2>
                  </Link>
                  <p className="shop__card-desc">{product.description}</p>

                  <div className="shop__card-tags">
                    {product.tags.map((tag) => (
                      <span key={tag} className="shop__card-tag">{tag}</span>
                    ))}
                  </div>

                  {/* AP-LAUNCH-READY-2026-05 · Lane 5 · Shop CTA gate
                      Show the purchase CTA only for products with a live
                      external URL. Products with `purchaseUrl: '#'` are not
                      yet checkout-wired — we render a quiet "Details" link
                      to the product page instead of a dead Get-It button. */}
                  {product.purchaseUrl && product.purchaseUrl !== '#' ? (
                    <a
                      href={product.purchaseUrl}
                      className="btn btn--primary shop__card-cta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get It: ${product.price} <ArrowRight size={14} />
                    </a>
                  ) : (
                    <Link
                      to={`/shop/${product.id}`}
                      className="btn btn--ghost shop__card-cta"
                    >
                      View details <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="shop__empty">
              <p>No products match your search. Try a different term.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
