/**
 * Bottom sheet component with snap points and spring-animated transitions.
 *
 * Renders via portal in document.body. Uses translateY transforms for
 * GPU-composited positioning. Touch drag on the sheet drives position
 * directly via ref (no React state during drag) for 60fps performance.
 *
 * Snap points:
 *   collapsed = 100% translateY (hidden)
 *   half      =  55% translateY (~45% visible)
 *   full      =   5% translateY (~95% visible)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { animateSpringWithVelocity } from '@/lib/spring';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: ('collapsed' | 'half' | 'full')[];
  initialSnap?: 'half' | 'full';
  children: React.ReactNode;
}

/** Snap point as percentage of viewport height for translateY */
const SNAP_PERCENTS: Record<string, number> = {
  collapsed: 100,
  half: 55,
  full: 5,
};

function percentToPx(percent: number): number {
  return (percent / 100) * window.innerHeight;
}

export function BottomSheet({
  isOpen,
  onClose,
  snapPoints = ['collapsed', 'half', 'full'],
  initialSnap = 'half',
  children,
}: BottomSheetProps) {
  // isRendered stays true during close animation so the portal remains mounted
  const [isRendered, setIsRendered] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const cancelSpringRef = useRef<(() => void) | null>(null);

  // Touch tracking refs (no state to avoid re-renders during drag)
  const touchStartYRef = useRef(0);
  const sheetStartYRef = useRef(0);
  const currentYRef = useRef(percentToPx(SNAP_PERCENTS.collapsed));
  const prevTouchYRef = useRef(0);
  const prevTimestampRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Scrim opacity range
  const SCRIM_MAX_OPACITY = 0.4;

  const updateScrimOpacity = useCallback((translateY: number) => {
    if (!scrimRef.current) return;
    const fullPx = percentToPx(SNAP_PERCENTS.full);
    const collapsedPx = percentToPx(SNAP_PERCENTS.collapsed);
    const range = collapsedPx - fullPx;
    const progress = range > 0 ? 1 - (translateY - fullPx) / range : 0;
    const opacity = Math.max(0, Math.min(SCRIM_MAX_OPACITY, progress * SCRIM_MAX_OPACITY));
    scrimRef.current.style.backgroundColor = `rgba(0,0,0,${opacity})`;
    scrimRef.current.style.pointerEvents = opacity > 0 ? 'auto' : 'none';
  }, []);

  const setSheetPosition = useCallback(
    (y: number) => {
      currentYRef.current = y;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${y}px)`;
      }
      updateScrimOpacity(y);
    },
    [updateScrimOpacity],
  );

  const springTo = useCallback(
    (targetPercent: number, velocity = 0, onDone?: () => void) => {
      // Cancel any running spring
      cancelSpringRef.current?.();

      const targetPx = percentToPx(targetPercent);
      const cancel = animateSpringWithVelocity(
        currentYRef.current,
        targetPx,
        velocity,
        (value) => setSheetPosition(value),
        () => {
          cancelSpringRef.current = null;
          onDone?.();
        },
      );
      cancelSpringRef.current = cancel;
    },
    [setSheetPosition],
  );

  // Open animation
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Set initial position at collapsed before springing in
      // Use a rAF to ensure the portal DOM is mounted first
      requestAnimationFrame(() => {
        setSheetPosition(percentToPx(SNAP_PERCENTS.collapsed));
        springTo(SNAP_PERCENTS[initialSnap]);
      });
    } else if (isRendered) {
      // Close animation: spring to collapsed, then unmount
      springTo(SNAP_PERCENTS.collapsed, 0, () => {
        setIsRendered(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSpringRef.current?.();
    };
  }, []);

  const findNearestSnapPx = useCallback(
    (currentPx: number): number => {
      let nearest = percentToPx(SNAP_PERCENTS.collapsed);
      let minDist = Infinity;
      for (const snap of snapPoints) {
        const px = percentToPx(SNAP_PERCENTS[snap]);
        const dist = Math.abs(currentPx - px);
        if (dist < minDist) {
          minDist = dist;
          nearest = px;
        }
      }
      return nearest;
    },
    [snapPoints],
  );

  const handleDismiss = useCallback(() => {
    springTo(SNAP_PERCENTS.collapsed, 0, () => {
      setIsRendered(false);
      onClose();
    });
  }, [springTo, onClose]);

  // --- Touch handlers ---

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Cancel any running spring
      cancelSpringRef.current?.();
      cancelSpringRef.current = null;

      const touch = e.touches[0];
      touchStartYRef.current = touch.clientY;
      sheetStartYRef.current = currentYRef.current;
      prevTouchYRef.current = touch.clientY;
      prevTimestampRef.current = e.timeStamp;
      velocityRef.current = 0;
      isDraggingRef.current = true;
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartYRef.current;
      const newY = sheetStartYRef.current + deltaY;

      // Clamp: don't let sheet go above full position
      const fullPx = percentToPx(SNAP_PERCENTS.full);
      const clampedY = Math.max(fullPx, newY);

      setSheetPosition(clampedY);

      // Calculate instantaneous velocity (px/ms)
      const dt = e.timeStamp - prevTimestampRef.current;
      if (dt > 0) {
        velocityRef.current = (touch.clientY - prevTouchYRef.current) / dt;
      }
      prevTouchYRef.current = touch.clientY;
      prevTimestampRef.current = e.timeStamp;
    },
    [setSheetPosition],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const currentPx = currentYRef.current;
    const collapsedPx = percentToPx(SNAP_PERCENTS.collapsed);
    // Scale velocity from px/ms to px/frame (~16ms)
    const velocity = velocityRef.current * 16;

    // Dismiss if below collapsed or strong downward swipe past 50% of collapsed
    const isBelowCollapsed = currentPx >= collapsedPx;
    const isStrongDownSwipe = velocity > 5 && currentPx > collapsedPx * 0.5;

    if (isBelowCollapsed || isStrongDownSwipe) {
      handleDismiss();
      return;
    }

    // Spring to nearest snap point
    const targetPx = findNearestSnapPx(currentPx);
    cancelSpringRef.current?.();
    const cancel = animateSpringWithVelocity(
      currentPx,
      targetPx,
      velocity,
      (value) => setSheetPosition(value),
      () => {
        cancelSpringRef.current = null;
      },
    );
    cancelSpringRef.current = cancel;
  }, [findNearestSnapPx, handleDismiss, setSheetPosition]);

  if (!isRendered) return null;

  return createPortal(
    <>
      {/* Scrim backdrop */}
      <div
        ref={scrimRef}
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: 'rgba(0,0,0,0)', pointerEvents: 'none' }}
        onClick={handleDismiss}
      />

      {/* Sheet container */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[61] bg-white dark:bg-gray-900 rounded-t-xl shadow-2xl border-t border-gray-200 dark:border-gray-700"
        style={{
          transform: `translateY(${percentToPx(SNAP_PERCENTS.collapsed)}px)`,
          height: '100dvh',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 48px)' }}>
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
