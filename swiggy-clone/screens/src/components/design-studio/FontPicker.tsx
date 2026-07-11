import { STUDIO_FONT_TOKENS, fontTokenById } from '@/lib/design-studio/typography-tokens';
import { glass } from '@/screens-theme';

interface Props {
  valueId?: string;
  onSelect: (tokenId: string, family: string) => void;
  accent: string;
  accentSoft: string;
  txtMuted: string;
  txtHeadline: string;
}

export function FontPicker({ valueId, onSelect, accent, accentSoft, txtMuted, txtHeadline }: Props) {
  const active = fontTokenById(valueId) ?? STUDIO_FONT_TOKENS[1];

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
        Font
      </p>
      <div
        className={`${glass.inset} max-h-[140px] overflow-y-auto rounded-lg p-1`}
        role="listbox"
        aria-label="Font family"
      >
        {STUDIO_FONT_TOKENS.map((token) => {
          const on = token.id === (valueId ?? active.id);
          return (
            <button
              key={token.id}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => onSelect(token.id, token.family)}
              className="mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left last:mb-0"
              style={{
                backgroundColor: on ? accentSoft : 'transparent',
                color: on ? accent : txtHeadline,
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-bold"
                style={{ fontFamily: token.family, background: 'rgba(255,255,255,0.06)' }}
              >
                {token.sample}
              </span>
              <span className="text-[12px] font-semibold">{token.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
