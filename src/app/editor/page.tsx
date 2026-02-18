'use client';

/**
 * Editor page -- anonymous structure editing.
 *
 * The canvas works fully without authentication.
 * Uses the shared EditorLayout component for the full editor workspace.
 *
 * The Save button creates a new structure in local storage and
 * redirects to /editor/[id] for continued editing with auto-save.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EditorLayout from '@/components/editor/EditorLayout';
import { useGraphStore } from '@/stores/graph-store';
import { saveStructure } from '@/lib/local-storage-db';
import { clearLocalBackup } from '@/hooks/useLocalBackup';

export default function EditorPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const snapshot = useGraphStore.getState().getSnapshot();
      const name = snapshot.nodes[0]?.data?.name
        ? `${snapshot.nodes[0].data.name} Structure`
        : 'Untitled Structure';

      const newId = saveStructure(null, name, snapshot, null);

      // Clear the anonymous draft since we've saved
      clearLocalBackup();

      // Redirect to the saved structure editor
      router.push(`/editor/${newId}`);
    } catch {
      // Save failed
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  // canSave is true when there are nodes on the canvas
  const hasNodes = useGraphStore((s) => s.nodes.length > 0);

  return (
    <EditorLayout
      structureId={null}
      structureName="Untitled Structure"
      onSave={handleSave}
      isSaving={isSaving}
      canSave={hasNodes}
    />
  );
}
