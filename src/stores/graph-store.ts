/**
 * Core graph state store using Zustand with temporal + immer middleware.
 *
 * Holds all nodes and edges for the React Flow canvas.
 * Integrates with React Flow's change handlers via applyNodeChanges/applyEdgeChanges.
 * This is the single source of truth for all graph state.
 *
 * Middleware ordering: temporal(immer(...)) -- temporal on outside, immer on inside.
 * Temporal middleware provides undo/redo via useGraphStore.temporal.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import {
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import type { TaxNode, TaxEdge, TaxEntityData, GraphSnapshot } from '@/models/graph';
import type { TaxRelationshipData } from '@/models/relationships';
import { UNDO_LIMIT } from '@/lib/constants';

/** Full graph store state and actions */
interface GraphState {
    /** All entity nodes on the canvas */
    nodes: TaxNode[];
    /** All relationship edges between entities */
    edges: TaxEdge[];
    /** Default jurisdiction inherited by all new entities */
    canvasJurisdiction: string;

    /** React Flow node change handler -- applies position, selection, removal changes */
    onNodesChange: OnNodesChange<TaxNode>;
    /** React Flow edge change handler -- applies selection, removal changes */
    onEdgesChange: OnEdgesChange<TaxEdge>;
    /** React Flow connection handler -- creates new edge from user-drawn connection */
    onConnect: OnConnect;

    /** Add a new entity node to the canvas */
    addNode: (node: TaxNode) => void;
    /** Remove an entity node and all its connected edges */
    removeNode: (id: string) => void;
    /** Remove multiple entity nodes and all their connected edges (batch delete) */
    removeNodes: (ids: string[]) => void;
    /** Set selected=true on all nodes, selected=false on all edges */
    selectAllNodes: () => void;
    /** Directly set all nodes (used by helper lines interceptor) */
    setNodes: (nodes: TaxNode[]) => void;
    /** Partially update the data on an entity node */
    updateNodeData: (id: string, data: Partial<TaxEntityData>) => void;
    /** Add a new relationship edge */
    addEdge: (edge: TaxEdge) => void;
    /** Remove a relationship edge by ID */
    removeEdge: (id: string) => void;
    /** Partially update the data on a relationship edge */
    updateEdgeData: (id: string, data: Partial<TaxRelationshipData>) => void;
    /** Paste nodes and edges atomically (creates single undo point) */
    pasteNodes: (nodes: TaxNode[], edges: TaxEdge[]) => void;
    /** Get a serializable snapshot of the current graph state */
    getSnapshot: () => GraphSnapshot;
    /** Hydrate the store from a database-loaded snapshot */
    loadSnapshot: (snapshot: GraphSnapshot) => void;
    /** Reconnect an existing edge to different source/target (goes through immer+temporal) */
    reconnectEdge: (edgeId: string, newSource: string, newTarget: string, newSourceHandle?: string, newTargetHandle?: string) => void;
    /** Nudge nodes by a position delta (goes through immer+temporal) */
    nudgeNodes: (ids: string[], dx: number, dy: number) => void;
    /** Clear all nodes and edges from the canvas */
    clearGraph: () => void;
    /** Set the default canvas jurisdiction for new entities */
    setCanvasJurisdiction: (jurisdiction: string) => void;
}

export const useGraphStore = create<GraphState>()(
    temporal(
        immer((set, get) => ({
            nodes: [],
            edges: [],
            canvasJurisdiction: 'AU',

            onNodesChange: (changes) => {
                set((state) => {
                    state.nodes = applyNodeChanges(changes, state.nodes);
                });
            },

            onEdgesChange: (changes) => {
                set((state) => {
                    state.edges = applyEdgeChanges(changes, state.edges);
                });
            },

            onConnect: () => {
                // Connection creation handled by Canvas via type picker modal
            },

            addNode: (node) => {
                set((state) => {
                    state.nodes.push(node);
                });
            },

            removeNode: (id) => {
                set((state) => {
                    state.nodes = state.nodes.filter((n) => n.id !== id);
                    state.edges = state.edges.filter(
                        (e) => e.source !== id && e.target !== id
                    );
                });
            },

            removeNodes: (ids) => {
                set((state) => {
                    const idSet = new Set(ids);
                    state.nodes = state.nodes.filter((n) => !idSet.has(n.id));
                    state.edges = state.edges.filter(
                        (e) => !idSet.has(e.source) && !idSet.has(e.target)
                    );
                });
            },

            selectAllNodes: () => {
                set((state) => {
                    for (const node of state.nodes) {
                        node.selected = true;
                    }
                    for (const edge of state.edges) {
                        edge.selected = false;
                    }
                });
            },

            setNodes: (nodes) => {
                set((state) => {
                    state.nodes = nodes;
                });
            },

            updateNodeData: (id, data) => {
                set((state) => {
                    const node = state.nodes.find((n) => n.id === id);
                    if (node) {
                        Object.assign(node.data, data);
                    }
                });
            },

            addEdge: (edge) => {
                set((state) => {
                    state.edges.push(edge);
                });
            },

            removeEdge: (id) => {
                set((state) => {
                    state.edges = state.edges.filter((e) => e.id !== id);
                });
            },

            updateEdgeData: (id, data) => {
                set((state) => {
                    const edge = state.edges.find((e) => e.id === id);
                    if (edge) {
                        edge.data = { ...edge.data, ...data } as TaxRelationshipData;
                    }
                });
            },

            pasteNodes: (newNodes, newEdges) => {
                set((state) => {
                    // Deselect all current nodes and edges
                    for (const node of state.nodes) {
                        node.selected = false;
                    }
                    for (const edge of state.edges) {
                        edge.selected = false;
                    }
                    // Add pasted items
                    state.nodes.push(...newNodes);
                    state.edges.push(...newEdges);
                });
            },

            getSnapshot: (): GraphSnapshot => {
                const { nodes, edges, canvasJurisdiction } = get();
                return {
                    nodes,
                    edges,
                    viewport: { x: 0, y: 0, zoom: 1 },
                    metadata: {
                        jurisdiction: canvasJurisdiction,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                };
            },

            loadSnapshot: (snapshot) => {
                set((state) => {
                    state.nodes = snapshot.nodes;
                    state.edges = snapshot.edges;
                    state.canvasJurisdiction = snapshot.metadata.jurisdiction;
                });
            },

            reconnectEdge: (edgeId, newSource, newTarget, newSourceHandle, newTargetHandle) => {
                set((state) => {
                    const edge = state.edges.find((e) => e.id === edgeId);
                    if (edge) {
                        edge.source = newSource;
                        edge.target = newTarget;
                        edge.sourceHandle = newSourceHandle;
                        edge.targetHandle = newTargetHandle;
                    }
                });
            },

            nudgeNodes: (ids, dx, dy) => {
                set((state) => {
                    const idSet = new Set(ids);
                    for (const node of state.nodes) {
                        if (idSet.has(node.id)) {
                            node.position.x += dx;
                            node.position.y += dy;
                        }
                    }
                });
            },

            clearGraph: () => {
                set((state) => {
                    state.nodes = [];
                    state.edges = [];
                });
            },

            setCanvasJurisdiction: (jurisdiction) => {
                set((state) => {
                    state.canvasJurisdiction = jurisdiction;
                });
            },
        })),
        {
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
            }),
            limit: UNDO_LIMIT,
            equality: (pastState, currentState) => {
                if (pastState.nodes === currentState.nodes && pastState.edges === currentState.edges) return true;
                if (pastState.nodes.length !== currentState.nodes.length ||
                    pastState.edges.length !== currentState.edges.length) return false;
                return pastState.nodes.every((n, i) => n === currentState.nodes[i]) &&
                    pastState.edges.every((e, i) => e === currentState.edges[i]);
            },
        }
    )
);
