/* ══════════════════════════════════════════
   STUDIO EDITOR
   Main editor component wrapping Puck.
   ══════════════════════════════════════════ */

import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { puckConfig } from './PuckConfig';
import { StudioProvider, useStudio } from './StudioProvider';
import { getPage } from '../data/studioStorage';
import { TEMPLATE_BLANK } from '../data/defaultTemplates';
import type { Data } from '@measured/puck';
import type { PuckData } from '../data/types';
import './studio-editor.css';

/** Inner editor that consumes the StudioProvider context */
function StudioEditorInner() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { setCurrentPage, savePage, markDirty, pushUndo, currentPage } = useStudio();
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  // Load page data on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (pageId && pageId !== 'new') {
        const page = await getPage(pageId);
        if (page) {
          setCurrentPage(page);
          setInitialData(page.puck_data as Data);
        } else {
          // Page not found, redirect to list
          navigate('/admin/studio');
          return;
        }
      } else {
        // New page — use blank template
        setCurrentPage(null);
        setInitialData(TEMPLATE_BLANK as Data);
      }
      setLoading(false);
    }
    load();
  }, [pageId, navigate, setCurrentPage]);

  const handleChange = useCallback((_data: Data) => {
    if (currentPage) {
      pushUndo(currentPage.puck_data);
    }
    markDirty();
  }, [currentPage, pushUndo, markDirty]);

  const handlePublish = useCallback(async (data: Data) => {
    await savePage(data as unknown as PuckData);
  }, [savePage]);

  if (loading || !initialData) {
    return (
      <div className="studio-loading">
        <div className="studio-loading__spinner" />
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="studio-editor">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        onChange={handleChange}
      />
    </div>
  );
}

/** Wrapped editor with provider */
export function StudioEditor() {
  return (
    <StudioProvider>
      <StudioEditorInner />
    </StudioProvider>
  );
}

export default StudioEditor;
