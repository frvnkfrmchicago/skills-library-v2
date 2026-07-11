import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useGSAP';
import { PRODUCTS } from '../../data/products';
import './ShopPreview.css';

const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);

export default function ShopPreview() {
  const containerRef = useStaggerReveal('.shop-preview__card', {
    stagger: 0.12,
    y: 40,
    duration: 0.7,
  });

  return (
    <section className="shop-preview section section--alt" ref={containerRef}>
      <div className="container">
        <div className="shop-preview__header">
          <h2 className="shop-preview__title">
            Templates, Workbooks &amp; <span className="text-accent-salmon">More</span>
          </h2>
          <p className="shop-preview__subtitle">
            Practical AI resources you can use today. Built from real experience.
          </p>
        </div>

        <div className="shop-preview__grid">
          {featured.map((product) => (
            <div key={product.id} className="shop-preview__card liquid-glass border-glow">
              <div className="shop-preview__card-gradient" style={{
                background: product.category === 'template'
                  ? 'var(--gradient-blue)'
                  : product.category === 'bundle'
                    ? 'var(--gradient-salmon)'
                    : 'var(--gradient-muted)'
              }} />
              <div className="shop-preview__card-body">
                <span className="shop-preview__category">{product.category}</span>
                <h3 className="shop-preview__card-title">{product.title}</h3>
                <p className="shop-preview__card-desc">{product.description}</p>
                <div className="shop-preview__tags">
                  {product.tags.map((tag) => (
                    <span key={tag} className="shop-preview__tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="shop-preview__footer">
          <Link to="/shop" className="btn btn--primary">
            Browse All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
