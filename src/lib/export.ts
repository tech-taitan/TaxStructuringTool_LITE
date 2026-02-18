/**
 * Canvas diagram export to PNG and SVG using html-to-image.
 *
 * Reuses the same viewport capture approach as thumbnail.ts but
 * at full resolution with auto-fit bounds for the complete diagram.
 */

import { toPng, toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { TaxNode } from '@/models/graph';

const PADDING = 40;

/**
 * Capture the React Flow viewport at full resolution, framed around all nodes.
 *
 * @param format - 'png' or 'svg'
 * @param nodes - Current graph nodes (for bounds calculation)
 * @param filename - Download filename (including extension)
 */
async function exportCanvas(
  format: 'png' | 'svg',
  nodes: TaxNode[],
  filename: string
): Promise<void> {
  const viewport = document.querySelector(
    '.react-flow__viewport'
  ) as HTMLElement | null;

  if (!viewport || nodes.length === 0) return;

  const bounds = getNodesBounds(nodes);
  const width = bounds.width + PADDING * 2;
  const height = bounds.height + PADDING * 2;

  const transform = getViewportForBounds(bounds, width, height, 0.5, 2, PADDING);

  const options = {
    backgroundColor: '#ffffff',
    width,
    height,
    style: {
      width: String(width),
      height: String(height),
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  };

  const dataUrl =
    format === 'png' ? await toPng(viewport, options) : await toSvg(viewport, options);

  // Trigger browser download
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Export the canvas diagram as a PNG image.
 * @param nodes - Current graph nodes
 * @param filename - Download filename (e.g. "structure.png")
 */
export async function exportCanvasPng(
  nodes: TaxNode[],
  filename: string
): Promise<void> {
  await exportCanvas('png', nodes, filename);
}

/**
 * Export the canvas diagram as an SVG image.
 * @param nodes - Current graph nodes
 * @param filename - Download filename (e.g. "structure.svg")
 */
export async function exportCanvasSvg(
  nodes: TaxNode[],
  filename: string
): Promise<void> {
  await exportCanvas('svg', nodes, filename);
}

/**
 * Export the canvas diagram as a PDF document.
 * Captures as PNG then embeds into a fitted PDF page via jspdf.
 * @param nodes - Current graph nodes
 * @param filename - Download filename (e.g. "structure.pdf")
 */
export async function exportCanvasPdf(
  nodes: TaxNode[],
  filename: string
): Promise<void> {
  const viewport = document.querySelector(
    '.react-flow__viewport'
  ) as HTMLElement | null;

  if (!viewport || nodes.length === 0) return;

  const bounds = getNodesBounds(nodes);
  const width = bounds.width + PADDING * 2;
  const height = bounds.height + PADDING * 2;

  const transform = getViewportForBounds(bounds, width, height, 0.5, 2, PADDING);

  const dataUrl = await toPng(viewport, {
    backgroundColor: '#ffffff',
    width,
    height,
    style: {
      width: String(width),
      height: String(height),
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  });

  // Dynamically import jspdf to keep bundle size down
  const { default: jsPDF } = await import('jspdf');

  const isLandscape = width > height;
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save(filename);
}
