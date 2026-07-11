import type { ReactNode } from 'react';
import './SceneSection.css';

type Props = {
  id: string;
  children: ReactNode;
  bgImage?: string;
  /** 'blue' | 'salmon' | 'mix' determines light treatment */
  mood?: 'blue' | 'salmon' | 'mix';
  className?: string;
};

export default function SceneSection({ id, children, bgImage, mood = 'mix', className }: Props) {
  return (
    <section
      id={id}
      className={[
        'sceneSection',
        `sceneSection--${mood}`,
        className ?? '',
      ].join(' ')}
      style={bgImage ? { ['--scene-bg' as never]: `url(${bgImage})` } : undefined}
    >
      {children}
    </section>
  );
}

