/**
 * @fileoverview Viewport coordinate transformation utilities for Three.js applications.
 *
 * This module provides essential coordinate system conversion functions that bridge
 * DOM pointer events with Three.js WebGL rendering contexts. It handles the complex
 * transformation between different coordinate systems:
 *
 * - **DOM Coordinates**: Canvas pixel coordinates (offsetX, offsetY)
 * - **WebGL Normalized Device Coordinates (NDC)**: Three.js standard range (-1 to 1)
 * - **Viewport Rectangles**: Canvas regions for multi-viewport applications
 *
 * **Key Features:**
 * - Multi-viewport support compatible with WebGLRenderer.setViewport()
 * - Accurate coordinate conversion accounting for canvas sizing and devicePixelRatio
 * - Boundary checking for pointer containment within specified viewport regions
 * - Performance-optimized coordinate transformation functions
 *
 * **Coordinate System Overview:**
 * ```
 * DOM Canvas (pixels):     WebGL NDC (normalized):
 * (0,0)────────→ +X       (-1,+1)────────→ +X
 *   │                        │
 *   │                        │
 *   ↓ +Y                     ↓ -Y
 *                           (-1,-1)
 * ```
 *
 * **Multi-Viewport Applications:**
 * This module supports applications using WebGLRenderer.setViewport() to render
 * multiple scenes or cameras to different canvas regions. The viewport parameter
 * (Vector4: x, y, width, height) defines the rendering region, and functions
 * automatically handle coordinate transformations relative to that region.
 *
 * **Integration with MouseEventManager:**
 * These utilities are primarily used by MouseEventManager for pointer event
 * processing, raycasting coordinate conversion, and viewport boundary validation.
 *
 * @see {@link MouseEventManager} - Primary consumer of these utilities
 * @see {@link convertToMousePosition} - Main coordinate conversion function
 * @see {@link isContain} - Viewport boundary validation
 * @see {@link convertToRectangle} - Viewport to rectangle conversion
 */

import { Vector2, type Vector4 } from "three";

/**
 * Represents a rectangular region in canvas pixel coordinates.
 *
 * @description
 * Defines a rectangle using explicit corner coordinates rather than position/size.
 * This format is optimized for boundary checking and coordinate conversion operations,
 * following standard canvas conventions with top-left origin.
 *
 * **Coordinate System:**
 * ```
 * (x1,y1)────────────→ x2
 *   │                  │
 *   │    Rectangle     │
 *   │                  │
 *   ↓                  │
 *   y2─────────────────┘
 * ```
 *
 * Typically created by convertToRectangle() and consumed by boundary checking functions.
 *
 * @example
 * ```typescript
 * // Rectangle representing a 100x50 region starting at (10, 20)
 * const rect: Rectangle = {
 *   x1: 10,   // Left edge
 *   x2: 110,  // Right edge (x1 + width)
 *   y1: 20,   // Top edge
 *   y2: 70    // Bottom edge (y1 + height)
 * };
 * ```
 *
 * @see {@link convertToRectangle} - Primary creation method
 * @see {@link isContain} - Primary usage for boundary checking
 *
 * @interface
 */
interface Rectangle {
  /** Left edge X coordinate in canvas pixels */
  x1: number;
  /** Right edge X coordinate in canvas pixels */
  x2: number;
  /** Top edge Y coordinate in canvas pixels */
  y1: number;
  /** Bottom edge Y coordinate in canvas pixels */
  y2: number;
}

/**
 * Retrieves the effective display height of an HTML canvas element.
 *
 * @param canvas - The HTML canvas element to measure
 * @returns The canvas display height in CSS pixels
 *
 * @description
 * Returns the canvas element's client height for accurate coordinate conversion.
 * Uses clientHeight instead of canvas.height to ensure coordinate conversion
 * remains accurate regardless of devicePixelRatio and browser zoom level.
 *
 * @see {@link getCanvasWidth} - Companion function for width measurement
 *
 * @private
 */
function getCanvasHeight(canvas: HTMLCanvasElement): number {
  return canvas.clientHeight;
}

/**
 * Retrieves the effective display width of an HTML canvas element.
 *
 * @param canvas - The HTML canvas element to measure
 * @returns The canvas display width in CSS pixels
 *
 * @description
 * Returns the canvas element's client width for accurate coordinate conversion.
 * Uses clientWidth instead of canvas.width to ensure coordinate conversion
 * remains accurate regardless of devicePixelRatio and browser zoom level.
 *
 * @see {@link getCanvasHeight} - Companion function for height measurement
 *
 * @private
 */
function getCanvasWidth(canvas: HTMLCanvasElement): number {
  return canvas.clientWidth;
}

/**
 * Converts a Three.js viewport definition to a Rectangle in canvas pixel coordinates.
 *
 * @param canvas - The HTML canvas element that defines the coordinate space
 * @param viewport - Three.js viewport definition (Vector4: x, y, width, height)
 * @returns Rectangle with corner coordinates in canvas pixel space
 *
 * @description
 * Transforms a Three.js viewport specification (used with WebGLRenderer.setViewport())
 * into a Rectangle structure optimized for boundary checking and coordinate operations.
 * The conversion handles the coordinate system transformation between Three.js viewport
 * space and standard DOM canvas coordinates.
 *
 * **Coordinate System Transformation:**
 * Three.js viewports use a bottom-left origin coordinate system, while DOM canvas
 * uses top-left origin. This function performs the necessary Y-axis flip:
 *
 * ```
 * Three.js Viewport (bottom-left origin):   Canvas Coordinates (top-left origin):
 * ┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
 * │                                     │   │  (x1,y1)                            │
 * │                                     │   │    ┌──────────┐                     │
 * │           ┌──────────┐              │   │    │ Rectangle│                     │
 * │           │ Viewport │              │   │    └──────────┘                     │
 * │           └──────────┘              │   │              (x2,y2)                │
 * │    (x,y)                            │   │                                     │
 * └─────────────────────────────────────┘   └─────────────────────────────────────┘
 * ```
 *
 * **Conversion Process:**
 * 1. Extract viewport dimensions (x, y, width, height) from Vector4
 * 2. Calculate canvas height using getCanvasHeight() for accurate measurement
 * 3. Convert bottom-left coordinates to top-left coordinates using Y-axis flip
 * 4. Generate explicit corner coordinates (x1, x2, y1, y2) for efficient boundary testing
 *
 * **Multi-Viewport Applications:**
 * This function is essential for applications using WebGLRenderer.setViewport() to
 * render multiple scenes or cameras to different canvas regions. It enables accurate
 * pointer event processing within specific viewport boundaries.
 *
 * @example
 * ```typescript
 * // Convert viewport to rectangle
 * const viewport = new Vector4(100, 50, 200, 150);
 * const rect = convertToRectangle(canvas, viewport);
 * // Result: { x1: 100, x2: 300, y1: canvasHeight-200, y2: canvasHeight-50 }
 * ```
 *
 * @remarks
 * Handles Y-coordinate conversion between Three.js and DOM coordinate systems.
 * Essential for multi-viewport applications and pointer event boundary validation.
 *
 * @see {@link Rectangle} - Output structure definition
 * @see {@link isContain} - Primary consumer for boundary checking
 * @see {@link getCanvasHeight} - Canvas measurement utility
 * @see {@link MouseEventManager} - Integration context for interaction handling
 *
 * @public
 */
export function convertToRectangle(
  canvas: HTMLCanvasElement,
  viewport: Vector4,
): Rectangle {
  const height = getCanvasHeight(canvas);
  return {
    x1: viewport.x,
    x2: viewport.x + viewport.width,
    y1: height - (viewport.y + viewport.height),
    y2: height - viewport.y,
  };
}

/**
 * Determines whether a pointer event occurs within the boundaries of a specified viewport.
 *
 * @param canvas - The HTML canvas element that defines the coordinate space
 * @param viewport - Optional viewport definition (Vector4: x, y, width, height). If undefined, always returns true
 * @param event - The pointer event to test for containment
 * @returns True if the pointer is within the viewport boundaries, false otherwise
 *
 * @description
 * Performs boundary checking to determine if a pointer event (mouse, touch, pen)
 * occurs within the specified viewport region. This function is essential for
 * multi-viewport applications where different canvas regions handle different
 * interactions or render different content.
 *
 * **Boundary Logic:**
 * The function uses inclusive boundary checking (≤ and ≥) to ensure that pointer
 * events exactly on viewport edges are considered within bounds. This prevents
 * edge cases where interactions at viewport boundaries might be incorrectly rejected.
 *
 * **Viewport Handling:**
 * - `viewport === undefined`: Always returns `true` (entire canvas is interactive)
 * - `viewport === null`: Always returns `true` (entire canvas is interactive)
 * - Valid viewport: Performs precise boundary checking against converted rectangle
 *
 * **Coordinate Systems:**
 * The function automatically handles coordinate system differences between Three.js
 * viewports (bottom-left origin) and DOM pointer events (top-left origin) by using
 * convertToRectangle() for accurate boundary conversion.
 *
 * @example
 * ```typescript
 * // Basic viewport containment check
 * const viewport = new Vector4(100, 50, 200, 150);
 * const isInViewport = isContain(canvas, viewport, event);
 *
 * // Full-canvas applications (no viewport restrictions)
 * const isInCanvas = isContain(canvas, undefined, event); // Always true
 * ```
 *
 * @remarks
 * Used extensively by MouseEventManager for viewport boundary validation.
 * Boundary checking is inclusive and optimized with early returns for undefined viewports.
 *
 * @see {@link convertToRectangle} - Viewport to rectangle conversion utility
 * @see {@link MouseEventManager} - Primary consumer for interaction boundary validation
 * @see {@link Rectangle} - Boundary structure used internally
 *
 * @public
 */
export function isContain(
  canvas: HTMLCanvasElement,
  viewport: Vector4 | undefined,
  event: PointerEvent,
): boolean {
  if (viewport == null) {
    return true;
  }
  const rect = convertToRectangle(canvas, viewport);

  return (
    event.offsetX >= rect.x1 &&
    event.offsetX <= rect.x2 &&
    event.offsetY >= rect.y1 &&
    event.offsetY <= rect.y2
  );
}

/**
 * Converts DOM pointer event coordinates to Three.js normalized device coordinates (NDC).
 *
 * @param canvas - The HTML canvas element that defines the coordinate space
 * @param event - The pointer event containing screen coordinates (offsetX, offsetY)
 * @param viewport - Optional viewport definition for multi-viewport applications
 * @param mouse - Optional Vector2 to reuse for the result (prevents object allocation)
 * @returns Vector2 containing normalized device coordinates (x: -1 to 1, y: -1 to 1)
 *
 * @description
 * Transforms DOM pointer event coordinates into Three.js normalized device coordinates,
 * which are required for raycasting and 3D object intersection detection. This function
 * is the core coordinate conversion utility that bridges pointer interactions with
 * Three.js 3D scene queries.
 *
 * **Conversion Process:**
 * Converts DOM pixel coordinates to Three.js normalized device coordinates (NDC).
 * Supports both full-canvas and viewport-specific coordinate systems.
 *
 * **Performance Optimization:**
 * The optional `mouse` parameter allows reusing Vector2 instances to prevent
 * object allocation during high-frequency pointer events.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const ndcCoords = convertToMousePosition(canvas, event, undefined);
 *
 * // With viewport
 * const viewport = new Vector4(100, 50, 400, 300);
 * const ndcCoords = convertToMousePosition(canvas, event, viewport);
 *
 * // Performance-optimized with vector reuse
 * const reusableVector = new Vector2();
 * convertToMousePosition(canvas, event, viewport, reusableVector);
 * ```
 *
 * @remarks
 * Essential for Three.js raycasting operations. Used extensively by MouseEventManager
 * for interactive object detection in both full-canvas and multi-viewport applications.
 *
 * @see {@link getWebGLCoordinates} - Internal coordinate calculation implementation
 * @see {@link getCanvasWebGLCoordinates} - Canvas-wide coordinate conversion
 * @see {@link getViewportWebGLCoordinates} - Viewport-specific coordinate conversion
 * @see {@link MouseEventManager} - Primary consumer for raycasting integration
 *
 * @public
 */
export function convertToMousePosition(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: Vector4 | undefined,
  mouse?: Vector2,
): Vector2 {
  const { x, y } = getWebGLCoordinates(canvas, event, viewport);

  if (mouse) {
    mouse.set(x, y);
    return mouse;
  }
  return new Vector2(x, y);
}

/**
 * Routes coordinate conversion to the appropriate handler based on viewport presence.
 *
 * @param canvas - The HTML canvas element that defines the coordinate space
 * @param event - The pointer event containing screen coordinates
 * @param viewport - Optional viewport definition for region-specific conversion
 * @returns Object containing WebGL normalized device coordinates (x: -1 to 1, y: -1 to 1)
 *
 * @description
 * Acts as a dispatcher that routes coordinate conversion to either canvas-wide
 * or viewport-specific conversion functions based on whether a viewport is provided.
 * This function centralizes the decision logic for WebGL coordinate conversion strategy.
 *
 * **Routing Logic:**
 * - `viewport` provided: Delegates to getViewportWebGLCoordinates() for region-specific conversion
 * - `viewport` undefined: Delegates to getCanvasWebGLCoordinates() for full-canvas conversion
 *
 * **Return Value:**
 * The returned coordinates are in WebGL normalized device coordinate (NDC) space,
 * where (-1, -1) represents the bottom-left corner and (1, 1) represents the top-right
 * corner of the rendering area.
 *
 * @see {@link getCanvasWebGLCoordinates} - Full-canvas coordinate conversion
 * @see {@link getViewportWebGLCoordinates} - Viewport-specific coordinate conversion
 * @see {@link convertToMousePosition} - Public wrapper function
 *
 * @private
 */
function getWebGLCoordinates(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport?: Vector4,
): { x: number; y: number } {
  if (viewport) {
    return getViewportWebGLCoordinates(canvas, event, viewport);
  }
  return getCanvasWebGLCoordinates(canvas, event);
}

/**
 * Converts pointer coordinates to WebGL normalized device coordinates for full-canvas applications.
 *
 * @param canvas - The HTML canvas element that defines the coordinate space
 * @param event - The pointer event containing screen coordinates (offsetX, offsetY)
 * @returns Object containing WebGL normalized device coordinates (x: -1 to 1, y: -1 to 1)
 *
 * @description
 * Performs coordinate conversion using the formula:
 * `x = (offsetX / canvasWidth) * 2 - 1` and `y = -(offsetY / canvasHeight) * 2 + 1`
 *
 * @see {@link getViewportWebGLCoordinates} - Viewport-specific conversion alternative
 *
 * @private
 */
function getCanvasWebGLCoordinates(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): { x: number; y: number } {
  const x = (event.offsetX / getCanvasWidth(canvas)) * 2 - 1;
  const y = -(event.offsetY / getCanvasHeight(canvas)) * 2 + 1;
  return { x, y };
}

/**
 * Converts pointer coordinates to WebGL normalized device coordinates for viewport-specific applications.
 *
 * @param canvas - The HTML canvas element that defines the coordinate space
 * @param event - The pointer event containing screen coordinates (offsetX, offsetY)
 * @param viewport - The viewport definition (Vector4: x, y, width, height)
 * @returns Object containing WebGL normalized device coordinates (x: -1 to 1, y: -1 to 1)
 *
 * @description
 * Converts viewport rectangle, offsets pointer coordinates relative to viewport origin,
 * then normalizes to WebGL NDC range with Y-axis inversion. Essential for
 * multi-viewport applications using WebGLRenderer.setViewport().
 *
 * @see {@link convertToRectangle} - Viewport to rectangle conversion
 * @see {@link getCanvasWebGLCoordinates} - Full-canvas conversion alternative
 *
 * @private
 */
function getViewportWebGLCoordinates(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: Vector4,
): { x: number; y: number } {
  const rect = convertToRectangle(canvas, viewport);

  const mouseX = event.offsetX - rect.x1;
  const mouseY = event.offsetY - rect.y1;
  const width = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;

  const x = (mouseX / width) * 2 - 1;
  const y = -(mouseY / height) * 2 + 1;
  return { x, y };
}
