import { colors, spacing } from '@/lib/design-tokens';

interface StatusDotProps {
  color: string;
  size?: number;
  pulse?: boolean;
}

export function StatusDot({ color, size = 10, pulse = false }: StatusDotProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
      <span style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'block',
      }} />
      {pulse && (
        <span style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 0.4,
          animation: 'status-pulse 2s ease-in-out infinite',
        }} />
      )}
      <style>{`@keyframes status-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0; transform: scale(1.5); } }`}</style>
    </span>
  );
}
