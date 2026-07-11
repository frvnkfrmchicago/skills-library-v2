/* ═══ DIGITAL PRODUCTS DATA ═══ */

export type ProductCategory = 'template' | 'workbook' | 'worksheet' | 'book' | 'bundle';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  tags: string[];
  image?: string;
  featured?: boolean;
  purchaseUrl: string; // Stripe payment link
  originalPrice?: number; // for bundles showing savings
}

export const PRODUCT_CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'bundle', label: 'Bundles' },
  { value: 'template', label: 'Templates' },
  { value: 'workbook', label: 'Workbooks' },
  { value: 'worksheet', label: 'Worksheets' },
  { value: 'book', label: 'Books' },
];

export const PRODUCTS: Product[] = [
  // ── Bundles (shown first) ──
  {
    id: 'complete-library',
    title: 'The Complete Library',
    description:
      'Every digital product in the shop. All 8 products bundled together at 35% off. Best value for anyone going all in on AI literacy.',
    price: 127,
    originalPrice: 194,
    category: 'bundle',
    tags: ['Bundle', 'Best Value', 'All Products'],
    featured: true,
    image: '/images/products/complete-library.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'builder-bundle',
    title: 'Builder Bundle',
    description:
      'The Starter Pack plus the AI Literacy Workbook and Website Builder Template Pack. Everything you need to learn AI and start building.',
    price: 67,
    originalPrice: 99,
    category: 'bundle',
    tags: ['Bundle', 'Popular', 'Learn + Build'],
    featured: true,
    image: '/images/products/builder-bundle.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'starter-pack',
    title: 'Starter Pack',
    description:
      'I Am Digital book, AI Tool Evaluation Worksheet, and Prompt Engineering Pack. The essentials to start your AI journey at 29% off.',
    price: 29,
    originalPrice: 41,
    category: 'bundle',
    tags: ['Bundle', 'Starter', 'Essentials'],
    image: '/images/products/starter-pack.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },

  // ── Individual Products ──
  {
    id: 'ai-website-template-pack',
    title: 'AI Website Builder Template Pack',
    description:
      'Step-by-step prompts and wireframe templates to build a professional website using AI tools. Includes prompt chains, layout guides, and a deployment checklist.',
    price: 29,
    category: 'template',
    tags: ['AI', 'Web Design', 'Prompting'],
    featured: true,
    image: '/images/products/ai-website-template-pack.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'ai-literacy-workbook',
    title: 'AI Literacy Workbook',
    description:
      'A hands-on workbook covering AI fundamentals, prompt engineering, tool evaluation, and integration strategy. Self-paced exercises with real-world scenarios.',
    price: 19,
    category: 'workbook',
    tags: ['AI Literacy', 'Education', 'Self-Paced'],
    image: '/images/products/ai-literacy-workbook.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'prompt-engineering-worksheet',
    title: 'Prompt Engineering Worksheet Pack',
    description:
      'Fill-in-the-blank prompt formulas for copywriting, code generation, image creation, and data analysis. Print or use digitally.',
    price: 17,
    category: 'worksheet',
    tags: ['Prompting', 'Productivity'],
    image: '/images/products/prompt-engineering-worksheet.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'vibe-coding-starter-kit',
    title: 'Vibe Coding Starter Kit',
    description:
      'Everything you need to start building apps with AI. Includes project templates, tool recommendations, deployment guides, and prompt workflows.',
    price: 29,
    category: 'template',
    tags: ['Vibe Coding', 'Development'],
    image: '/images/products/vibe-coding-starter-kit.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'ai-marketing-playbook',
    title: 'AI Marketing Playbook',
    description:
      'A comprehensive workbook for building an AI-powered marketing strategy. Covers content creation, social media automation, brand voice calibration, and analytics.',
    price: 29,
    category: 'workbook',
    tags: ['Marketing', 'AI Strategy'],
    image: '/images/products/ai-marketing-playbook.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'i-am-digital-book',
    title: 'I Am Digital',
    description:
      'The AI literacy guide for creatives, professionals, and entrepreneurs. Half manifesto, half manual. Teaches you to think with AI, not just use it.',
    price: 15,
    category: 'book',
    tags: ['AI Literacy', 'Book', 'Education'],
    image: '/images/products/i-am-digital-book.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'ai-tool-evaluation-worksheet',
    title: 'AI Tool Evaluation Worksheet',
    description:
      'A structured framework for evaluating any AI tool before you buy or subscribe. Score usability, cost, integration, and long-term value.',
    price: 9,
    category: 'worksheet',
    tags: ['AI Tools', 'Decision Making'],
    image: '/images/products/ai-tool-evaluation-worksheet.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
  {
    id: 'workshop-facilitation-kit',
    title: 'AI Workshop Facilitation Kit',
    description:
      'Everything to run your own AI literacy workshop: slide deck template, facilitator guide, participant worksheets, and follow-up email sequences.',
    price: 47,
    category: 'template',
    tags: ['Workshop', 'Education', 'Facilitation'],
    image: '/images/products/workshop-facilitation-kit.webp',
    purchaseUrl: '#', // Stripe payment link: replace with live URL
  },
];
