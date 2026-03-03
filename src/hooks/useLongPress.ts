/**
 * Long-press gesture hook for touch interactions.
 *
 * Returns four touch event handlers (onTouchStart, onTouchMove,
 * onTouchEnd, onTouchCancel) that detect a sustained press of
 * `duration` ms. Moving the finger beyond `moveThreshold` pixels
 * or lifting early cancels the gesture.
 */

import { useRef, useCallback, useEffect } from 'react';
import type React from 'react';

export interface LongPressOptions {
  /** Hold duration in ms before onFinish fires (default: 500) */
  duration?: number;
  /** Max finger movement in px before cancel (default: 10) */
  moveThreshold?: number;
  /** Called immediately on touchstart */
  onStart?: () => void;
  /** Called when the timer fires (long-press complete) */
  onFinish?: () => void;
  /** Called when finger moves beyond threshold or lifts early */
  onCancel?: () => void;
}

export interface LongPressHandlers {
  onTouchStart: React.TouchEventHandler<HTMLElement>;
  onTouchMove: React.TouchEventHandler<HTMLElement>;
  onTouchEnd: React.TouchEventHandler<HTMLElement>;
  onTouchCancel: React.TouchEventHandler<HTMLElement>;
}

export function useLongPress(options: LongPressOptions): LongPressHandlers {
  const {
    duration = 500,
    moveThreshold = 10,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeRef = useRef(false);
  // Keep a ref to the latest options to avoid stale closures in the timer callback
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart: React.TouchEventHandler<HTMLElement> = useCallback(
    (e) => {
      const touch = e.touches[0];
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      activeRef.current = true;
      optionsRef.current.onStart?.();

      clearTimer();
      timerRef.current = setTimeout(() => {
        if (activeRef.current) {
          activeRef.current = false;
          timerRef.current = null;
          optionsRef.current.onFinish?.();
        }
      }, duration);
    },
    [duration, clearTimer],
  );

  const onTouchMove: React.TouchEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (!activeRef.current) return;

      const touch = e.touches[0];
      const dx = touch.clientX - startPosRef.current.x;
      const dy = touch.clientY - startPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > moveThreshold) {
        clearTimer();
        activeRef.current = false;
        optionsRef.current.onCancel?.();
      }
    },
    [moveThreshold, clearTimer],
  );

  const onTouchEnd: React.TouchEventHandler<HTMLElement> = useCallback(() => {
    if (activeRef.current) {
      clearTimer();
      activeRef.current = false;
      optionsRef.current.onCancel?.();
    }
  }, [clearTimer]);

  const onTouchCancel: React.TouchEventHandler<HTMLElement> = useCallback(() => {
    if (activeRef.current) {
      clearTimer();
      activeRef.current = false;
      optionsRef.current.onCancel?.();
    }
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
