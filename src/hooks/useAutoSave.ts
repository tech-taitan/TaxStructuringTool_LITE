/**
 * Debounced auto-save hook for saved structures.
 *
 * Subscribes to the graph store and writes changes to local storage
 * after a 5 second debounce. Only activates when structureId is
 * non-null (i.e. the structure has been explicitly saved at least once).
 *
 * Returns a `saveNow` function for explicit saves (e.g. toolbar button).
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGraphStore } from '@/stores/graph-store';
import { autoSaveGraphData } from '@/lib/local-storage-db';

const AUTO_SAVE_DELAY_MS = 5000;

export function useAutoSave(structureId: string | null): {
    saveNow: () => void;
} {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<string>('');

    const save = useCallback(() => {
        if (!structureId) return;
        try {
            const snapshot = useGraphStore.getState().getSnapshot();
            const serialized = JSON.stringify(snapshot);

            // Skip if nothing changed
            if (serialized === lastSavedRef.current) return;

            autoSaveGraphData(structureId, snapshot);
            lastSavedRef.current = serialized;
        } catch {
            // Non-critical -- storage may be full
        }
    }, [structureId]);

    // Subscribe to graph store changes for auto-save
    useEffect(() => {
        if (!structureId) return;

        const unsub = useGraphStore.subscribe(() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(save, AUTO_SAVE_DELAY_MS);
        });

        return () => {
            unsub();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [structureId, save]);

    // Flush pending save on unmount / page unload
    useEffect(() => {
        if (!structureId) return;

        const handleUnload = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                save();
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [structureId, save]);

    const saveNow = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        save();
    }, [save]);

    return { saveNow };
}
