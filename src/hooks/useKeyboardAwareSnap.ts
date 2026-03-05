/**
 * Hook for detecting iOS virtual keyboard via visualViewport resize events
 * and driving bottom sheet snap point changes.
 *
 * When the virtual keyboard appears (viewport height decreases by > 100px),
 * snaps the sheet to full. When keyboard dismisses, snaps back to half.
 *
 * Guards with `window.visualViewport` check for SSR/non-Safari safety.
 */

import { useRef, useEffect } from 'react';
import type { BottomSheetRef } from '@/components/mobile/BottomSheet';

/** Minimum viewport height reduction (px) to count as keyboard open */
const KEYBOARD_THRESHOLD = 100;

export function useKeyboardAwareSnap(
  isOpen: boolean,
  sheetRef: React.RefObject<BottomSheetRef | null>,
) {
  const isKeyboardOpenRef = useRef(false);
  const initialHeightRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      isKeyboardOpenRef.current = false;
      return;
    }

    if (!window.visualViewport) return;

    const vv = window.visualViewport;
    initialHeightRef.current = vv.height;

    const handleResize = () => {
      const heightDiff = initialHeightRef.current - vv.height;
      const keyboardNowVisible = heightDiff > KEYBOARD_THRESHOLD;

      if (keyboardNowVisible && !isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = true;
        sheetRef.current?.snapTo('full');
      } else if (!keyboardNowVisible && isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = false;
        sheetRef.current?.snapTo('half');
      }
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, [isOpen, sheetRef]);
}
