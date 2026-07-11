/* ═══ PRODUCT DETAIL PAGE ═══ */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { PRODUCTS } from '../data/products';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find((p) => p.id === slug);

  if (!product) {
    return (
      <section className="pd pd--empty">
        <div className="container container--narrow">
          <h1>Product not found</h1>
          <p>The product you are looking for does not exist or has been removed.</p>
          <Link to="/shop" className="btn btn--secondary">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </section>
    );
  }

  // Find related products (same category, exclude self)
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return (
    <>
      <SEOHead
        title={`${product.title} | Asset Persona Shop`}
        description={product.description}
        path={`/shop/${product.id}`}
      />

      <section className="pd">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="pd__breadcrumb">
            <Link to="/shop">Shop</Link>
            <span className="pd__breadcrumb-sep">/</span>
            <span className="pd__breadcrumb-current">{product.title}</span>
          </nav>

          {/* Main Layout: 60/40 asymmetric split */}
          <div className="pd__layout">
            {/* Left: Product Visual */}
            <div className="pd__visual">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="pd__image"
                  loading="eager"
                />
              ) : (
                <div className="pd__image-placeholder liquid-glass">
                  <ShoppingBag size={64} />
                </div>
              )}
            </div>

            {/* Right: Product Info + Sticky CTA */}
            <div className="pd__info">
              <span className="pd__category">{product.category}</span>
              <h1 className="pd__title">{product.title}</h1>

              <div className="pd__price-row">
                <span className="pd__price">${product.price}</span>
                {product.originalPrice && (
                  <span className="pd__original-price">${product.originalPrice}</span>
                )}
                {product.originalPrice && (
                  <span className="pd__savings">
                    Save ${product.originalPrice - product.price}
                  </span>
                )}
              </div>

              <p className="pd__description">{product.description}</p>

              <div className="pd__tags">
                {product.tags.map((tag) => (
                  <span key={tag} className="pd__tag">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>

              {/* Sticky CTA */}
              <div className="pd__cta-block">
                {product.purchaseUrl !== '#' ? (
                  <a
                    href={product.purchaseUrl}
                    className="btn btn--primary pd__buy-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get It Now: ${product.price} <ArrowRight size={16} />
                  </a>
                ) : (
                  <button
                    className="btn btn--primary pd__buy-btn"
                    onClick={() => {
                      const el = document.querySelector('.pd__buy-btn');
                      if (el) {
                        el.textContent = 'Coming Soon';
                        setTimeout(() => {
                          el.textContent = `Get It Now: $${product.price}`;
                        }, 2000);
                      }
                    }}
                  >
                    Get It Now: ${product.price} <ArrowRight size={16} />
                  </button>
                )}
                <p className="pd__guarantee">Instant digital delivery. No refunds on digital products.</p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="pd__related">
              <h2 className="pd__related-title">You might also like</h2>
              <div className="pd__related-grid">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    to={`/shop/${rp.id}`}
                    className="pd__related-card liquid-glass border-glow"
                  >
                    {rp.image && (
                      <img src={rp.image} alt={rp.title} className="pd__related-img" loading="lazy" />
                    )}
                    <div className="pd__related-body">
                      <span className="pd__related-cat">{rp.category}</span>
                      <h3 className="pd__related-name">{rp.title}</h3>
                      <span className="pd__related-price">${rp.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
