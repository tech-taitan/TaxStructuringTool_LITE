/**
 * Device detection hook returning reactive boolean flags for
 * touch, mobile, tablet, and desktop viewports.
 *
 * Built on useMediaQuery so each flag updates independently
 * when the viewport or pointer type changes.
 *
 * Breakpoints match EditorLayout: 767px / 1024px.
 */

import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface DeviceCapabilities {
  /** True when the primary pointer is coarse (touch screen) */
  isTouchDevice: boolean;
  /** True when viewport width <= 767px */
  isMobile: boolean;
  /** True when viewport width is 768px–1024px */
  isTablet: boolean;
  /** True when viewport width >= 1025px */
  isDesktop: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const isTouchDevice = useMediaQuery('(pointer: coarse)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return { isTouchDevice, isMobile, isTablet, isDesktop };
}
