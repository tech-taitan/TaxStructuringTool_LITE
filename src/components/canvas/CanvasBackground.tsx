'use client';

/**
 * Layered grid background for the canvas.
 *
 * Two stacked Background components create the Lucidchart-style grid:
 * 1. Fine grid: subtle thin lines at GRID_SIZE intervals
 * 2. Major grid: slightly thicker/darker lines at GRID_SIZE * MAJOR_GRID_MULTIPLIER intervals
 */

import { Background, BackgroundVariant } from '@xyflow/react';
import {
  GRID_SIZE,
  MAJOR_GRID_MULTIPLIER,
  COLORS,
} from '@/lib/constants';

export default function CanvasBackground() {
  return (
    <>
      {/* Fine grid lines */}
      <Background
        id="fine-grid"
        variant={BackgroundVariant.Lines}
        gap={GRID_SIZE}
        color={COLORS.grid.fine}
        lineWidth={COLORS.grid.fineWidth}
      />
      {/* Major grid lines every 5th interval */}
      <Background
        id="major-grid"
        variant={BackgroundVariant.Lines}
        gap={GRID_SIZE * MAJOR_GRID_MULTIPLIER}
        color={COLORS.grid.major}
        lineWidth={COLORS.grid.majorWidth}
      />
    </>
  );
}
