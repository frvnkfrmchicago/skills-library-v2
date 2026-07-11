import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { colors, spacing, borderRadius, motion, typeScale } from '@/lib/design-tokens';

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, label = 'Copy', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.glass.heavy}`,
        background: copied ? `${colors.semantic.success}22` : 'transparent',
        color: copied ? colors.semantic.success : colors.text.muted,
        fontSize: typeScale.sm,
        fontWeight: 600,
        cursor: 'pointer',
        transition: `all ${motion.durFast} ${motion.easeOut}`,
        fontFamily: 'inherit',
        minHeight: size === 'sm' ? 32 : 36,
      }}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
