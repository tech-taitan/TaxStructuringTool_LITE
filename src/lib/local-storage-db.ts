/**
 * Local storage persistence layer for tax structures.
 *
 * Replaces Supabase with browser-local storage. All structures are
 * stored in localStorage under the key 'tax-tool-structures' as a
 * JSON object keyed by structure ID.
 *
 * Limitations:
 * - ~5-10 MB storage limit per origin (varies by browser)
 * - Data is per-browser, not synced across devices
 * - No authentication -- all structures belong to the local user
 */

import type { GraphSnapshot } from '@/models/graph';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'tax-tool-structures';

/** Stored structure record */
export interface StoredStructure {
    id: string;
    name: string;
    graph_data: GraphSnapshot;
    thumbnail: string | null;
    created_at: string;
    updated_at: string;
}

/** Summary for dashboard listing (excludes full graph data) */
export interface StructureSummary {
    id: string;
    name: string;
    thumbnail: string | null;
    updated_at: string;
}

// ─── Internal helpers ─────────────────────────────────────────────

function getAllStructures(): Record<string, StoredStructure> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Record<string, StoredStructure>;
    } catch {
        return {};
    }
}

function writeAllStructures(data: Record<string, StoredStructure>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Save a structure (create or update).
 * @returns The structure ID (new or existing).
 */
export function saveStructure(
    structureId: string | null,
    name: string,
    snapshot: GraphSnapshot,
    thumbnail: string | null
): string {
    const all = getAllStructures();
    const now = new Date().toISOString();

    if (structureId && all[structureId]) {
        // Update existing
        all[structureId] = {
            ...all[structureId],
            name,
            graph_data: snapshot,
            thumbnail,
            updated_at: now,
        };
        writeAllStructures(all);
        return structureId;
    }

    // Create new
    const id = nanoid(12);
    all[id] = {
        id,
        name,
        graph_data: snapshot,
        thumbnail,
        created_at: now,
        updated_at: now,
    };
    writeAllStructures(all);
    return id;
}

/**
 * Auto-save only the graph data for an existing structure.
 * Skips name/thumbnail updates for performance.
 */
export function autoSaveGraphData(
    structureId: string,
    snapshot: GraphSnapshot
): void {
    const all = getAllStructures();
    if (!all[structureId]) return;

    all[structureId] = {
        ...all[structureId],
        graph_data: snapshot,
        updated_at: new Date().toISOString(),
    };
    writeAllStructures(all);
}

/**
 * Load a single structure by ID.
 * @throws Error if not found.
 */
export function loadStructure(structureId: string): StoredStructure {
    const all = getAllStructures();
    const structure = all[structureId];
    if (!structure) {
        throw new Error(`Structure not found: ${structureId}`);
    }
    return structure;
}

/**
 * List all structures, sorted by most recently updated first.
 */
export function listStructures(): StructureSummary[] {
    const all = getAllStructures();
    return Object.values(all)
        .map(({ id, name, thumbnail, updated_at }) => ({
            id,
            name,
            thumbnail,
            updated_at,
        }))
        .sort(
            (a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
}

/**
 * Delete a structure by ID.
 */
export function deleteStructure(structureId: string): void {
    const all = getAllStructures();
    delete all[structureId];
    writeAllStructures(all);
}

/**
 * Rename a structure.
 */
export function renameStructure(structureId: string, newName: string): void {
    const all = getAllStructures();
    if (!all[structureId]) return;
    all[structureId].name = newName;
    all[structureId].updated_at = new Date().toISOString();
    writeAllStructures(all);
}
