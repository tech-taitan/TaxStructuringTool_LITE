'use client';

/**
 * Dashboard page listing all saved structures.
 *
 * Reads from local storage and displays structure cards in a
 * responsive grid. Fully client-side, no authentication required.
 */

import { useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FileText, ArrowLeft } from 'lucide-react';
import {
    listStructures,
    deleteStructure,
    type StructureSummary,
} from '@/lib/local-storage-db';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

/** Format a date string for display */
function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
}

/** Cached snapshot for useSyncExternalStore (React 19 requires stable references) */
let cachedSnapshot: StructureSummary[] | null = null;
function getStructuresSnapshot(): StructureSummary[] {
    if (cachedSnapshot === null) {
        cachedSnapshot = listStructures();
    }
    return cachedSnapshot;
}

const SERVER_SNAPSHOT: StructureSummary[] = [];
function getServerSnapshot(): StructureSummary[] {
    return SERVER_SNAPSHOT;
}

export default function DashboardPage() {
    const router = useRouter();
    const { isMobile, isTouchDevice } = useDeviceCapabilities();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const subscribeStructures = useCallback((onStoreChange: () => void) => {
        if (typeof window === 'undefined') {
            return () => undefined;
        }

        const handler = (event: StorageEvent) => {
            if (event.key === null || event.key === 'tax-tool-structures') {
                cachedSnapshot = null;
                onStoreChange();
            }
        };

        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const structures = useSyncExternalStore<StructureSummary[]>(
        subscribeStructures,
        getStructuresSnapshot,
        getServerSnapshot
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteStructure(id);
            cachedSnapshot = null;
            setDeleteConfirmId(null);
        },
        []
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className={`max-w-6xl mx-auto ${isMobile ? 'flex flex-col gap-3 px-4 py-3' : 'flex items-center justify-between px-6 py-4'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Back to Home"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                My Structures
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Saved locally in your browser
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/editor"
                        className={`flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors ${isMobile ? 'w-full justify-center' : ''}`}
                    >
                        <Plus className="w-4 h-4" />
                        New Structure
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className={`max-w-6xl mx-auto ${isMobile ? 'px-4 py-6' : 'px-6 py-8'}`}>
                {structures.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                            No structures yet
                        </h2>
                        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                            Create your first tax structure to get started. Your work is saved
                            locally in your browser.
                        </p>
                        <Link
                            href="/editor"
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first structure
                        </Link>
                    </div>
                ) : (
                    /* Structure grid */
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isMobile ? 'gap-4' : 'gap-6'}`}>
                        {structures.map((structure) => (
                            <div
                                key={structure.id}
                                className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <Link
                                    href={`/editor/${structure.id}`}
                                    className="block"
                                >
                                    {/* Thumbnail / placeholder */}
                                    <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center border-b border-gray-100">
                                        {structure.thumbnail ? (
                                            <img
                                                src={structure.thumbnail}
                                                alt={structure.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                                    <FileText className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <span className="text-xs text-gray-300">
                                                    No preview
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Card footer */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <Link
                                        href={`/editor/${structure.id}`}
                                        className="flex-1 min-w-0"
                                    >
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {structure.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {formatDate(structure.updated_at)}
                                        </p>
                                    </Link>

                                    {/* Delete button -- always visible on touch devices */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeleteConfirmId(structure.id);
                                        }}
                                        className={`p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all ${isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        title="Delete structure"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Delete confirmation modal */}
            {deleteConfirmId && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    onClick={() => setDeleteConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Delete Structure?
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            This action cannot be undone. The structure will be permanently
                            removed from your browser.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded touch-target"
                                onClick={() => setDeleteConfirmId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded touch-target"
                                onClick={() => handleDelete(deleteConfirmId)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
