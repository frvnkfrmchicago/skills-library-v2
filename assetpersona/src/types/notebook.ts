/* ═══ NOTEBOOK — Types for Upgrade.Self content engine ═══
 * Covers: notebook sources, 12 output formats, mini-game data structures,
 * crossword grids, word scrambles, fill-blanks, speed sort challenges.
 */

import type { Icon } from '@phosphor-icons/react';
import {
  BookOpenText,
  Cards,
  Brain,
  ClipboardText,
  Lightbulb,
  PuzzlePiece,
  PencilLine,
  TextAa,
  Notepad,
  Timer,
  Terminal,
  ChatDots,
} from '@phosphor-icons/react';

// ── Output format enum ──
export type OutputFormat =
  | 'micro_lesson'
  | 'flashcards'
  | 'quiz'
  | 'briefing'
  | 'takeaways'
  | 'term_match'
  | 'crossword'
  | 'word_scramble'
  | 'fill_blanks'
  | 'speed_sort'
  | 'code_sandbox'
  | 'discussion';

export const ALL_OUTPUT_FORMATS: OutputFormat[] = [
  'micro_lesson', 'flashcards', 'quiz', 'briefing',
  'takeaways', 'term_match', 'crossword', 'word_scramble',
  'fill_blanks', 'speed_sort', 'code_sandbox', 'discussion',
];

export const OUTPUT_META: Record<OutputFormat, { label: string; Icon: Icon; category: 'study' | 'game' | 'practice' }> = {
  micro_lesson:  { label: 'Micro-Lesson',     Icon: BookOpenText,   category: 'study' },
  flashcards:    { label: 'Flashcard Deck',    Icon: Cards,          category: 'study' },
  quiz:          { label: 'Quiz Challenge',    Icon: Brain,          category: 'game' },
  briefing:      { label: 'Briefing Doc',      Icon: ClipboardText,  category: 'study' },
  takeaways:     { label: 'Key Takeaways',     Icon: Lightbulb,      category: 'study' },
  term_match:    { label: 'Term Match',        Icon: PuzzlePiece,    category: 'game' },
  crossword:     { label: 'Crossword',         Icon: PencilLine,     category: 'game' },
  word_scramble: { label: 'Word Scramble',     Icon: TextAa,         category: 'game' },
  fill_blanks:   { label: 'Fill the Blanks',   Icon: Notepad,        category: 'game' },
  speed_sort:    { label: 'Speed Sort',        Icon: Timer,          category: 'game' },
  code_sandbox:  { label: 'Code Sandbox',      Icon: Terminal,       category: 'practice' },
  discussion:    { label: 'Discussion',        Icon: ChatDots,       category: 'practice' },
};

// ── Source types ──
export type SourceType = 'url' | 'paste' | 'notes';

export interface NotebookSource {
  id: string;
  type: SourceType;
  title: string;
  content: string;
  url?: string;
  added_at: string;
}

// ── Mini-game data structures ──

export interface CrosswordClue {
  answer: string;
  clue: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  number: number;
}

export interface CrosswordGrid {
  width: number;
  height: number;
  clues: CrosswordClue[];
}

export interface ScrambleWord {
  original: string;
  scrambled: string;
  hint: string;
}

export interface FillBlankSentence {
  text: string;          // "The ___ architecture uses self-attention"
  blank: string;         // "Transformer"
  options?: string[];    // optional distractors
}

export interface SortItem {
  text: string;
  category: string;
}

export interface SortChallenge {
  categories: string[];
  items: SortItem[];
  time_limit_seconds: number;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
}

export interface DiscussionPrompt {
  id: string;
  question: string;
  context?: string;
}

// ── Micro-lesson anatomy ──
export interface MicroLessonData {
  hook: string;
  context: string;
  practice: string;
  reflect: string;
}

// ── Briefing anatomy ──
export interface BriefingData {
  tldr: string;
  key_points: string[];
  action_items: string[];
}

// ── Generated output container ──
export interface GeneratedOutput {
  format: OutputFormat;
  data: unknown;
  generated_at: string;
}

// ── Notebook (top-level entity) ──
export interface Notebook {
  id: string;
  title: string;
  sources: NotebookSource[];
  outputs: GeneratedOutput[];
  status: 'draft' | 'published';
  module_id?: string;
  created_at: string;
  updated_at: string;
}
