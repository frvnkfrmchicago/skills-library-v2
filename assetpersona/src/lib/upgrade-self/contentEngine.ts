/* ═══ CONTENT ENGINE — Source → 12 output format transformer ═══
 * Client-side extraction and templating for demo mode.
 * Extracts key terms, sentences, and concepts from raw text,
 * then builds all 12 output formats.
 *
 * When Supabase Edge Functions are configured, this delegates
 * to the existing moduleGen AI pipeline for higher quality.
 */

import type {
  NotebookSource,
  GeneratedOutput,
  OutputFormat,
  MicroLessonData,
  BriefingData,
  FlashcardItem,
  DiscussionPrompt,
  ScrambleWord,
  FillBlankSentence,
  SortChallenge,
  SortItem,
} from '../../types/notebook';
import type { QuizQuestion, MatchPair } from '../../types/learn';
import { buildCrossword } from './crosswordBuilder';

// ── Text extraction helpers ──

/** Split source content into clean sentences */
function extractSentences(text: string): string[] {
  return text
    .replace(/^#{1,6}\s+/gm, '')      // drop markdown heading markers
    .replace(/\*\*|__|`/g, '')         // drop bold / inline-code markers
    .replace(/^[-*]\s+/gm, '')         // drop bullet markers
    .replace(/\n+/g, '. ')             // each line break ends a sentence
    .replace(/(\.\s*){2,}/g, '. ')     // collapse runs of periods
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 300);
}

/** Extract key terms (capitalized phrases, quoted terms, bold patterns) */
function extractKeyTerms(text: string): { term: string; context: string }[] {
  const terms: { term: string; context: string }[] = [];
  const seen = new Set<string>();

  // Match bold/strong patterns: **term** or __term__
  const boldPattern = /\*\*([^*]+)\*\*|__([^_]+)__/g;
  let match: RegExpExecArray | null;
  while ((match = boldPattern.exec(text)) !== null) {
    const term = (match[1] || match[2]).trim();
    const lower = term.toLowerCase();
    if (!seen.has(lower) && term.length > 2 && term.length < 50) {
      seen.add(lower);
      const sentenceIdx = text.indexOf(match[0]);
      const start = Math.max(0, sentenceIdx - 80);
      const end = Math.min(text.length, sentenceIdx + match[0].length + 80);
      terms.push({ term, context: text.slice(start, end).trim() });
    }
  }

  // Match capitalized multi-word phrases (e.g. "Machine Learning", "Context Window").
  // Constrain internal whitespace to spaces/tabs so a phrase never spans a line break.
  const capPattern = /(?:^|[ \t])([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/g;
  while ((match = capPattern.exec(text)) !== null) {
    const term = match[1].trim();
    const lower = term.toLowerCase();
    if (!seen.has(lower) && term.length > 3 && term.length < 40) {
      seen.add(lower);
      const sentenceIdx = text.indexOf(match[0]);
      const start = Math.max(0, sentenceIdx - 80);
      const end = Math.min(text.length, sentenceIdx + match[0].length + 80);
      terms.push({ term, context: text.slice(start, end).trim() });
    }
  }

  // Extract heading-like lines (## Heading or # Heading)
  const headingPattern = /^#{1,3}\s+(.+)$/gm;
  while ((match = headingPattern.exec(text)) !== null) {
    const term = match[1].trim();
    const lower = term.toLowerCase();
    if (!seen.has(lower) && term.length > 2 && term.length < 60) {
      seen.add(lower);
      terms.push({ term, context: term });
    }
  }

  return terms.slice(0, 20).map((t) => ({
    term: t.term.replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim(),
    context: t.context.replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim(),
  }));
}

/** Extract paragraphs */
function extractParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+\s+/, '').trim())
    .filter((p) => p.length > 30);
}

/** Shuffle array in-place */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Scramble a word's letters */
function scrambleLetters(word: string): string {
  const letters = word.split('');
  let scrambled = shuffle(letters).join('');
  // Make sure it's actually different
  let attempts = 0;
  while (scrambled === word && attempts < 10) {
    scrambled = shuffle(letters).join('');
    attempts++;
  }
  return scrambled;
}

// ── Output generators ──

function generateMicroLesson(text: string, sentences: string[]): MicroLessonData {
  const paras = extractParagraphs(text);
  return {
    hook: sentences[0] || 'Discover a key concept that changes how you work.',
    context: paras.slice(0, 3).join('\n\n') || sentences.slice(0, 5).join(' '),
    practice: `Based on what you just read, try this:\n\n1. Identify the core concept from the material above\n2. Write a one-sentence summary in your own words\n3. Think of one real-world application`,
    reflect: 'How does this concept connect to something you already know or do?',
  };
}

function generateFlashcards(terms: { term: string; context: string }[]): FlashcardItem[] {
  return terms.slice(0, 12).map((t, i) => ({
    id: `fc-${i}`,
    front: t.term,
    back: t.context,
  }));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateQuiz(sentences: string[], terms: { term: string; context: string }[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const termPool = terms.map((t) => t.term).filter((t) => t.length > 2);
  const used = new Set<string>();

  // Comprehension questions: blank out a real KEY TERM in a sentence that uses it,
  // with other key terms as distractors. Tests the actual concepts, not filler words.
  for (const sentence of sentences) {
    if (questions.length >= 8) break;

    const hit = terms.find((t) => {
      if (used.has(t.term.toLowerCase()) || t.term.length < 3) return false;
      return new RegExp(`\\b${escapeRegExp(t.term)}\\b`, 'i').test(sentence);
    });
    if (!hit) continue;

    const blanked = sentence.replace(new RegExp(`\\b${escapeRegExp(hit.term)}\\b`, 'i'), '_____').trim();
    // Require real surrounding context — skip sentences that are basically just the term.
    if (blanked.replace(/_+/g, '').replace(/[^a-zA-Z]/g, '').length < 12) continue;
    used.add(hit.term.toLowerCase());

    const distractors = shuffle(termPool.filter((t) => t.toLowerCase() !== hit.term.toLowerCase())).slice(0, 3);
    while (distractors.length < 3) distractors.push(`Option ${distractors.length + 1}`);

    const options = shuffle([hit.term, ...distractors]);
    questions.push({
      id: `q-${questions.length}`,
      question: `Which term best completes: "${blanked.trim()}"?`,
      options,
      correct_option_index: options.indexOf(hit.term),
      explanation: `The answer is "${hit.term}". ${sentence.trim()}`,
    });
  }

  return questions.slice(0, 8);
}

function generateBriefing(_text: string, sentences: string[]): BriefingData {
  return {
    tldr: sentences.slice(0, 2).join(' ') || 'Key insights from the source material.',
    key_points: sentences.slice(0, 7).map((s) => s.replace(/^\d+\.\s*/, '').slice(0, 150)),
    action_items: [
      'Review the key concepts identified above',
      'Apply one takeaway to a current project',
      'Share one insight with a colleague',
    ],
  };
}

function generateTakeaways(sentences: string[]): string[] {
  return sentences
    .filter((s) => s.length > 20 && s.length < 200)
    .slice(0, 7)
    .map((s) => s.replace(/^\d+\.\s*/, ''));
}

function generateTermMatch(terms: { term: string; context: string }[]): MatchPair[] {
  return terms.slice(0, 8).map((t) => ({
    term: t.term,
    definition: t.context.slice(0, 120),
  }));
}

function generateWordScramble(terms: { term: string; context: string }[]): ScrambleWord[] {
  return terms
    .filter((t) => t.term.length >= 4 && t.term.length <= 15)
    .slice(0, 8)
    .map((t) => ({
      original: t.term.toUpperCase(),
      scrambled: scrambleLetters(t.term.toUpperCase()),
      hint: t.context.slice(0, 80),
    }));
}

function generateFillBlanks(sentences: string[], terms: { term: string; context: string }[]): FillBlankSentence[] {
  const blanks: FillBlankSentence[] = [];

  for (const sentence of sentences) {
    for (const t of terms) {
      const idx = sentence.toLowerCase().indexOf(t.term.toLowerCase());
      if (idx >= 0) {
        const original = sentence.slice(idx, idx + t.term.length);
        const text = sentence.slice(0, idx) + '___' + sentence.slice(idx + t.term.length);
        const distractors = terms
          .filter((d) => d.term.toLowerCase() !== t.term.toLowerCase())
          .slice(0, 3)
          .map((d) => d.term);

        blanks.push({
          text,
          blank: original,
          options: shuffle([original, ...distractors]),
        });
        break;
      }
    }
    if (blanks.length >= 6) break;
  }

  return blanks;
}

function generateSpeedSort(terms: { term: string; context: string }[]): SortChallenge {
  // Create 2-3 categories from the terms
  const categories = ['Concept', 'Tool', 'Practice'];
  const items: SortItem[] = terms.slice(0, 9).map((t, i) => ({
    text: t.term,
    category: categories[i % categories.length],
  }));

  return {
    categories,
    items: shuffle(items),
    time_limit_seconds: 45,
  };
}

function generateDiscussion(sentences: string[]): DiscussionPrompt[] {
  const prompts: DiscussionPrompt[] = [];
  const templates = [
    'How would you explain this concept to someone with no background?',
    'What are the potential risks or downsides of this approach?',
    'How does this compare to what you currently use or know?',
    'If you could only remember one thing from this material, what would it be and why?',
    'What questions does this raise that weren\'t answered?',
  ];

  for (let i = 0; i < Math.min(5, templates.length); i++) {
    prompts.push({
      id: `disc-${i}`,
      question: templates[i],
      context: sentences[i] || undefined,
    });
  }

  return prompts;
}

function generateCodeSandbox(text: string): { code: string; expectedOutput?: string } {
  return {
    code: `// Practice: Write code based on the concepts you just learned\n// Source material summary:\n// ${text.slice(0, 200).replace(/\n/g, '\n// ')}\n\nconsole.log("Your solution here");`,
    expectedOutput: undefined,
  };
}

// ── Main engine ──

/**
 * Process notebook sources into all 12 output formats.
 * Client-side extraction for demo mode.
 */
export function processSourcesIntoOutputs(
  sources: NotebookSource[],
  formats?: OutputFormat[]
): GeneratedOutput[] {
  // Combine all source content
  const combinedText = sources.map((s) => s.content).join('\n\n');

  if (!combinedText.trim()) return [];

  const sentences = extractSentences(combinedText);
  const terms = extractKeyTerms(combinedText);
  const now = new Date().toISOString();

  const targetFormats = formats || [
    'micro_lesson', 'flashcards', 'quiz', 'briefing',
    'takeaways', 'term_match', 'crossword', 'word_scramble',
    'fill_blanks', 'speed_sort', 'code_sandbox', 'discussion',
  ];

  const outputs: GeneratedOutput[] = [];

  for (const format of targetFormats) {
    let data: unknown;

    switch (format) {
      case 'micro_lesson':
        data = generateMicroLesson(combinedText, sentences);
        break;
      case 'flashcards':
        data = generateFlashcards(terms);
        break;
      case 'quiz':
        data = generateQuiz(sentences, terms);
        break;
      case 'briefing':
        data = generateBriefing(combinedText, sentences);
        break;
      case 'takeaways':
        data = generateTakeaways(sentences);
        break;
      case 'term_match':
        data = generateTermMatch(terms);
        break;
      case 'crossword':
        data = buildCrossword(
          terms.slice(0, 10).map((t) => ({
            word: t.term.replace(/\s+/g, ''),
            clue: t.context.slice(0, 100),
          }))
        );
        break;
      case 'word_scramble':
        data = generateWordScramble(terms);
        break;
      case 'fill_blanks':
        data = generateFillBlanks(sentences, terms);
        break;
      case 'speed_sort':
        data = generateSpeedSort(terms);
        break;
      case 'code_sandbox':
        data = generateCodeSandbox(combinedText);
        break;
      case 'discussion':
        data = generateDiscussion(sentences);
        break;
    }

    outputs.push({ format, data, generated_at: now });
  }

  return outputs;
}
