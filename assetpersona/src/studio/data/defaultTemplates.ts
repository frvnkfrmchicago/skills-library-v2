/* ══════════════════════════════════════════
   DEFAULT TEMPLATES
   Starter page layouts for new pages.
   ══════════════════════════════════════════ */

import type { PuckData } from './types';

/** Blank page - empty canvas */
export const TEMPLATE_BLANK: PuckData = {
  content: [],
  root: {},
};

/** Hero + CTA landing page template */
export const TEMPLATE_LANDING: PuckData = {
  content: [
    {
      type: 'HeroBlock',
      props: {
        headline: 'Your Headline Here',
        subheadline: 'Supporting text that explains your value.',
        ctaText: 'Get Started',
        ctaLink: '#',
        bgColor: 'var(--color-bg-surface)',
        textColor: 'var(--color-text-primary)',
      },
    },
    {
      type: 'SpacerBlock',
      props: {
        height: 'lg',
        showDivider: false,
      },
    },
    {
      type: 'FeatureGridBlock',
      props: {
        title: 'What We Offer',
        columns: 3,
        cardBgColor: 'var(--color-bg-surface)',
      },
    },
    {
      type: 'SpacerBlock',
      props: {
        height: 'md',
        showDivider: false,
      },
    },
    {
      type: 'CTABannerBlock',
      props: {
        headline: 'Ready to start?',
        ctaText: 'Contact Us',
        ctaLink: '#contact',
        gradientStart: '#F59E0B',
        gradientEnd: '#D97706',
      },
    },
  ],
  root: {},
};

/** Simple content page template */
export const TEMPLATE_CONTENT: PuckData = {
  content: [
    {
      type: 'TextBlock',
      props: {
        content: 'Page Title',
        textColor: 'var(--color-text-primary)',
        alignment: 'left',
        sizePreset: 'xl',
      },
    },
    {
      type: 'SpacerBlock',
      props: {
        height: 'sm',
        showDivider: true,
      },
    },
    {
      type: 'TextBlock',
      props: {
        content: 'Start writing your content here. This is a simple text block that supports basic formatting.',
        textColor: 'var(--color-text-secondary)',
        alignment: 'left',
        sizePreset: 'md',
      },
    },
    {
      type: 'ImageBlock',
      props: {
        src: '',
        alt: 'Add an image',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        shadow: 'md',
      },
    },
  ],
  root: {},
};

/** All available templates */
export const PAGE_TEMPLATES = [
  { id: 'blank', label: 'Blank Page', data: TEMPLATE_BLANK },
  { id: 'landing', label: 'Landing Page', data: TEMPLATE_LANDING },
  { id: 'content', label: 'Content Page', data: TEMPLATE_CONTENT },
] as const;
