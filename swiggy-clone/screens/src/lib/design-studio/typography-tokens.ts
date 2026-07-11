/** Typography tokens for Design Studio font picker (typography-enforcing). */

export interface FontToken {
  id: string;
  label: string;
  family: string;
  weights: number[];
  sample: string;
}

export const STUDIO_FONT_TOKENS: FontToken[] = [
  { id: 'display', label: 'Display', family: '"Segoe UI", system-ui, sans-serif', weights: [700, 800], sample: 'Aa' },
  { id: 'body', label: 'Body', family: 'system-ui, -apple-system, sans-serif', weights: [400, 500, 600], sample: 'Aa' },
  { id: 'mono', label: 'Mono', family: 'ui-monospace, "Cascadia Code", monospace', weights: [400, 600], sample: '01' },
  { id: 'swiggy', label: 'Swiggy UI', family: '"Proxima Nova", "Helvetica Neue", Arial, sans-serif', weights: [600, 700], sample: 'Food' },
];

export function fontTokenById(id: string | undefined): FontToken | undefined {
  return STUDIO_FONT_TOKENS.find((t) => t.id === id);
}
