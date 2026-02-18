'use client';

/**
 * Editor page for a previously saved structure.
 *
 * Loads the structure from local storage on mount, hydrates the graph
 * store, and enables auto-save. The Save button triggers an explicit save
 * with thumbnail capture.
 */

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EditorLayout from '@/components/editor/EditorLayout';
import { useGraphStore } from '@/stores/graph-store';
import { loadStructure, saveStructure } from '@/lib/local-storage-db';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function SavedEditorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [structureName, setStructureName] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Activate auto-save
    const { saveNow } = useAutoSave(id);

    // Load structure on mount
    useEffect(() => {
        try {
            const structure = loadStructure(id);
            useGraphStore.getState().loadSnapshot(structure.graph_data);
            setStructureName(structure.name);
            setLoading(false);
        } catch {
            setError('Structure not found');
            setLoading(false);
        }
    }, [id]);

    // Explicit save handler
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const snapshot = useGraphStore.getState().getSnapshot();
            saveStructure(id, structureName, snapshot, null);
            saveNow();
        } catch {
            // Save failed -- non-critical
        } finally {
            setIsSaving(false);
        }
    }, [id, structureName, saveNow]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading structure...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
                <div className="text-center max-w-sm">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                        {error}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        This structure may have been deleted or the link is invalid.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <EditorLayout
            structureId={id}
            structureName={structureName}
            onSave={handleSave}
            isSaving={isSaving}
            canSave={true}
        />
    );
}
