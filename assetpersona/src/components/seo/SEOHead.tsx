import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  /** Absolute or root-relative URL of the OG/Twitter card image. */
  image?: string;
  /**
   * Explicit image-URL override (preferred when the URL points at a dynamic
   * renderer like the og-image Edge Function). Wins over `image` when set so
   * share-card pages can pass `/functions/v1/og-image?shareId=…` directly.
   */
  imageUrl?: string;
  /** Override the OG type (default 'website'; blog posts pass 'article'). */
  type?: 'website' | 'article';
  /** Tags / keywords for article OG meta. */
  tags?: string[];
  publishedAt?: string;
  /** Alias retained for symmetry with the article OG vocabulary. */
  articlePublishedAt?: string;
  author?: string;
}

const SITE_NAME = 'Asset Persona';
const BASE_URL = 'https://www.assetpersona.com';
const DEFAULT_DESC =
  'Agentic Study Hall by Frank Lawrence, Jr. Practical AI literacy, vibe coding, digital marketing with AI, and hands-on education for creatives, businesses, and everyone.';
const DEFAULT_IMAGE = '/og-default.png';

function absolutize(url: string): string {
  if (!url) return `${BASE_URL}${DEFAULT_IMAGE}`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
}

export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  path = '/',
  image,
  imageUrl,
  type = 'website',
  tags,
  publishedAt,
  articlePublishedAt,
  author,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = `${BASE_URL}${path}`;
  // imageUrl takes precedence over image for dynamic renderers; both fall back
  // to the default OG asset so every page has a valid card.
  const ogImage = absolutize(imageUrl ?? image ?? DEFAULT_IMAGE);
  const articleTimestamp = articlePublishedAt ?? publishedAt;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* RSS auto-discovery — lets feed readers find /feed.xml from any page */}
      <link
        rel="alternate"
        type="application/rss+xml"
        href="/feed.xml"
        title="Asset Persona Blog"
      />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {articleTimestamp && <meta property="article:published_time" content={articleTimestamp} />}
      {author && <meta property="article:author" content={author} />}
      {tags?.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
