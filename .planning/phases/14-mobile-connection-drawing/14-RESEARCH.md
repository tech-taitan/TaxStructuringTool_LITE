# Phase 14: Mobile Connection Drawing - Research

**Researched:** 2026-03-05
**Domain:** Mobile touch connection flow, React Flow connectOnClick, handle sizing, visual feedback
**Confidence:** HIGH

## Summary

Phase 14 enables mobile users to draw connections between entities using a tap-to-connect flow. The implementation has two viable approaches: (1) leveraging React Flow's built-in `connectOnClick` prop (default `true`) which allows tapping a source handle then tapping a target handle to create a connection, or (2) building a custom tap-on-node flow using the existing `pendingConnectionSource` / `mobileTool: 'connect'` state already wired in the UI store. The research strongly recommends **Approach 2: custom tap-on-node flow**, because it provides a dramatically better mobile UX -- users tap entire nodes (large targets) rather than tiny handles (small targets), and it integrates naturally with the existing state management already set up in Phase 13.

The codebase is well-prepared for this phase. Phase 13 already wired `pendingConnectionSource` and `mobileTool: 'connect'` in both the MobileContextMenu "Connect" action and the MobileEditorLayout toolbar "Connect" button. The `MobileConnectionTypePicker` bottom sheet is already built and working. The Canvas component already has `handleConnect` (intercepted by type picker) and `isValidConnection` (prevents self-connections). The graph store has `addEdge`. All that remains is: (1) making the Connect toolbar button toggle connect mode on/off with visual active state, (2) intercepting `onNodeClick` in connect mode to set source then target, (3) adding a floating instruction banner showing connection flow state, (4) adding source entity highlight, and (5) improving handle visibility/sizing on touch devices.

**Primary recommendation:** Build a custom tap-on-node connection flow that intercepts `onNodeClick` when `mobileTool === 'connect'`, uses `pendingConnectionSource` to track the two-tap state machine (null -> source set -> target tapped -> create edge -> reset), shows a floating instruction banner at the top of the screen, and highlights the source entity with a CSS ring. The built-in `connectOnClick` handle-tap flow remains available as a secondary path but is not the primary mobile UX.

## Standard Stack

### Core (Already Installed -- Zero New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@xyflow/react` | ^12.10.0 | Canvas, `onNodeClick`, `connectOnClick`, `useConnection` hook, Handle component | All connection infrastructure already present |
| `zustand` | ^5.0.11 | `mobileTool`, `pendingConnectionSource`, `setMobileTool`, `setPendingConnectionSource` | State already defined in Phase 10/13 |
| `lucide-react` | ^0.564.0 | `Link` icon for Connect button, `X` icon for cancel | Already used in toolbar |

### Supporting (Already Present)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `nanoid` | ^5.1.6 | Edge ID generation | When creating new edges in tap-to-connect flow |
| `zundo` | ^2.3.0 | Temporal middleware | New edges go through tracked store mutations (undo support) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom tap-on-node flow | React Flow `connectOnClick` (handle-tap) | Built-in flow requires tapping tiny handles on mobile; custom flow lets users tap entire node bodies (much larger targets). Custom flow is more work but dramatically better UX. |
| Floating instruction banner | Toast/snackbar library | Over-engineering for a single status message; a plain positioned div is simpler and matches existing patterns (no new dependency). |
| CSS ring highlight for source | React Flow `className` on node wrapper | Need to control from outside the node; passing a prop or using CSS class on the `.react-flow__node` wrapper based on pendingConnectionSource matches the ID. |

**Installation:**
```bash
# No installation needed -- zero new dependencies
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── canvas/
│   │   └── Canvas.tsx                    # Modified: onNodeClick intercept for connect mode
│   ├── mobile/
│   │   ├── MobileConnectionBanner.tsx    # NEW: floating instruction banner
│   │   └── MobileConnectionTypePicker.tsx # Existing: already built
│   └── editor/
│       └── MobileEditorLayout.tsx        # Modified: Connect button active state + cancel
├── stores/
│   └── ui-store.ts                       # Existing: mobileTool + pendingConnectionSource
└── app/
    └── globals.css                       # Modified: handle sizing, source highlight ring
```

### Pattern 1: Two-Tap State Machine via Zustand

**What:** A simple state machine using `mobileTool` and `pendingConnectionSource` to track the connection flow: Idle -> Source Selected -> Target Tapped -> Create Edge -> Reset.

**When to use:** Whenever `mobileTool === 'connect'` and the user taps a node.

**State transitions:**
```
Idle (mobileTool: null, pendingConnectionSource: null)
  -> User taps Connect button in toolbar
  -> Connect Mode (mobileTool: 'connect', pendingConnectionSource: null)
     -> User taps a node
     -> Source Selected (mobileTool: 'connect', pendingConnectionSource: nodeId)
        -> User taps another node (not same)
        -> Show ConnectionTypePicker
           -> User picks type
           -> Create edge, reset to Connect Mode
           -> User cancels picker
           -> Reset to Connect Mode (pendingConnectionSource: null)
        -> User taps same node
        -> Deselect source, reset to Connect Mode (pendingConnectionSource: null)
     -> User taps Cancel / Connect button again
     -> Reset to Idle (mobileTool: null, pendingConnectionSource: null)
```

**Example (onNodeClick intercept in Canvas):**
```typescript
// Inside Canvas component
const mobileTool = useUIStore((s) => s.mobileTool);
const pendingConnectionSource = useUIStore((s) => s.pendingConnectionSource);

const onNodeClick = useCallback(
  (_event: React.MouseEvent, node: TaxNode) => {
    // Connect mode intercept -- must come before other click handling
    if (isMobile && mobileTool === 'connect') {
      if (!pendingConnectionSource) {
        // First tap: set as source
        useUIStore.getState().setPendingConnectionSource(node.id);
      } else if (pendingConnectionSource === node.id) {
        // Tapped same node: deselect source
        useUIStore.getState().setPendingConnectionSource(null);
      } else {
        // Second tap on different node: initiate connection
        setPendingConnection({
          source: pendingConnectionSource,
          target: node.id,
          sourceHandle: null,
          targetHandle: null,
        });
        useUIStore.getState().setPendingConnectionSource(null);
      }
      return; // Don't process normal click logic
    }

    // Existing two-step tap for properties...
    if (!isMobile) return;
    // ...
  },
  [isMobile, mobileTool, pendingConnectionSource],
);
```

### Pattern 2: Connect Mode Toggle with Active State

**What:** The Connect button in the mobile toolbar toggles between connect mode and normal mode, with clear visual feedback (highlighted button, colored ring).

**When to use:** For entering/exiting connect mode.

**Example (MobileEditorLayout toolbar modification):**
```typescript
const mobileTool = useUIStore((s) => s.mobileTool);

const handleConnectToggle = useCallback(() => {
  if (mobileTool === 'connect') {
    // Exit connect mode
    useUIStore.getState().setMobileTool(null);
    useUIStore.getState().setPendingConnectionSource(null);
  } else {
    // Enter connect mode
    useUIStore.getState().setMobileTool('connect');
  }
}, [mobileTool]);

// In JSX:
<button
  onClick={handleConnectToggle}
  className={`p-2.5 rounded-full ${
    mobileTool === 'connect'
      ? 'bg-blue-500 text-white'
      : 'text-gray-600 dark:text-gray-300 active:bg-gray-100'
  }`}
  aria-label={mobileTool === 'connect' ? 'Exit connect mode' : 'Connect entities'}
>
  <Link className="w-5 h-5" />
</button>
```

### Pattern 3: Source Entity Visual Highlight

**What:** When a source entity is selected in connect mode, apply a visible highlight ring to the node via CSS class.

**When to use:** While `pendingConnectionSource` is non-null.

**Example (CSS approach using React Flow's node wrapper):**
```css
/* Source entity highlight during connect flow */
.react-flow__node.mobile-connect-source .entity-node {
  box-shadow: 0 0 0 3px #3B82F6, 0 0 12px rgba(59, 130, 246, 0.3);
}

/* Clip-path shapes need filter instead */
.react-flow__node.mobile-connect-source .entity-node--triangle,
.react-flow__node.mobile-connect-source .entity-node--diamond,
.react-flow__node.mobile-connect-source .entity-node--hexagon,
.react-flow__node.mobile-connect-source .entity-node--shield {
  box-shadow: none;
  filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.6));
}
```

**Applying the class:** Use React Flow's node `className` prop or modify the nodes array to add a className when a node is the pending source. The simplest approach is to derive it in the Canvas component:
```typescript
const styledNodes = useMemo(() => {
  if (!pendingConnectionSource) return nodes;
  return nodes.map(n =>
    n.id === pendingConnectionSource
      ? { ...n, className: 'mobile-connect-source' }
      : n
  );
}, [nodes, pendingConnectionSource]);

// Pass styledNodes to ReactFlow instead of nodes
```

### Pattern 4: Floating Instruction Banner

**What:** A small floating banner at the top of the canvas area that shows the current connection flow state: "Tap a source entity", "Tap a target entity", or "Select connection type".

**When to use:** While `mobileTool === 'connect'`.

**Example:**
```typescript
function MobileConnectionBanner() {
  const mobileTool = useUIStore((s) => s.mobileTool);
  const pendingSource = useUIStore((s) => s.pendingConnectionSource);
  const nodes = useGraphStore((s) => s.nodes);

  if (mobileTool !== 'connect') return null;

  const sourceName = pendingSource
    ? nodes.find(n => n.id === pendingSource)?.data.name ?? 'entity'
    : null;

  const message = sourceName
    ? `Now tap a target entity to connect from "${sourceName}"`
    : 'Tap an entity to start a connection';

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40
                    px-4 py-2 bg-blue-500 text-white text-sm font-medium
                    rounded-full shadow-lg flex items-center gap-2">
      <Link className="w-4 h-4" />
      <span>{message}</span>
      <button
        onClick={() => {
          useUIStore.getState().setMobileTool(null);
          useUIStore.getState().setPendingConnectionSource(null);
        }}
        className="ml-1 p-0.5 rounded-full hover:bg-blue-600 active:bg-blue-700"
        aria-label="Cancel connection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Relying solely on connectOnClick handle-tap for mobile:** Handles are 14px visible elements with ~30px hit areas on desktop. Even with the Phase 11 CSS enlarging the ::after pseudo to 44px, this still requires tapping small specific areas on the node. Tapping the entire node body is dramatically easier on mobile.

- **Keeping connect mode active after connection creation:** After a successful connection, reset `pendingConnectionSource` to null but KEEP `mobileTool: 'connect'` so the user can create multiple connections without re-entering connect mode. Only exiting when the user explicitly taps Cancel or the Connect button again.

- **Blocking normal selection in connect mode:** In connect mode, tapping a node should BOTH select it (React Flow selection) AND process it as a connect target. Don't suppress selection -- the selection ring provides additional visual feedback.

- **Using node-level state for connect highlight:** Don't add `isConnectSource` to node data -- this pollutes the undo/redo history. Use a derived `className` on the React Flow node wrapper or the UI store value directly in CSS.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Connection type selection | Custom type picker UI | Existing `MobileConnectionTypePicker` | Already built in Phase 13, uses BottomSheet, has all 8 types |
| Edge creation with validation | Manual edge object construction | Existing `handleConnectionTypeSelected` + `setPendingConnection` in Canvas | Already handles nanoid, default relationship data, store.addEdge |
| Self-connection prevention | Custom check in tap handler | Existing `isValidConnection` callback on ReactFlow | Already configured to reject source === target |
| Handle visibility on touch | JavaScript-driven show/hide | CSS `@media (pointer: coarse)` rules | Already exists in globals.css, just needs sizing adjustments |
| Spring animations for banner | JavaScript animation | CSS transitions/animations | Simple enter/exit animation doesn't need spring physics |

**Key insight:** The existing Canvas.tsx connection infrastructure (pendingConnection state, handleConnect, handleConnectionTypeSelected, handleConnectionCancel, MobileConnectionTypePicker) is the exact flow needed for the tap-to-connect final step. The only new work is the node-tap interception and visual feedback -- the edge creation pipeline is fully reusable.

## Common Pitfalls

### Pitfall 1: onNodeClick vs onPaneClick Race Condition

**What goes wrong:** Tapping a node fires both `onNodeClick` AND potentially `onPaneClick` (if the tap is near the edge of the node). In connect mode, `onPaneClick` resets state (deselects, closes menus), which can cancel an in-progress connection.

**Why it happens:** React Flow fires `onPaneClick` when clicking the canvas background. On touch devices with imprecise taps, the boundary between node and pane can be ambiguous.

**How to avoid:** In `onPaneClick`, check if `mobileTool === 'connect'` before resetting connection state. If in connect mode, a pane click should cancel the current connection attempt (reset `pendingConnectionSource` to null) but NOT exit connect mode entirely -- the user may have just missed.

**Warning signs:** Tapping a node sometimes exits connect mode unexpectedly; connection source gets cleared randomly.

### Pitfall 2: Connect Mode Interfering with Node Drag

**What goes wrong:** In connect mode, tapping a node to select it as source/target also initiates a node drag if the user's finger moves slightly during the tap.

**Why it happens:** React Flow's node drag handler activates on touchstart+touchmove. A "tap" on mobile almost always has slight finger movement.

**How to avoid:** This is largely handled by React Flow internally -- `onNodeClick` only fires if the interaction was a click (not a drag). However, if issues arise, the `nodesDraggable` prop could be conditionally set to `false` during connect mode. Better approach: let React Flow handle the distinction naturally and test on real devices.

**Warning signs:** Tapping a node in connect mode causes it to shift position.

### Pitfall 3: Stale pendingConnectionSource After Node Deletion

**What goes wrong:** If the user enters connect mode, taps a source node, then somehow deletes that source node (via undo, or if another flow triggers deletion), the `pendingConnectionSource` points to a nonexistent node.

**Why it happens:** `pendingConnectionSource` is a node ID string in ui-store; node deletion happens in graph-store. There's no cross-store subscription.

**How to avoid:** Before creating the edge (when target is tapped), verify both source and target nodes still exist in the graph store. If source doesn't exist, reset `pendingConnectionSource` to null and show no error (silent recovery).

**Warning signs:** Edge creation fails silently; connection type picker appears but edge isn't created.

### Pitfall 4: Multiple Quick Taps Causing Double Edge Creation

**What goes wrong:** If the user taps the target node very quickly multiple times, the connection type picker could fire multiple times, or multiple edges could be created.

**Why it happens:** Each `onNodeClick` fires independently. Without debouncing or state guards, rapid taps process independently.

**How to avoid:** After setting `pendingConnection` (which shows the type picker), immediately clear `pendingConnectionSource`. The type picker is modal (bottom sheet covers canvas), preventing further taps. The existing `pendingConnection` state in Canvas already acts as a guard -- `setPendingConnection` is called once, and `handleConnectionTypeSelected` clears it.

**Warning signs:** Duplicate edges appear between the same nodes.

### Pitfall 5: Handle Hit Area Conflicts with Node Click

**What goes wrong:** On touch devices with enlarged handle hit areas (44px), tapping near the edge of a node hits the handle's ::after pseudo-element instead of the node body. This triggers React Flow's built-in `connectOnClick` flow (handle-tap-to-connect) instead of the custom node-tap flow.

**Why it happens:** Handles are positioned on the node border with large invisible ::after elements for touch targeting. On a 180x70px node, a significant portion of the tap area may be covered by handle hit zones.

**How to avoid:** Two options: (1) Set `connectOnClick={false}` on the ReactFlow component to disable the built-in handle-tap flow entirely on mobile, forcing all connections through the custom node-tap flow. (2) Leave both flows active and accept that users can connect either way. Option 1 is cleaner for mobile; the built-in flow can remain on desktop. Conditionally set `connectOnClick={!isMobile}` or `connectOnClick={mobileTool !== 'connect'}`.

**Warning signs:** Tapping near a node's edge starts an unexpected connection line instead of processing the node tap.

### Pitfall 6: Missing onPaneClick Cancel in Connect Mode

**What goes wrong:** User enters connect mode, selects a source, then taps empty canvas. Expected: source deselected but still in connect mode. Actual: nothing happens (if onPaneClick doesn't handle connect state) or everything resets (if onPaneClick clears mobileTool too aggressively).

**Why it happens:** The existing `onPaneClick` handler deselects nodes and closes menus. It has no awareness of connect mode.

**How to avoid:** Add connect mode handling to `onPaneClick`: if `pendingConnectionSource` is set, clear it (deselect source). If `pendingConnectionSource` is null but `mobileTool === 'connect'`, do nothing (stay in connect mode). Only exit connect mode on explicit Cancel button tap or Connect toggle.

**Warning signs:** Users get stuck in connect mode with no way to deselect source without exiting.

## Code Examples

Verified patterns from the existing codebase:

### Existing Connection Flow (Canvas.tsx)
```typescript
// Source: src/components/canvas/Canvas.tsx lines 362-396
// This exact flow is reused for tap-to-connect -- only the trigger changes
const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

const handleConnect = useCallback((connection: Connection) => {
  setPendingConnection(connection); // Shows type picker
}, []);

const handleConnectionTypeSelected = useCallback(
  (type: RelationshipType) => {
    if (!pendingConnection) return;
    const newEdge: TaxEdge = {
      id: nanoid(),
      source: pendingConnection.source,
      target: pendingConnection.target,
      sourceHandle: pendingConnection.sourceHandle ?? undefined,
      targetHandle: pendingConnection.targetHandle ?? undefined,
      type: 'relationship',
      data: getDefaultRelationshipData(type),
    };
    useGraphStore.getState().addEdge(newEdge);
    setPendingConnection(null);
  },
  [pendingConnection]
);
```

### Existing MobileContextMenu Connect Action (MobileContextMenu.tsx)
```typescript
// Source: src/components/mobile/MobileContextMenu.tsx lines 97-101
// Already sets pendingConnectionSource and mobileTool -- our flow picks up from here
const handleConnect = useCallback(() => {
  useUIStore.getState().setPendingConnectionSource(nodeId);
  useUIStore.getState().setMobileTool('connect');
  onClose();
}, [nodeId, onClose]);
```

### Existing Touch Handle CSS (globals.css)
```css
/* Source: src/app/globals.css lines 294-328 */
@media (pointer: coarse) {
  .react-flow__handle {
    opacity: 0.3;
  }
  .react-flow__handle::after {
    top: -15px; left: -15px; right: -15px; bottom: -15px;
  }
  .react-flow__node.selected .react-flow__handle {
    opacity: 0.7;
  }
  .react-flow__node.connecting .react-flow__handle {
    opacity: 0.8;
  }
}
```

### Existing MobileEditorLayout Connect Button
```typescript
// Source: src/components/editor/MobileEditorLayout.tsx lines 115-122
// Currently fires setMobileTool('connect') -- needs toggle behavior
<button
  onClick={() => setMobileTool('connect')}
  className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 active:bg-gray-100"
  aria-label="Connect entities"
>
  <Link className="w-5 h-5" />
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Drag connection line from handle to handle | `connectOnClick` tap-handle-to-handle (React Flow v10+) | React Flow v10 (2022) | Touch devices can create connections without precise drag |
| `connectOnClick` handle-tap only | Custom node-tap flow on mobile (this phase) | Phase 14 | Much larger touch targets; full node body is tappable |
| Handles invisible by default | Handles always visible on touch (`pointer: coarse`) | Phase 11 | Users can discover connection points without hover |

**Deprecated/outdated:**
- React Flow v11's `useStore` for connection state replaced by v12's `useConnection` hook

## Open Questions

1. **connectOnClick on desktop: keep or disable?**
   - What we know: `connectOnClick` defaults to `true` and is not explicitly set in Canvas.tsx. It works on desktop too (click handle, click another handle). The desktop connection flow uses drag-from-handle which works fine.
   - What's unclear: Should we disable `connectOnClick` on desktop too, or leave it as an additional connection method? It shouldn't cause conflicts since desktop users primarily drag.
   - Recommendation: Leave `connectOnClick` enabled on desktop (default behavior). On mobile in connect mode, disable it to avoid conflicts with the custom node-tap flow. Set `connectOnClick={mobileTool !== 'connect'}`.

2. **Handle selection for tap-to-connect: which handle?**
   - What we know: When tapping a whole node (not a specific handle), the connection has no `sourceHandle` or `targetHandle`. React Flow's auto-routing uses `ConnectionMode.Loose` which allows connecting to any handle.
   - What's unclear: Will passing `null` for sourceHandle/targetHandle to the Connection object work correctly with the existing edge rendering? The edge path calculation uses handle positions.
   - Recommendation: Pass `null` handles; React Flow with `ConnectionMode.Loose` and `connectionRadius: 30` already handles this case. The edge will route to the closest handle pair. Verify during implementation.

3. **Should connect mode persist after creating a connection?**
   - What we know: The roadmap says "draw connections" (plural) suggesting multi-connection workflows. Figma and Miro keep tool modes active until explicitly cancelled.
   - What's unclear: User expectation -- is it annoying to stay in connect mode, or convenient?
   - Recommendation: Keep `mobileTool: 'connect'` active after each connection. Reset only `pendingConnectionSource` to null. User exits via Cancel button or re-tapping Connect. This matches professional tool conventions.

## Sources

### Primary (HIGH confidence)
- React Flow API Reference - ReactFlow component props: https://reactflow.dev/api-reference/react-flow -- confirmed `connectOnClick` prop, default `true`, touch support
- React Flow Touch Device example: https://reactflow.dev/examples/interaction/touch-device -- handle sizing CSS, tap-to-connect via `connectOnClick`
- React Flow Handle component API: https://reactflow.dev/api-reference/components/handle -- `isConnectable`, `isConnectableStart`, `isConnectableEnd` props
- React Flow useConnection hook: https://reactflow.dev/api-reference/hooks/use-connection -- connection state during active connections
- React Flow Easy Connect example: https://reactflow.dev/examples/nodes/easy-connect -- full-node connection area pattern
- xyflow/xyflow Discussion #3006: https://github.com/xyflow/xyflow/discussions/3006 -- onClickConnectStart/End + conditionally rendered handles gotcha

### Secondary (MEDIUM confidence)
- React Flow v12 release notes: https://xyflow.com/blog/react-flow-12-release -- useConnection hook introduced in v12
- React Flow v11.5.0 release: https://xyflow.com/blog/react-flow-v-11-5 -- touch drag-to-connect added

### Codebase (HIGH confidence)
- `src/stores/ui-store.ts` -- `MobileTool`, `pendingConnectionSource`, `mobileTool` state
- `src/components/canvas/Canvas.tsx` -- ReactFlow configuration, `handleConnect`, `isValidConnection`, `setPendingConnection`
- `src/components/canvas/nodes/EntityNode.tsx` -- Handle configuration (8 handles: 4 cardinal + 4 intermediate)
- `src/components/mobile/MobileContextMenu.tsx` -- Connect action already wires `setPendingConnectionSource` + `setMobileTool('connect')`
- `src/components/editor/MobileEditorLayout.tsx` -- Connect button already calls `setMobileTool('connect')`
- `src/components/mobile/MobileConnectionTypePicker.tsx` -- Bottom sheet type picker, already functional
- `src/app/globals.css` -- Touch handle CSS with `@media (pointer: coarse)` rules
- `src/stores/graph-store.ts` -- `addEdge` action with immer+temporal middleware

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zero new dependencies; all tools exist in codebase
- Architecture: HIGH - State machine pattern verified against existing ui-store wiring; Canvas connection flow reusable
- Pitfalls: HIGH - All pitfalls derive from observed codebase patterns and verified React Flow behavior
- Handle sizing: MEDIUM - CSS approach verified in docs/examples; exact px values need real-device testing

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable -- no fast-moving dependencies)
