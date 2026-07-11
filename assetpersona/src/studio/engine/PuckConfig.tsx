/* ══════════════════════════════════════════
   PUCK CONFIG
   Component registry for the visual editor.
   Agents 3 will populate blocks here.
   ══════════════════════════════════════════ */

import type { Config } from '@measured/puck';

/**
 * Puck component registry.
 * Each key is a block type name. The value defines the fields
 * (editable properties) and the render function.
 *
 * Agent 3 will add all production blocks (HeroBlock, TextBlock, etc.)
 * For now, we register minimal placeholder blocks so the editor loads.
 */
export const puckConfig: Config = {
  categories: {
    layout: { title: 'Layout', components: ['SpacerBlock'] },
    content: { title: 'Content', components: ['TextBlock'] },
    media: { title: 'Media', components: ['ImageBlock'] },
    cta: { title: 'Call to Action', components: ['HeroBlock', 'CTABannerBlock'] },
    social: { title: 'Social Proof', components: ['TestimonialBlock', 'FeatureGridBlock'] },
  },
  components: {
    /* ── Placeholder blocks (Agent 3 replaces these) ── */
    HeroBlock: {
      fields: {
        headline: { type: 'text' },
        subheadline: { type: 'textarea' },
        ctaText: { type: 'text' },
        ctaLink: { type: 'text' },
        bgColor: { type: 'text' },
        textColor: { type: 'text' },
      },
      defaultProps: {
        headline: 'Your Headline',
        subheadline: 'Supporting text here.',
        ctaText: 'Get Started',
        ctaLink: '#',
        bgColor: '',
        textColor: '',
      },
      render: ({ headline, subheadline, ctaText }: Record<string, string>) => {
        return (
          <section style={{ padding: 'var(--space-4xl) var(--space-xl)', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'var(--text-display)', marginBottom: 'var(--space-md)' }}>{headline}</h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>{subheadline}</p>
            <button className="btn btn--primary">{ctaText}</button>
          </section>
        );
      },
    },
    TextBlock: {
      fields: {
        content: { type: 'textarea' },
        textColor: { type: 'text' },
        alignment: { type: 'select', options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ]},
        sizePreset: { type: 'select', options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
        ]},
      },
      defaultProps: {
        content: 'Start typing here...',
        textColor: '',
        alignment: 'left',
        sizePreset: 'md',
      },
      render: ({ content, alignment, sizePreset }: Record<string, string>) => {
        const sizeMap: Record<string, string> = {
          sm: 'var(--text-sm)',
          md: 'var(--text-base)',
          lg: 'var(--text-lg)',
          xl: 'var(--text-2xl)',
        };
        return (
          <div style={{ textAlign: alignment as 'left' | 'center' | 'right', fontSize: sizeMap[sizePreset] || 'var(--text-base)', padding: 'var(--space-lg)' }}>
            {content}
          </div>
        );
      },
    },
    ImageBlock: {
      fields: {
        src: { type: 'text' },
        alt: { type: 'text' },
        width: { type: 'text' },
        borderRadius: { type: 'text' },
        shadow: { type: 'select', options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ]},
      },
      defaultProps: {
        src: '',
        alt: 'Image',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        shadow: 'md',
      },
      render: ({ src, alt, width, borderRadius }: Record<string, string>) => {
        return src ? (
          <img src={src} alt={alt} style={{ width, borderRadius, display: 'block', maxWidth: '100%' }} />
        ) : (
          <div style={{
            width,
            height: '200px',
            background: 'var(--color-bg-elevated)',
            borderRadius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-tertiary)',
            border: '2px dashed var(--color-border)',
          }}>
            Drop an image here
          </div>
        );
      },
    },
    FeatureGridBlock: {
      fields: {
        title: { type: 'text' },
        columns: { type: 'select', options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ]},
        cardBgColor: { type: 'text' },
      },
      defaultProps: {
        title: 'Features',
        columns: '3',
        cardBgColor: '',
      },
      render: ({ title, columns }: Record<string, string>) => {
        const cols = parseInt(columns) || 3;
        return (
          <section style={{ padding: 'var(--space-3xl) var(--space-xl)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>{title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'var(--space-lg)' }}>
              {Array.from({ length: cols }).map((_, i) => (
                <div key={i} style={{ padding: 'var(--space-xl)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <h3>Feature {i + 1}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Description goes here.</p>
                </div>
              ))}
            </div>
          </section>
        );
      },
    },
    CTABannerBlock: {
      fields: {
        headline: { type: 'text' },
        ctaText: { type: 'text' },
        ctaLink: { type: 'text' },
        gradientStart: { type: 'text' },
        gradientEnd: { type: 'text' },
      },
      defaultProps: {
        headline: 'Ready to get started?',
        ctaText: 'Contact Us',
        ctaLink: '#contact',
        gradientStart: '#F59E0B',
        gradientEnd: '#D97706',
      },
      render: ({ headline, ctaText, gradientStart, gradientEnd }: Record<string, string>) => (
        <section style={{
          padding: 'var(--space-3xl)',
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          margin: 'var(--space-lg)',
        }}>
          <h2 style={{ color: '#fff', marginBottom: 'var(--space-lg)' }}>{headline}</h2>
          <button className="btn btn--primary" style={{ background: '#fff', color: gradientStart }}>{ctaText}</button>
        </section>
      ),
    },
    TestimonialBlock: {
      fields: {
        quote: { type: 'textarea' },
        authorName: { type: 'text' },
        authorTitle: { type: 'text' },
      },
      defaultProps: {
        quote: '"This changed how we work with AI."',
        authorName: 'Jane Smith',
        authorTitle: 'CEO, Company',
      },
      render: ({ quote, authorName, authorTitle }: Record<string, string>) => (
        <blockquote style={{
          padding: 'var(--space-2xl)',
          borderLeft: '4px solid var(--color-brand-secondary)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          margin: 'var(--space-lg)',
        }}>
          <p style={{ fontSize: 'var(--text-lg)', fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>{quote}</p>
          <cite style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {authorName} — {authorTitle}
          </cite>
        </blockquote>
      ),
    },
    SpacerBlock: {
      fields: {
        height: { type: 'select', options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
        ]},
        showDivider: { type: 'radio', options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]},
      },
      defaultProps: {
        height: 'md',
        showDivider: false,
      },
      render: ({ height: rawHeight, showDivider: rawDivider }: Record<string, unknown>) => {
        const h = rawHeight as string;
        const divider = rawDivider as boolean;
        const heightMap: Record<string, string> = {
          sm: 'var(--space-lg)',
          md: 'var(--space-2xl)',
          lg: 'var(--space-3xl)',
          xl: 'var(--space-4xl)',
        };
        return (
          <div style={{ height: heightMap[h] || 'var(--space-2xl)', display: 'flex', alignItems: 'center' }}>
            {divider && <hr style={{ width: '100%', border: 'none', borderTop: '1px solid var(--color-border)' }} />}
          </div>
        );
      },
    },
  },
};
