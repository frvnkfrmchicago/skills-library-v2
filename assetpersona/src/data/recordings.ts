/* ═══ TALK THROUGH TECH RECORDINGS DATA ═══ */

export interface Recording {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  duration: string; // e.g. "12:34"
  tags: string[];
  videoUrl?: string; // YouTube embed or direct link
  thumbnail?: string;
  featured?: boolean;
}

export const RECORDINGS: Recording[] = [
  {
    id: 'what-is-vibe-coding',
    title: 'What Is Vibe Coding?',
    description:
      'Vibe coding means building real apps and prototypes with AI as your co-pilot. This episode covers what it is, how it works, and why it matters if you have never written code.',
    date: '2026-03-15',
    duration: '18:42',
    tags: ['Vibe Coding', 'AI Development'],
    featured: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'ai-literacy-for-creatives',
    title: 'AI Literacy for Creatives',
    description:
      'Why creatives need to understand AI now, not later. How to evaluate tools, protect your work, and use AI to amplify your creative output.',
    date: '2026-03-10',
    duration: '22:15',
    tags: ['AI Literacy', 'Creatives'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'prompt-engineering-basics',
    title: 'Prompt Engineering: The Basics',
    description:
      'The fundamentals of talking to AI. How to structure prompts, iterate on outputs, and build prompt chains for complex tasks.',
    date: '2026-03-05',
    duration: '15:30',
    tags: ['Prompting', 'Education'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'building-in-public',
    title: 'Building in Public: Why I Show Everything',
    description:
      'The philosophy behind building in public. How sharing your process attracts clients, builds trust, and creates content at the same time.',
    date: '2026-02-28',
    duration: '14:08',
    tags: ['Build Public', 'Strategy'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'ai-tools-you-need-2026',
    title: 'The AI Tools You Actually Need in 2026',
    description:
      'Cutting through the noise. The tools that actually matter for productivity, content creation, coding, and business. I also cover the ones you can skip.',
    date: '2026-02-20',
    duration: '20:55',
    tags: ['AI Tools', 'Productivity'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];
