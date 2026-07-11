import {
  MousePointer2,
  Type,
  ImagePlus,
  Video,
  Music,
  MapPin,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';
import type { DesignTool } from '@/lib/design-queue/types';
import { glass } from '@/screens-theme';

const TOOLS: { id: DesignTool; label: string; Icon: typeof MousePointer2 }[] = [
  { id: 'select', label: 'Select', Icon: MousePointer2 },
  { id: 'text', label: 'Text', Icon: Type },
  { id: 'image', label: 'Image', Icon: ImagePlus },
  { id: 'video', label: 'Video', Icon: Video },
  { id: 'audio', label: 'Audio', Icon: Music },
  { id: 'pin', label: 'Pin', Icon: MapPin },
  { id: 'arrow', label: 'Arrow', Icon: ArrowUpRight },
  { id: 'callout', label: 'Note', Icon: MessageSquare },
];

interface Props {
  tool: DesignTool;
  onTool: (t: DesignTool) => void;
  accent: string;
  accentSoft: string;
  accentLine: string;
}

export function DesignToolbar({ tool, onTool, accent, accentSoft, accentLine }: Props) {
  return (
    <div
      className={`${glass.raised} flex flex-col gap-1 p-1.5`}
      role="toolbar"
      aria-label="Design tools"
    >
      {TOOLS.map(({ id, label, Icon }) => {
        const on = tool === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={on}
            onClick={() => onTool(id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{
              backgroundColor: on ? accentSoft : 'transparent',
              color: on ? accent : 'rgba(255,255,255,0.55)',
              border: `1px solid ${on ? accentLine : 'transparent'}`,
            }}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
