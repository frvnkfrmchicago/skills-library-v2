/* ═══ AI CLIENT — Real LLM integration for Upgrade.Self ═══
 * Calls MiniMax M3 (or any OpenAI-compatible provider) to generate
 * source-grounded study content across all 12 interactive formats.
 *
 * This replaces the fake regex-based contentEngine.
 */

import type {
  NotebookSource,
  GeneratedOutput,
  MicroLessonData,
  BriefingData,
  FlashcardItem,
  DiscussionPrompt,
  ScrambleWord,
  FillBlankSentence,
  SortChallenge,
  CrosswordGrid,
  CrosswordClue,
} from '../../types/notebook';
import type { QuizQuestion, MatchPair } from '../../types/learn';
import { supabase } from '../supabase';

// ── Inference runs server-side via the `upgrade-self-generate` edge function so
//    the provider key is never shipped to the browser (was VITE_LLM_API_KEY). ──

// ── System prompt for study content generation ──
const STUDY_SYSTEM_PROMPT = `You are a senior instructional designer creating interactive learning content. You receive source material and transform it into structured study formats.

RULES:
- Every output must be DIRECTLY grounded in the source material. Do not invent facts.
- Use plain language. No jargon unless the source uses it.
- Never use: elevate, leverage, unlock, embark, dive, harness, navigate, robust, seamless, holistic, synergy, paradigm.
- Quiz questions must test comprehension of the ACTUAL source content.
- Flashcard backs must be real explanations from the source, not vague summaries.
- Fill-blank sentences must be REAL sentences from or closely paraphrasing the source.
- Crossword answers must be real terms from the source material.

Return STRICT JSON. No markdown fences. No prose before or after. Must parse with JSON.parse().

OUTPUT SCHEMA:
{
  "micro_lesson": {
    "hook": "1 sentence, why this matters, < 100 chars",
    "context": "60-120 word explanation of the core concept from the source",
    "practice": "1 hands-on task based on the source material, < 60 words",
    "reflect": "1 reflection question, < 20 words"
  },
  "flashcards": [
    { "id": "fc-0", "front": "term or concept", "back": "explanation grounded in source" }
  ],
  "quiz": [
    {
      "id": "q-0",
      "question": "comprehension question about the source",
      "options": ["correct answer", "plausible wrong", "plausible wrong", "plausible wrong"],
      "correct_option_index": 0,
      "explanation": "why this is correct, citing source"
    }
  ],
  "briefing": {
    "tldr": "2-3 sentence summary of the source",
    "key_points": ["point 1", "point 2", "...up to 7"],
    "action_items": ["actionable step 1", "step 2", "step 3"]
  },
  "takeaways": ["insight 1", "insight 2", "...up to 7 key insights"],
  "term_match": [
    { "term": "key term", "definition": "definition from source" }
  ],
  "crossword": {
    "words": [
      { "word": "TERM", "clue": "clue grounded in source content" }
    ]
  },
  "word_scramble": [
    { "original": "TERM", "scrambled": "MRET", "hint": "hint from source context" }
  ],
  "fill_blanks": [
    {
      "text": "sentence with ___ removed",
      "blank": "the removed word",
      "options": ["correct", "wrong1", "wrong2", "wrong3"]
    }
  ],
  "speed_sort": {
    "categories": ["Category A", "Category B"],
    "items": [
      { "text": "item text", "category": "Category A" }
    ],
    "time_limit_seconds": 45
  },
  "code_sandbox": {
    "code": "// starter code relevant to the source",
    "expectedOutput": "expected output or null"
  },
  "discussion": [
    { "id": "disc-0", "question": "thought-provoking question about the source" }
  ]
}

Generate 8-12 flashcards, 5-8 quiz questions, 6-8 term matches, 5-8 word scrambles, 5-6 fill blanks, 8-10 speed sort items across 2-3 categories, and 4-5 discussion prompts. Make crossword words 4-12 chars long, use 8-10 words.`;

// ── Scramble helper (for fixing crossword layout) ──
function scrambleLetters(word: string): string {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join('');
  return result === word ? letters.reverse().join('') : result;
}

// ── Build crossword grid from word list ──
function buildCrosswordFromWords(
  words: { word: string; clue: string }[]
): CrosswordGrid {
  const clean = words
    .map((w) => ({
      word: w.word.toUpperCase().replace(/[^A-Z]/g, ''),
      clue: w.clue,
    }))
    .filter((w) => w.word.length >= 3 && w.word.length <= 15)
    .sort((a, b) => b.word.length - a.word.length)
    .slice(0, 10);

  if (clean.length === 0) {
    return { width: 0, height: 0, clues: [] };
  }

  const gridSize = 20;
  const grid: (string | null)[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  );
  const placed: CrosswordClue[] = [];
  let clueNum = 1;

  // Place first word horizontally in center
  const first = clean[0];
  const startRow = Math.floor(gridSize / 2);
  const startCol = Math.floor((gridSize - first.word.length) / 2);
  for (let i = 0; i < first.word.length; i++) {
    grid[startRow][startCol + i] = first.word[i];
  }
  placed.push({
    answer: first.word,
    clue: first.clue,
    direction: 'across',
    row: startRow,
    col: startCol,
    number: clueNum++,
  });

  // Try to place remaining words by finding intersections
  for (let w = 1; w < clean.length; w++) {
    const word = clean[w];
    let bestScore = -1;
    let bestPlace: { row: number; col: number; dir: 'across' | 'down' } | null = null;

    for (let ci = 0; ci < word.word.length; ci++) {
      const char = word.word[ci];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (grid[r][c] !== char) continue;

          // Try placing down (intersecting horizontal)
          const downRow = r - ci;
          if (downRow >= 0 && downRow + word.word.length <= gridSize) {
            let valid = true;
            let score = 0;
            for (let i = 0; i < word.word.length; i++) {
              const tr = downRow + i;
              const cell = grid[tr][c];
              if (cell === word.word[i]) { score++; continue; }
              if (cell !== null) { valid = false; break; }
              // Check adjacent cells
              if (c > 0 && grid[tr][c - 1] !== null && tr !== r) { valid = false; break; }
              if (c < gridSize - 1 && grid[tr][c + 1] !== null && tr !== r) { valid = false; break; }
            }
            // Check cells before and after
            if (downRow > 0 && grid[downRow - 1][c] !== null) valid = false;
            if (downRow + word.word.length < gridSize && grid[downRow + word.word.length][c] !== null) valid = false;

            if (valid && score > bestScore) {
              bestScore = score;
              bestPlace = { row: downRow, col: c, dir: 'down' };
            }
          }

          // Try placing across (intersecting vertical)
          const acrossCol = c - ci;
          if (acrossCol >= 0 && acrossCol + word.word.length <= gridSize) {
            let valid = true;
            let score = 0;
            for (let i = 0; i < word.word.length; i++) {
              const tc = acrossCol + i;
              const cell = grid[r][tc];
              if (cell === word.word[i]) { score++; continue; }
              if (cell !== null) { valid = false; break; }
              if (r > 0 && grid[r - 1][tc] !== null && tc !== c) { valid = false; break; }
              if (r < gridSize - 1 && grid[r + 1][tc] !== null && tc !== c) { valid = false; break; }
            }
            if (acrossCol > 0 && grid[r][acrossCol - 1] !== null) valid = false;
            if (acrossCol + word.word.length < gridSize && grid[r][acrossCol + word.word.length] !== null) valid = false;

            if (valid && score > bestScore) {
              bestScore = score;
              bestPlace = { row: r, col: acrossCol, dir: 'across' };
            }
          }
        }
      }
    }

    if (bestPlace) {
      for (let i = 0; i < word.word.length; i++) {
        if (bestPlace.dir === 'across') {
          grid[bestPlace.row][bestPlace.col + i] = word.word[i];
        } else {
          grid[bestPlace.row + i][bestPlace.col] = word.word[i];
        }
      }
      placed.push({
        answer: word.word,
        clue: word.clue,
        direction: bestPlace.dir,
        row: bestPlace.row,
        col: bestPlace.col,
        number: clueNum++,
      });
    }
  }

  // Compute actual bounds
  let minR = gridSize, maxR = 0, minC = gridSize, maxC = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] !== null) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  // Rebase clues to (0,0)
  const rebasedClues = placed.map((cl) => ({
    ...cl,
    row: cl.row - minR,
    col: cl.col - minC,
  }));

  return {
    width: maxC - minC + 1,
    height: maxR - minR + 1,
    clues: rebasedClues,
  };
}

// ── JSON repair helper ──
function repairJSON(raw: string): string {
  // Strip <think>...</think> reasoning blocks if present
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Try to extract JSON object
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];

  return cleaned;
}

// ── Main API call ──
export async function generateStudyContent(
  sources: NotebookSource[]
): Promise<GeneratedOutput[]> {
  const combinedText = sources.map((s) => s.content).join('\n\n');

  if (!combinedText.trim()) return [];

  const userPrompt = `SOURCE MATERIAL:\n---\n${combinedText.slice(0, 15000)}\n---\n\nGenerate ALL 12 study formats from this source material. Return JSON only.`;

  // Inference runs server-side so the provider key never reaches the browser.
  if (!supabase) {
    throw new Error('Study generation is unavailable (no backend client).');
  }

  const { data: fnData, error: fnError } = await (supabase as unknown as {
    functions: { invoke: (n: string, o: { body: unknown }) => Promise<{ data: unknown; error: { message?: string } | null }> };
  }).functions.invoke('upgrade-self-generate', {
    body: {
      messages: [
        { role: 'system', content: STUDY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    },
  });

  if (fnError) {
    console.error('[Upgrade.Self] generation function error:', fnError);
    throw new Error(`Study generation failed: ${fnError.message ?? String(fnError)}`);
  }

  const rawContent = (fnData as { content?: string } | null)?.content;
  if (!rawContent) {
    throw new Error('Study generation returned an empty response');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(repairJSON(rawContent));
  } catch (e) {
    console.error('[Upgrade.Self] JSON parse failure:', rawContent.slice(0, 500));
    throw new Error('Failed to parse LLM response as JSON');
  }

  const now = new Date().toISOString();
  const outputs: GeneratedOutput[] = [];

  // ── Map parsed data to GeneratedOutput[] ──

  // Micro-lesson
  if (parsed.micro_lesson) {
    outputs.push({ format: 'micro_lesson', data: parsed.micro_lesson as MicroLessonData, generated_at: now });
  }

  // Flashcards
  if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
    outputs.push({ format: 'flashcards', data: parsed.flashcards as FlashcardItem[], generated_at: now });
  }

  // Quiz
  if (parsed.quiz && Array.isArray(parsed.quiz)) {
    outputs.push({ format: 'quiz', data: parsed.quiz as QuizQuestion[], generated_at: now });
  }

  // Briefing
  if (parsed.briefing) {
    outputs.push({ format: 'briefing', data: parsed.briefing as BriefingData, generated_at: now });
  }

  // Takeaways
  if (parsed.takeaways && Array.isArray(parsed.takeaways)) {
    outputs.push({ format: 'takeaways', data: parsed.takeaways as string[], generated_at: now });
  }

  // Term Match
  if (parsed.term_match && Array.isArray(parsed.term_match)) {
    outputs.push({ format: 'term_match', data: parsed.term_match as MatchPair[], generated_at: now });
  }

  // Crossword — build grid from word list
  if (parsed.crossword) {
    const cw = parsed.crossword as { words?: { word: string; clue: string }[] };
    if (cw.words && Array.isArray(cw.words)) {
      const grid = buildCrosswordFromWords(cw.words);
      outputs.push({ format: 'crossword', data: grid, generated_at: now });
    }
  }

  // Word Scramble — ensure scrambled letters
  if (parsed.word_scramble && Array.isArray(parsed.word_scramble)) {
    const scrambles = (parsed.word_scramble as ScrambleWord[]).map((w) => ({
      ...w,
      original: w.original.toUpperCase(),
      scrambled: scrambleLetters(w.original.toUpperCase()),
    }));
    outputs.push({ format: 'word_scramble', data: scrambles, generated_at: now });
  }

  // Fill Blanks
  if (parsed.fill_blanks && Array.isArray(parsed.fill_blanks)) {
    outputs.push({ format: 'fill_blanks', data: parsed.fill_blanks as FillBlankSentence[], generated_at: now });
  }

  // Speed Sort
  if (parsed.speed_sort) {
    outputs.push({ format: 'speed_sort', data: parsed.speed_sort as SortChallenge, generated_at: now });
  }

  // Code Sandbox
  if (parsed.code_sandbox) {
    outputs.push({ format: 'code_sandbox', data: parsed.code_sandbox, generated_at: now });
  }

  // Discussion
  if (parsed.discussion && Array.isArray(parsed.discussion)) {
    outputs.push({ format: 'discussion', data: parsed.discussion as DiscussionPrompt[], generated_at: now });
  }

  return outputs;
}

// ── URL Content Fetcher ──
export async function fetchUrlContent(url: string): Promise<{ title: string; text: string }> {
  // Use CORS proxy in dev
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const res = await fetch(proxyUrl, {
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status}`);
  }

  const html = await res.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 120)
    : new URL(url).hostname;

  // Strip scripts, styles, nav, footer, header
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Take the meaningful portion (skip first 200 chars which are usually nav remnants)
  const text = cleaned.length > 500
    ? cleaned.slice(200, 15000)
    : cleaned.slice(0, 15000);

  return { title, text };
}
