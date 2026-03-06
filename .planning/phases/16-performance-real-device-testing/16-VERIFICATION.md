---
phase: 16-performance-real-device-testing
verified: 2026-03-06T08:02:27Z
status: human_needed
score: 4/4 must-haves verified
human_verification:
  - test: "Pan and zoom the canvas with 20+ entities on a real mid-range Android device or iPhone"
    expected: "Smooth scrolling and zoom without perceptible frame drops; Chrome DevTools Performance panel shows frame times consistently under 16.7ms"
    why_human: "60fps performance on real hardware cannot be verified by static code inspection; viewport culling and transition suppression are present in code but actual frame rate depends on device GPU, OS, and browser rendering pipeline"
  - test: "On iPhone with notch (or Chrome DevTools emulating iPhone 14 Pro), load the editor and verify the bottom toolbar position"
    expected: "Toolbar sits visibly above the home indicator line, not overlapping or clipped behind it"
    why_human: "CSS env(safe-area-inset-bottom) only resolves to a non-zero value on actual notch/home-indicator devices or DevTools emulation with viewport-fit=cover; code contains the correct CSS but actual inset values are runtime-only"
  - test: "Open MobilePalette (tap + button) on iPhone with home indicator; scroll to the bottom of the entity list"
    expected: "Bottom of the entity list has visible padding above the home indicator; content is not clipped"
    why_human: "The safe-area-bottom class is correctly applied to the content wrapper; actual rendering depends on env(safe-area-inset-bottom) resolving on the device"
  - test: "Open BottomSheet at full snap on iPhone with home indicator"
    expected: "Bottom of the scrollable content area has padding above the home indicator; last list item is not obscured"
    why_human: "env(safe-area-inset-bottom) is runtime-only and requires physical device or correct emulation to observe"
  - test: "Drag an entity node; verify hover shadow returns after drag ends"
    expected: "During drag: no transition flash on other nodes. After drag ends: hovering a node shows smooth box-shadow animation"
    why_human: "The is-dragging class toggle is wired correctly in code; verifying post-drag hover behavior requires visual inspection on device"
  - test: "With 20+ entities, zoom out so several nodes are off-screen; verify edges between on-screen and off-screen nodes still render"
    expected: "Edges connecting visible and off-screen nodes continue to render -- no disappearing edges"
    why_human: "onlyRenderVisibleElements=true is enabled; React Flow issue #4516 documents potential edge rendering bugs with explicit node width/height, which this codebase uses. Whether this manifests in @xyflow/react 12.10.0 requires visual testing"
  - test: "Test on iOS Safari on an iPhone"
    expected: "All interactions work correctly; spring animations are smooth; safe-area insets appear correct"
    why_human: "WebKit on iOS Safari has different touch event handling and CSS env() support than Chrome; code correctness does not guarantee cross-browser behavior"
  - test: "Test on Android Chrome on a mid-range device (e.g., Pixel 6a)"
    expected: "Canvas pans and zooms smoothly with 20+ entities; no jank during drag; toolbar correctly positioned"
    why_human: "Performance on mid-range Android depends on device GPU and Chrome rendering engine; code optimizations are present but actual frame rate is hardware-dependent"
---

# Phase 16: Performance and Real-Device Testing Verification Report

**Phase Goal:** The mobile experience performs smoothly on real mid-range hardware -- 20+ entity structures render without jank, transitions are suppressed during drag, safe area insets are correct on notch devices, and the full feature set is validated on iOS Safari, Android Chrome, and iPad Safari.
**Verified:** 2026-03-06T08:02:27Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can pan, zoom, and drag entities on mobile with 20+ nodes without perceptible jank | ? NEEDS HUMAN | onlyRenderVisibleElements={true} at Canvas.tsx:606; .is-dragging .entity-node { transition: none !important } at globals.css:245-253; isDragging state toggled at Canvas.tsx:252-264; solid bg-white on MobileEditorLayout toolbar at line 94 (no backdrop-blur); CanvasLegend uses isMobile ternary for backdrop-blur at CanvasLegend.tsx:148. All code optimizations verified. Actual 60fps on real hardware requires device testing. |
| 2 | User on a notch/home-indicator device sees the bottom toolbar above the home indicator | ? NEEDS HUMAN | inline style bottom: max(16px, calc(env(safe-area-inset-bottom, 0px) + 8px)) at MobileEditorLayout.tsx:96; bottom-4 Tailwind class correctly absent; viewportFit: cover confirmed at src/app/layout.tsx:20. CSS correct. Runtime requires device. |
| 3 | User on a notch/home-indicator device sees MobilePalette content above the home indicator | ? NEEDS HUMAN | className safe-area-bottom at MobilePalette.tsx:99 (dead pb-safe replaced); .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0px) } at globals.css:424-426. Zero remaining pb-safe references in src/. CSS correct. Runtime requires device. |
| 4 | User on a notch/home-indicator device sees BottomSheet content above the home indicator at full snap | ? NEEDS HUMAN | overflow-y-auto safe-area-bottom at BottomSheet.tsx:279; utility defined at globals.css:424. CSS correct. Runtime requires device. |

**Score:** 4/4 truths -- all code implementations verified; all require human device testing to confirm runtime behavior

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/canvas/Canvas.tsx` | Viewport culling and drag class toggle | VERIFIED | onlyRenderVisibleElements={true} at line 606; isDragging state at line 252; setIsDragging(true) in onNodeDragStart line 257; setIsDragging(false) in onNodeDragStop line 264; is-dragging class on wrapper div at line 558 |
| `src/app/globals.css` (drag suppression) | Drag transition suppression | VERIFIED | .is-dragging .entity-node { transition: none !important } at lines 245-247; filter suppression for clip-path shapes at lines 248-253 |
| `src/app/globals.css` (safe-area utilities) | Safe-area-inset utility classes | VERIFIED | .safe-area-bottom at lines 424-426 with env(safe-area-inset-bottom, 0px); .safe-area-top at lines 428-430 with env(safe-area-inset-top, 0px) |
| `src/components/editor/MobileEditorLayout.tsx` | Safe-area bottom toolbar, no backdrop-blur | VERIFIED | Toolbar className is bg-white dark:bg-gray-800 at line 94 (no backdrop-blur-sm); inline style max() formula with env(safe-area-inset-bottom, 0px) at line 96 |
| `src/components/mobile/MobilePalette.tsx` | Working safe-area class replacing dead pb-safe | VERIFIED | className safe-area-bottom at line 99; confirmed zero pb-safe references remain in src/ |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| Canvas.tsx | globals.css | is-dragging class toggled on drag start/stop | WIRED | isDragging set true at line 257, false at line 264; wrapper div at line 558 appends is-dragging when true; CSS rule at globals.css:245 targets .is-dragging .entity-node |
| MobileEditorLayout.tsx | globals.css | env(safe-area-inset-bottom) in toolbar inline style | WIRED | Toolbar uses inline style max() formula at line 96; correct approach -- CSS class for bottom position would conflict with absolute positioning |
| MobilePalette.tsx | globals.css | safe-area-bottom class on content wrapper | WIRED | safe-area-bottom at MobilePalette.tsx:99 maps to utility class at globals.css:424 |
| BottomSheet.tsx | globals.css | safe-area-bottom class on content scroll area | WIRED | safe-area-bottom at BottomSheet.tsx:279 maps to utility class at globals.css:424 |
| CanvasLegend.tsx | useDeviceCapabilities hook | isMobile used to conditionally apply backdrop-blur | WIRED | useDeviceCapabilities imported at line 16; isMobile destructured at line 106; ternary at line 148 applies solid bg on mobile, backdrop-blur-sm on desktop |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|---------------|
| MPOL-04: Smooth 20+ entity performance on mobile | NEEDS HUMAN | Code optimizations all in place; actual frame rate requires device validation |
| MPOL-05: Correct safe-area insets on notch devices | NEEDS HUMAN | CSS implementation correct; actual inset values are runtime-only on notch hardware |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | -- | -- | -- | -- |

No anti-patterns detected across all six modified files. No TODO/FIXME/PLACEHOLDER comments. No stub implementations. No dead class references (pb-safe fully removed from all files in src/).

### Human Verification Required

#### 1. Pan/Zoom Performance with 20+ Entities

**Test:** Load or create a structure with 20+ entities on a mid-range Android device (Pixel 6a or similar) or iPhone. Pan by swiping, pinch-to-zoom, and drag a node.
**Expected:** Smooth interaction without frame drops; Chrome DevTools Performance panel shows frame times under 16.7ms during pan/zoom/drag.
**Why human:** Performance on real hardware cannot be verified from code. All optimizations (viewport culling via onlyRenderVisibleElements, transition suppression via is-dragging class, backdrop-blur removal) are correctly implemented but their combined effect on actual GPU/CPU load requires device testing.

#### 2. Drag Transition Suppression Visual Confirmation

**Test:** On any device with 20+ entities, drag one node while observing other nodes.
**Expected:** No hover shadow or filter animation flicker on non-dragged nodes during drag. After releasing the node, hover over it to confirm the hover shadow transition still animates normally.
**Why human:** The is-dragging class toggle is wired correctly in code. The pre- and post-drag CSS behavior requires visual confirmation.

#### 3. Bottom Toolbar Safe-Area -- iPhone with Home Indicator

**Test:** On an iPhone (notch model, e.g., iPhone X or later) or Chrome DevTools with iPhone 14 Pro emulation, open the editor.
**Expected:** The floating bottom toolbar is visibly positioned above the home indicator swipe area with at least 8px of clearance.
**Why human:** env(safe-area-inset-bottom) only resolves to a non-zero value on a device with a home indicator. The max(16px, calc(env(safe-area-inset-bottom) + 8px)) inline style is correct but the non-zero inset is runtime-only.

#### 4. MobilePalette Safe-Area -- Bottom Content Visibility

**Test:** On an iPhone with home indicator, tap the + button to open the MobilePalette. Scroll to the bottom of the entity list.
**Expected:** The last entity item is not obscured by the home indicator. Visible padding below the last item.
**Why human:** safe-area-bottom class correctly applies padding-bottom: env(safe-area-inset-bottom). Requires notch device to observe non-zero padding.

#### 5. BottomSheet Safe-Area -- Full Snap Content

**Test:** On an iPhone with home indicator, open any BottomSheet and drag it to full snap.
**Expected:** The scrollable content area has visible padding at the bottom; the last item is not hidden behind the home indicator.
**Why human:** safe-area-bottom class on BottomSheet.tsx:279 requires device testing to confirm non-zero inset renders correctly.

#### 6. onlyRenderVisibleElements Edge Rendering Regression

**Test:** Create 20+ entities, then zoom out so some nodes are fully off-screen. Verify edges between visible and off-screen nodes.
**Expected:** Edges connecting on-screen nodes to off-screen nodes continue to render. No edges disappear when a connected node scrolls off-screen.
**Why human:** React Flow issue #4516 documents that onlyRenderVisibleElements=true can cause edges to not render when connected nodes have explicit width/height set. This codebase uses explicit NODE_WIDTH/NODE_HEIGHT. Whether this manifests in @xyflow/react 12.10.0 requires visual testing. If edges disappear, onlyRenderVisibleElements must be reverted.

#### 7. iOS Safari Cross-Browser Validation

**Test:** Open the editor in Safari on an iPhone. Test: tap entities, drag, pinch-zoom, open BottomSheet, open MobilePalette, use connect mode.
**Expected:** All interactions work identically to Chrome. Spring animations are smooth. Safe-area insets appear correct.
**Why human:** WebKit on iOS Safari has subtle differences in touch event handling, CSS rendering, and env() support compared to Chrome. Code correctness does not guarantee cross-browser behavior.

#### 8. Android Chrome Mid-Range Device

**Test:** Open the editor in Chrome on a mid-range Android phone (e.g., Pixel 6a). Pan, zoom, drag with 20+ entities.
**Expected:** Smooth 60fps interaction; toolbar correctly positioned; no visual regressions.
**Why human:** Frame rate on mid-range Android GPUs is hardware-dependent.

### Gaps Summary

No code gaps found. All code-verifiable must-haves are fully implemented and wired:

- onlyRenderVisibleElements={true} is present and active on the ReactFlow component (Canvas.tsx:606)
- isDragging state is properly wired: set true in onNodeDragStart (line 257), cleared in onNodeDragStop (line 264), applied as CSS class on canvas wrapper (line 558)
- .is-dragging CSS rules exist and target the correct selectors (globals.css:244-253)
- backdrop-blur-sm is absent from MobileEditorLayout.tsx toolbar (solid bg-white at line 94)
- CanvasLegend conditionally applies backdrop-blur via isMobile check from useDeviceCapabilities (CanvasLegend.tsx:148)
- .safe-area-bottom and .safe-area-top utility classes are defined in globals.css (lines 424-430)
- MobileEditorLayout toolbar uses the correct max() formula with env(safe-area-inset-bottom) (line 96)
- pb-safe (dead class) has been completely replaced -- zero occurrences remain in src/
- BottomSheet content area has safe-area-bottom class (BottomSheet.tsx:279)
- viewportFit: cover is confirmed present in src/app/layout.tsx -- prerequisite for env() to work

The phase is code-complete. All 8 human verification items are about runtime behavior on real or emulated devices, not code correctness. Commits 7363bdb (Task 1) and 45ab11d (Task 2) are confirmed in git history with correct file modifications.

---

_Verified: 2026-03-06T08:02:27Z_
_Verifier: Claude (gsd-verifier)_
