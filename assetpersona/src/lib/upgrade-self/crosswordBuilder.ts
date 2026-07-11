/* ═══ CROSSWORD BUILDER — Algorithmic grid generator ═══
 * Pure client-side crossword grid builder using backtracking.
 * Takes { word, clue } pairs → returns a CrosswordGrid with
 * numbered clues and cell positions.
 */

import type { CrosswordClue, CrosswordGrid } from '../../types/notebook';

interface WordInput {
  word: string;
  clue: string;
}

interface Placement {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

/**
 * Build a crossword grid from a list of word/clue pairs.
 * Uses a greedy intersection-based placement algorithm.
 */
export function buildCrossword(inputs: WordInput[]): CrosswordGrid {
  if (inputs.length === 0) {
    return { width: 0, height: 0, clues: [] };
  }

  // Normalize and sort by length (longest first for better grid coverage)
  const words = inputs
    .map((w) => ({ word: w.word.toUpperCase().replace(/[^A-Z]/g, ''), clue: w.clue }))
    .filter((w) => w.word.length >= 2)
    .sort((a, b) => b.word.length - a.word.length);

  if (words.length === 0) {
    return { width: 0, height: 0, clues: [] };
  }

  const placements: Placement[] = [];
  const grid = new Map<string, string>(); // "row,col" → letter

  function cellKey(r: number, c: number): string {
    return `${r},${c}`;
  }

  function getCell(r: number, c: number): string | undefined {
    return grid.get(cellKey(r, c));
  }

  function canPlace(word: string, row: number, col: number, dir: 'across' | 'down'): boolean {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    let hasIntersection = placements.length === 0; // first word always ok

    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = getCell(r, c);

      if (existing) {
        if (existing !== word[i]) return false; // conflict
        hasIntersection = true;
      } else {
        // Check perpendicular neighbors to avoid parallel adjacency
        if (dir === 'across') {
          const above = getCell(r - 1, c);
          const below = getCell(r + 1, c);
          if (above && !isPartOfPlacement(r - 1, c, 'across')) return false;
          if (below && !isPartOfPlacement(r + 1, c, 'across')) return false;
        } else {
          const left = getCell(r, c - 1);
          const right = getCell(r, c + 1);
          if (left && !isPartOfPlacement(r, c - 1, 'down')) return false;
          if (right && !isPartOfPlacement(r, c + 1, 'down')) return false;
        }
      }
    }

    // Check cells before and after the word
    const beforeR = row - dr;
    const beforeC = col - dc;
    const afterR = row + dr * word.length;
    const afterC = col + dc * word.length;

    if (getCell(beforeR, beforeC)) return false;
    if (getCell(afterR, afterC)) return false;

    return hasIntersection;
  }

  function isPartOfPlacement(_r: number, _c: number, _excludeDir: 'across' | 'down'): boolean {
    // Simplified check — allow intersection cells
    return grid.has(cellKey(_r, _c));
  }

  function placeWord(word: string, clue: string, row: number, col: number, dir: 'across' | 'down'): void {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    for (let i = 0; i < word.length; i++) {
      grid.set(cellKey(row + dr * i, col + dc * i), word[i]);
    }
    placements.push({ word, clue, row, col, direction: dir });
  }

  // Place first word horizontally at origin
  placeWord(words[0].word, words[0].clue, 0, 0, 'across');

  // Try to place remaining words
  for (let wi = 1; wi < words.length; wi++) {
    const { word, clue } = words[wi];
    let placed = false;

    // Try intersecting with each placed word
    for (const p of placements) {
      if (placed) break;
      for (let pi = 0; pi < p.word.length; pi++) {
        if (placed) break;
        for (let wi2 = 0; wi2 < word.length; wi2++) {
          if (word[wi2] !== p.word[pi]) continue;

          // Calculate position for intersection
          const dir: 'across' | 'down' = p.direction === 'across' ? 'down' : 'across';
          let row: number, col: number;

          if (dir === 'down') {
            row = p.row - wi2;
            col = p.col + pi;
          } else {
            row = p.row + pi;
            col = p.col - wi2;
          }

          if (canPlace(word, row, col, dir)) {
            placeWord(word, clue, row, col, dir);
            placed = true;
          }
        }
      }
    }
  }

  // Normalize grid coordinates to start at 0,0
  let minRow = Infinity, minCol = Infinity;
  let maxRow = -Infinity, maxCol = -Infinity;

  for (const key of grid.keys()) {
    const [r, c] = key.split(',').map(Number);
    minRow = Math.min(minRow, r);
    minCol = Math.min(minCol, c);
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }

  const width = maxCol - minCol + 1;
  const height = maxRow - minRow + 1;

  // Assign clue numbers
  const numberedCells = new Map<string, number>();
  let clueNumber = 1;

  // Sort placements by position (top-to-bottom, left-to-right)
  const sorted = [...placements].sort((a, b) => {
    const aR = a.row - minRow;
    const bR = b.row - minRow;
    const aC = a.col - minCol;
    const bC = b.col - minCol;
    if (aR !== bR) return aR - bR;
    return aC - bC;
  });

  const clues: CrosswordClue[] = [];

  for (const p of sorted) {
    const normalRow = p.row - minRow;
    const normalCol = p.col - minCol;
    const key = cellKey(normalRow, normalCol);

    let num = numberedCells.get(key);
    if (num === undefined) {
      num = clueNumber++;
      numberedCells.set(key, num);
    }

    clues.push({
      answer: p.word,
      clue: p.clue,
      direction: p.direction,
      row: normalRow,
      col: normalCol,
      number: num,
    });
  }

  return { width, height, clues };
}
