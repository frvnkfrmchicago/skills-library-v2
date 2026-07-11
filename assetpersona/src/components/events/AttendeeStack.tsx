/* ═══ ATTENDEE FACE STACK ═══ */
import './AttendeeStack.css';

interface AttendeeStackProps {
  count: number;
  maxVisible?: number;
  size?: 'sm' | 'md';
}

/* Deterministic color palette for avatar circles */
const AVATAR_COLORS = [
  '#FF8A66', '#7B61FF', '#00F5D4', '#F59E0B',
  '#E11D48', '#10B981', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16',
];

export default function AttendeeStack({ count, maxVisible = 4, size = 'sm' }: AttendeeStackProps) {
  const visible = Math.min(count, maxVisible);
  const overflow = count - visible;

  return (
    <div className={`attendee-stack attendee-stack--${size}`}>
      <div className="attendee-stack__faces">
        {Array.from({ length: visible }).map((_, i) => (
          <div
            key={i}
            className="attendee-stack__avatar"
            style={{
              backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
              zIndex: visible - i,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="attendee-stack__overflow">+{overflow}</span>
      )}
    </div>
  );
}
