/* ═══ START HERE — welcome content + activation milestones ═══
 *
 * The Start Here page is the first place a new member lands. Its job is to
 * make the platform easy to understand upfront: one short explainer, the
 * five-step loop laid out plainly, and a small checklist of first actions.
 *
 * The checklist follows the onboarding research that the rest of this build
 * is grounded in: a short list of real, completable steps drives activation
 * (the Zeigarnik effect — people are pulled to finish what they have started),
 * and showing progress that already has a little done makes people more likely
 * to keep going (the endowed-progress effect).
 *
 * Every milestone points at a REAL route inside /community and detects "done"
 * by reading the SAME localStorage keys the real features write. We never mark
 * a step done with a fake flag — the probe checks the actual data the feature
 * stores, so the checklist tells the truth whether the member is on Supabase
 * or on the localStorage demo fallback.
 *
 * This file is data only. The page (StartHere.tsx) renders it. The smaller
 * inline OnboardingChecklist in the Feed covers profile + event + first post;
 * this hub is the fuller welcome and shares its honest "read the real data"
 * approach rather than duplicating its state.
 */

import type { Icon } from '@phosphor-icons/react';
import {
  ChatCircle,
  Compass,
  BookOpen,
  TerminalWindow,
  EnvelopeSimple,
} from '@phosphor-icons/react';

/* ── The one-line explainer + the five-step loop ── */

export const STUDY_HALL_TAGLINE =
  'The Agentic Study Hall is a place to learn AI by doing: you read short ' +
  'lessons, talk them through with other members, build something real, show ' +
  'your work, and ship it.';

export interface LoopStep {
  id: string;
  /** One-word name a beginner reads in a second. */
  name: string;
  /** Plain sentence on what this step means for them. */
  blurb: string;
  icon: Icon;
}

export const STUDY_HALL_LOOP: LoopStep[] = [
  {
    id: 'learn',
    name: 'Learn',
    blurb: 'Short, plain lessons in the Classroom. No jargon, real examples.',
    icon: BookOpen,
  },
  {
    id: 'discuss',
    name: 'Discuss',
    blurb: 'Ask questions and trade notes in the Forum and chat.',
    icon: ChatCircle,
  },
  {
    id: 'build',
    name: 'Build',
    blurb: 'Turn a lesson or a link into your own course in Upgrade.Self.',
    icon: TerminalWindow,
  },
  {
    id: 'show',
    name: 'Show',
    blurb: 'Put your work in your portfolio so people can see what you made.',
    icon: Compass,
  },
  {
    id: 'ship',
    name: 'Ship',
    blurb: 'Publish it and share it with the community.',
    icon: EnvelopeSimple,
  },
];

/* ── Activation milestones ──
 *
 * Each milestone maps to a real /community route and a `done` probe that reads
 * the localStorage key the underlying feature actually writes. The probe takes
 * the localStorage object so callers can pass a guarded reference (and so it
 * stays trivial to test). It must never throw — a missing or corrupt value
 * just reads as "not done yet".
 */

export interface ActivationMilestone {
  id: string;
  /** Short imperative line: what to do. */
  label: string;
  /** One plain sentence on why it helps. */
  description: string;
  /** Button text. */
  ctaLabel: string;
  /** A real route under /community. */
  to: string;
  icon: Icon;
  /**
   * Reads the real feature data and returns whether this step is complete.
   * Receives a Storage (window.localStorage). Must be side-effect free and
   * must not throw.
   */
  done: (store: Storage) => boolean;
}

/** Safe JSON.parse for a localStorage value — returns fallback on any failure. */
function parseStored<T>(store: Storage, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const ACTIVATION_MILESTONES: ActivationMilestone[] = [
  {
    id: 'intro_post',
    label: 'Post a quick intro in the Forum',
    description:
      'One sentence on who you are and what you want to learn. This is how members meet you.',
    ctaLabel: 'Go to the Forum',
    to: '/community',
    icon: ChatCircle,
    // The Forum feed stores posts under this key in the localStorage fallback.
    // Any post present means the member has written at least one thing.
    done: (store) =>
      parseStored<unknown[]>(store, 'ap_community_posts', []).length > 0,
  },
  {
    id: 'archetype_quiz',
    label: 'Take your archetype quiz',
    description:
      'A short quiz that finds your learning style so the Study Hall fits how you work.',
    ctaLabel: 'Start the quiz',
    to: '/community/portfolio',
    icon: Compass,
    // archetypeStore writes the result array here once the quiz is finished.
    done: (store) =>
      parseStored<unknown[]>(store, 'ap_user_archetype', []).length > 0,
  },
  {
    id: 'first_lesson',
    label: 'Start your first lesson',
    description:
      'Open the Classroom and finish one short lesson. Ten minutes is plenty for your first.',
    ctaLabel: 'Open the Classroom',
    to: '/community/classroom',
    icon: BookOpen,
    // learnLocal records a completion row per finished lesson under this key.
    done: (store) =>
      parseStored<unknown[]>(store, 'ap_learn_completions', []).length > 0,
  },
  {
    id: 'build_course',
    label: 'Build a course from a source',
    description:
      'Paste a link or some notes into Upgrade.Self and it turns them into a course you can keep.',
    ctaLabel: 'Open Upgrade.Self',
    to: '/community/upgrade-self',
    icon: TerminalWindow,
    // UpgradeSelf saves each generated module set under this key.
    done: (store) =>
      parseStored<unknown[]>(store, 'ap_sandbox_modules', []).length > 0,
  },
  {
    id: 'say_hi',
    label: 'Say hi in chat',
    description:
      'Drop a hello in a chat channel so the people here know you have arrived.',
    ctaLabel: 'Open chat',
    // Real-time group chat lives at /community/chat (shared channels, not DMs).
    to: '/community/chat',
    icon: ChatCircle,
    // chatStore persists sent messages under this key in the local fallback.
    done: (store) =>
      parseStored<unknown[]>(store, 'ap_chat_messages', []).length > 0,
  },
];

/** A friendly question that invites the member to reply in the Forum. */
export const WELCOME_QUESTION =
  'What is the one thing you want to be able to do with AI a month from now?';
