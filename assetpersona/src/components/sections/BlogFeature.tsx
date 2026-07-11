import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useGSAP';
import blogVisual from '../../assets/blog-visual.webp';
import './BlogFeature.css';

export default function BlogFeature() {
  const sectionRef = useScrollReveal({ y: 40, duration: 0.9 });

  return (
    <section className="blog-feature section" ref={sectionRef}>
      <div className="container">
        <div className="blog-feature__inner liquid-glass">
          <div className="blog-feature__content">
          <h2 className="blog-feature__title">
              Invest in Your <span className="text-accent-blue">AI Understanding</span>
            </h2>
            <p className="blog-feature__desc">
              Practical guides, industry insights, and behind-the-scenes looks
              at how AI is reshaping creative work and business strategy.
            </p>
            <Link to="/blog" className="btn btn--secondary">
              Read the Blog
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="blog-feature__visual">
            <img
              src={blogVisual}
              alt="Translucent glass cards floating in digital space"
              className="blog-feature__img"
              loading="lazy"
              decoding="async"
              width={1280}
              height={800}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
