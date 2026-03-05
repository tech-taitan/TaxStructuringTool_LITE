/**
 * Mobile properties bottom sheet wrapping PropertiesPanel and ConnectionPropertiesPanel.
 *
 * Opens when user double-taps (two-step tap) on a selected entity or connection.
 * Uses keyboard-aware snap to auto-expand to full when virtual keyboard appears
 * and returns to half when keyboard dismisses.
 *
 * Content switches via key={selectedNodeId/selectedEdgeId} to force re-mount
 * when the user taps a different entity while the sheet is open.
 */

import { useRef } from 'react';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import type { BottomSheetRef } from '@/components/mobile/BottomSheet';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import ConnectionPropertiesPanel from '@/components/connections/ConnectionPropertiesPanel';
import { useUIStore } from '@/stores/ui-store';
import { useKeyboardAwareSnap } from '@/hooks/useKeyboardAwareSnap';

export function MobilePropertiesSheet() {
  const isMobilePropertiesOpen = useUIStore((s) => s.isMobilePropertiesOpen);
  const setMobilePropertiesOpen = useUIStore((s) => s.setMobilePropertiesOpen);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const selectedEdgeId = useUIStore((s) => s.selectedEdgeId);

  const sheetRef = useRef<BottomSheetRef>(null);

  useKeyboardAwareSnap(isMobilePropertiesOpen, sheetRef);

  const handleClose = () => {
    setMobilePropertiesOpen(false);
  };

  return (
    <BottomSheet
      isOpen={isMobilePropertiesOpen}
      onClose={handleClose}
      ref={sheetRef}
    >
      {selectedNodeId && (
        <PropertiesPanel
          key={selectedNodeId}
          nodeId={selectedNodeId}
          autoFocus={false}
        />
      )}
      {selectedEdgeId && !selectedNodeId && (
        <ConnectionPropertiesPanel
          key={selectedEdgeId}
          edgeId={selectedEdgeId}
        />
      )}
    </BottomSheet>
  );
}
