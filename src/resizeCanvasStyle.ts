/**
 * @fileoverview Canvas styling utility for responsive container-based layout with aspect ratio preservation.
 *
 * This module provides functionality to fit Three.js canvas elements within parent
 * containers while maintaining aspect ratios, commonly used for responsive web applications.
 */

/**
 * Fits a canvas element within its parent container while preserving aspect ratio.
 *
 * @description
 * Automatically adjusts canvas CSS styling to fit within the specified container
 * while maintaining original aspect ratio through letterboxing or pillarboxing.
 * Canvas pixel dimensions and rendering performance remain unchanged.
 *
 * @param container - Parent HTML element that defines available space for the canvas
 * @param canvas - Three.js canvas element to fit within the container
 * @param canvasWidth - Original canvas width for aspect ratio calculation
 * @param canvasHeight - Original canvas height for aspect ratio calculation
 *
 * @example
 * ```typescript
 * const container = document.getElementById('canvas-container') as HTMLElement;
 * const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
 *
 * // Fit canvas within container maintaining 16:9 aspect ratio
 * resizeCanvasStyle(container, canvas, 1920, 1080);
 *
 * // Handle window resize events
 * window.addEventListener('resize', () => {
 *   resizeCanvasStyle(container, canvas, 1920, 1080);
 * });
 *
 * // Use different containers for different layouts
 * const sidebar = document.querySelector('.sidebar') as HTMLElement;
 * resizeCanvasStyle(sidebar, canvas, 800, 600);
 * ```
 *
 * @remarks
 * **Performance Considerations:**
 * - Changes only CSS display size, never canvas pixel dimensions
 * - Canvas pixel count remains constant, rendering workload unchanged
 * - For high-DPI displays or quality issues, adjust canvas resolution separately
 *
 * **Layout Behavior:**
 * - Adapts to container dimensions using `clientWidth` and `clientHeight`
 * - Uses CSS `width` and `height` properties for styling
 * - Maintains aspect ratio through proportional scaling
 * - Works with any HTML element as container
 *
 * @public
 */
export function resizeCanvasStyle(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const aspectRatio = canvasWidth / canvasHeight;

  if (containerWidth / containerHeight > aspectRatio) {
    canvas.style.width = `${containerHeight * aspectRatio}px`;
    canvas.style.height = `${containerHeight}px`;
  } else {
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerWidth / aspectRatio}px`;
  }
}
