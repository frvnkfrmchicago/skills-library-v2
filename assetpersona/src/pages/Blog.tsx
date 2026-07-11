import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { useReveal } from '../hooks/useReveal';
import { getAllPublishedPosts } from '../content/blog';
import './Blog.css';

export default function BlogPage() {
  const { ref, visible } = useReveal(0.1);

  return (
    <>
      <SEOHead
        title="Asset Blog"
        description="AI literacy, vibe coding, and digital marketing articles by Frank Lawrence, Jr."
        path="/blog"
      />
      <main className="blog-page" ref={ref}>
        <div className={`container ${visible ? 'visible' : ''}`}>
          <header className="blog-page__header">
            <p className="text-uppercase text-accent-blue">Asset Blog</p>
            <h1 className="blog-page__title">Articles & Insights</h1>
            <p className="blog-page__subtitle">
              AI literacy, vibe coding strategy, and digital marketing from the field.
            </p>
          </header>

          <div className="blog-page__grid">
            {getAllPublishedPosts().map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="blog-card"
              >
                <div className="blog-card__image">
                  <div
                    className="blog-card__image-inner"
                    style={post.coverGradient ? { background: post.coverGradient } : undefined}
                  />
                </div>
                <div className="blog-card__body">
                  <div className="blog-card__tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="blog-card__tag">{tag}</span>
                    ))}
                  </div>
                  <h2 className="blog-card__title">{post.title}</h2>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <div className="blog-card__meta">
                    <span className="blog-card__date">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="blog-card__read-time">
                      <Clock size={14} /> {post.readTime}
                    </span>
                  </div>
                  <span className="blog-card__cta">
                    Read <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
