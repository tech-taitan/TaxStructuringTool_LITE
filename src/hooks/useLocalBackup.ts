/**
 * localStorage draft backup for anonymous editor sessions.
 *
 * Debounces graph store changes and persists the graph snapshot to
 * localStorage so anonymous users can recover work if the browser
 * closes accidentally. Only active when structureId is null (anonymous).
 *
 * On mount, checks for an existing draft and returns it so the UI
 * can offer a restore prompt.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGraphStore } from '@/stores/graph-store';
import type { GraphSnapshot } from '@/models/graph';

const STORAGE_KEY = 'tax-tool-draft';
const BACKUP_DELAY_MS = 3000;

interface LocalBackupState {
  /** Whether a recoverable draft was found on mount */
  hasDraft: boolean;
  /** Restore the draft into the graph store */
  restoreDraft: () => void;
  /** Discard the draft from localStorage */
  discardDraft: () => void;
}

export function useLocalBackup(structureId: string | null): LocalBackupState {
  const [hasDraft, setHasDraft] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnonymous = structureId === null;

  // Check for existing draft on mount (anonymous only)
  useEffect(() => {
    if (!isAnonymous) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GraphSnapshot;
        if (parsed.nodes && parsed.nodes.length > 0) {
          setHasDraft(true);
        }
      }
    } catch {
      // Invalid data -- ignore
    }
  }, [isAnonymous]);

  // Subscribe to graph store changes and backup (anonymous only)
  useEffect(() => {
    if (!isAnonymous) return;

    const unsub = useGraphStore.subscribe(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        try {
          const snapshot = useGraphStore.getState().getSnapshot();
          if (snapshot.nodes.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
          }
        } catch {
          // Storage full or unavailable -- non-critical
        }
      }, BACKUP_DELAY_MS);
    });

    return () => {
      unsub();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAnonymous]);

  const restoreDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const snapshot = JSON.parse(stored) as GraphSnapshot;
        useGraphStore.getState().loadSnapshot(snapshot);
        localStorage.removeItem(STORAGE_KEY);
        setHasDraft(false);
      }
    } catch {
      // Failed to restore -- clear bad data
      localStorage.removeItem(STORAGE_KEY);
      setHasDraft(false);
    }
  }, []);

  const discardDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
  }, []);

  return { hasDraft, restoreDraft, discardDraft };
}

/** Clear the draft backup (call after successful save) */
export function clearLocalBackup(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-critical
  }
}
