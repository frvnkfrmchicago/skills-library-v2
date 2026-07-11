import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import RelatedPosts from '../components/blog/RelatedPosts';
import FaqSection from '../components/blog/FaqSection';
import { getPostBySlug, getAllPublishedPosts } from '../content/blog';
import BlogQuiz from '../components/blog/BlogQuiz';
import './BlogPost.css';

function slugifyTag(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Generates Article + FAQ structured data for a blog post.
 * This gives Google the signals for rich results in search.
 */
function generateStructuredData(post: NonNullable<ReturnType<typeof getPostBySlug>>) {
  const schemas: object[] = [];

  // Article schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'Asset Persona',
      url: 'https://assetpersona.com',
    },
    keywords: post.keywords?.join(', '),
  });

  // FAQ schema (if present)
  if (post.faqSchema && post.faqSchema.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqSchema.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="blog-post-404">
        <div className="container">
          <h1>Post not found</h1>
          <p>The article you are looking for does not exist or has been moved.</p>
          <Link to="/blog" className="btn btn--primary">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const schemas = generateStructuredData(post);
  const allPosts = getAllPublishedPosts();

  return (
    <>
      <SEOHead
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.coverImage}
        type="article"
        tags={post.tags}
        publishedAt={post.date}
        author={post.author}
      />

      {/* Structured data for Google rich results */}
      <Helmet>
        {schemas.map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <article className="blog-post">
        <div className="container">
          {/* Back link */}
          <Link to="/blog" className="blog-post__back">
            <ArrowLeft size={16} /> All articles
          </Link>

          {/* Header */}
          <header className="blog-post__header">
            <div className="blog-post__tags">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog/tag/${slugifyTag(tag)}`}
                  className="blog-post__tag"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <h1 className="blog-post__title">{post.title}</h1>
            <div className="blog-post__meta">
              <span className="blog-post__meta-item">
                <User size={14} /> {post.author}
              </span>
              <span className="blog-post__meta-item">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="blog-post__meta-item">
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="blog-post__cover">
              <img src={post.coverImage} alt="" loading="eager" />
            </div>
          )}

          {/* Content */}
          <div className="blog-post__content prose">
            <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
          </div>

          {/* Interactive active-recall quiz checkpoint */}
          <BlogQuiz postSlug={post.slug} postTitle={post.title} />

          {/* AP-COMMUNITY-2026-05 · FAQ + Q&A Agent 4 · render FAQ visibly when present */}
          {post.faqSchema && post.faqSchema.length > 0 && (
            <FaqSection items={post.faqSchema} />
          )}

          {/* Related posts (replaces array-index prev/next) */}
          <RelatedPosts current={post} pool={allPosts} limit={3} />
        </div>
      </article>
    </>
  );
}

