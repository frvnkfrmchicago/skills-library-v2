/* ══════════════════════════════════════════
   RENDER PAGE
   Takes saved Puck JSON and renders it as
   a live React component tree.
   ══════════════════════════════════════════ */

import { Render } from '@measured/puck';
import { puckConfig } from './PuckConfig';
import type { Data } from '@measured/puck';
import type { PuckData } from '../data/types';

interface RenderPageProps {
  data: PuckData;
}

/**
 * Renders a saved Puck page layout as a live React tree.
 * Used on the public-facing `/p/:slug` route to display
 * pages created in the visual editor.
 */
export function RenderPage({ data }: RenderPageProps) {
  return (
    <Render
      config={puckConfig}
      data={data as Data}
    />
  );
}

export default RenderPage;
