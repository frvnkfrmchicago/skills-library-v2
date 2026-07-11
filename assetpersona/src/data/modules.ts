/* ═══ WEEKLY LEARNING MODULES DATA ═══ */

export type ModuleTier = 'free' | 'pro';
export type ModuleTrack = 'ai-literacy' | 'prompting' | 'vibe-coding' | 'ai-marketing' | 'ai-integration';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  type: 'video' | 'reading' | 'exercise' | 'quiz';
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  track: ModuleTrack;
  tier: ModuleTier;
  releaseDate: string; // ISO date
  lessons: Lesson[];
  tags: string[];
}

export const TRACK_LABELS: Record<ModuleTrack, string> = {
  'ai-literacy': 'AI Literacy',
  'prompting': 'Prompt Engineering',
  'vibe-coding': 'Vibe Coding',
  'ai-marketing': 'AI Marketing',
  'ai-integration': 'AI Integration',
};

export const MODULES: LearningModule[] = [
  {
    id: 'what-ai-actually-is',
    title: 'What AI Actually Is',
    description:
      'Strip away the buzzwords. This module covers what AI does, how it works at a high level, and why it matters for your career. No code required.',
    track: 'ai-literacy',
    tier: 'free',
    releaseDate: '2026-03-17',
    tags: ['Foundations', 'Beginner'],
    lessons: [
      {
        id: 'wai-1',
        title: 'The Real Definition of AI',
        description: 'What AI means in practice, not in science fiction.',
        durationMinutes: 8,
        type: 'reading',
      },
      {
        id: 'wai-2',
        title: 'How AI Models Learn',
        description: 'Training, data, and patterns explained in plain language.',
        durationMinutes: 12,
        type: 'video',
      },
      {
        id: 'wai-3',
        title: 'AI in Your Daily Life',
        description: 'Identify the AI tools you already use without thinking about it.',
        durationMinutes: 10,
        type: 'exercise',
      },
      {
        id: 'wai-4',
        title: 'Knowledge Check',
        description: 'Test your understanding of AI fundamentals.',
        durationMinutes: 5,
        type: 'quiz',
      },
    ],
  },
  {
    id: 'your-first-prompt',
    title: 'Your First Real Prompt',
    description:
      'Most people type one sentence and expect magic. This module teaches you the framework behind prompts that actually get useful results. You will write ten prompts by the end.',
    track: 'prompting',
    tier: 'free',
    releaseDate: '2026-03-24',
    tags: ['Prompting', 'Beginner'],
    lessons: [
      {
        id: 'yfp-1',
        title: 'Why Most Prompts Fail',
        description: 'The three mistakes everyone makes and how to fix them.',
        durationMinutes: 7,
        type: 'reading',
      },
      {
        id: 'yfp-2',
        title: 'The Prompt Framework',
        description: 'Role, context, task, format. Four parts that change everything.',
        durationMinutes: 15,
        type: 'video',
      },
      {
        id: 'yfp-3',
        title: 'Write Ten Prompts',
        description: 'Hands-on exercise. Write prompts for writing, analysis, and image generation.',
        durationMinutes: 20,
        type: 'exercise',
      },
      {
        id: 'yfp-4',
        title: 'Prompt Quality Check',
        description: 'Grade your own prompts using the evaluation rubric.',
        durationMinutes: 5,
        type: 'quiz',
      },
    ],
  },
  {
    id: 'build-your-first-app-with-ai',
    title: 'Build Your First App With AI',
    description:
      'You do not need a CS degree. This module walks you through building a real, working web app using AI as your co-pilot. You will have something live on the internet by the end.',
    track: 'vibe-coding',
    tier: 'pro',
    releaseDate: '2026-03-31',
    tags: ['Vibe Coding', 'Hands-On'],
    lessons: [
      {
        id: 'bfa-1',
        title: 'Setting Up Your Tools',
        description: 'Install the three tools you need: a code editor, an AI assistant, and a deploy platform.',
        durationMinutes: 10,
        type: 'video',
      },
      {
        id: 'bfa-2',
        title: 'Describing What You Want',
        description: 'How to communicate your app idea to AI in a way it can build from.',
        durationMinutes: 12,
        type: 'reading',
      },
      {
        id: 'bfa-3',
        title: 'Build Session: Landing Page',
        description: 'Follow along and build a landing page with AI. Real-time walkthrough.',
        durationMinutes: 25,
        type: 'video',
      },
      {
        id: 'bfa-4',
        title: 'Deploy It Live',
        description: 'Push your app to the internet. Share the link with anyone.',
        durationMinutes: 10,
        type: 'exercise',
      },
    ],
  },
];

/**
 * Get modules that have been released (releaseDate <= today).
 * Future modules show as "Coming Soon."
 */
export function getReleasedModules(modules: LearningModule[] = MODULES): LearningModule[] {
  const today = new Date().toISOString().split('T')[0];
  return modules.filter((m) => m.releaseDate <= today);
}

/**
 * Get upcoming modules that have not been released yet.
 */
export function getUpcomingModules(modules: LearningModule[] = MODULES): LearningModule[] {
  const today = new Date().toISOString().split('T')[0];
  return modules.filter((m) => m.releaseDate > today);
}
