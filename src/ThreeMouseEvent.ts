/**
 * @fileoverview Type definitions for Three.js interactive pointer events.
 *
 * This module defines the core event system used by all interactive objects in the library.
 * It provides type-safe event handling with standardized event types and payloads that work
 * across all interaction handlers (buttons, checkboxes, radio buttons).
 *
 * **Note**: Despite the "Mouse" naming for historical reasons, these events support all
 * pointer input types including mouse, touch, and pen interactions via PointerEvent API.
 *
 * @example
 * ```typescript
 * import { ClickableMesh } from '@masatomakino/threejs-interactive-object';
 * import type { ThreeMouseEvent } from '@masatomakino/threejs-interactive-object';
 *
 * const clickableMesh = new ClickableMesh();
 *
 * // Type-safe event handling for all pointer types (mouse, touch, pen)
 * clickableMesh.interactionHandler.on('click', (e: ThreeMouseEvent<string>) => {
 *   console.log(`Event type: ${e.type}`); // 'click'
 *   console.log(`Selected: ${e.isSelected}`); // boolean or undefined
 *   console.log(`Handler: ${e.interactionHandler?.value}`); // associated value
 * });
 *
 * // All event types work with touch and pen input
 * clickableMesh.interactionHandler.on('over', (e) => {
 *   console.log('Pointer entered:', e.type); // Works with mouse hover or touch proximity
 * });
 * ```
 */

import type { ButtonInteractionHandler } from "./index.js";

/**
 * Event map interface used internally by ButtonInteractionHandler for EventEmitter3 type safety.
 *
 * This interface defines the event types that ButtonInteractionHandler can emit. It is used
 * as the generic parameter for EventEmitter3 to provide compile-time type checking for
 * event names and handler signatures. **Not intended for direct user inheritance**.
 *
 * **Pointer Support**: All events work with mouse, touch, and pen input devices
 * through the PointerEvent API, providing consistent behavior across input methods.
 *
 * @template T - The type of value associated with the interactive object
 *
 * @example
 * ```typescript
 * // Used internally by ButtonInteractionHandler:
 * // class ButtonInteractionHandler<Value> extends EventEmitter<ThreeMouseEventMap<Value>>
 *
 * // Users interact with events through the handler, not this interface directly:
 * import { ClickableMesh } from '@masatomakino/threejs-interactive-object';
 *
 * const clickableMesh = new ClickableMesh();
 * clickableMesh.interactionHandler.on('click', (e) => {
 *   console.log('Clicked!', e.interactionHandler?.value);
 * });
 * ```
 *
 * @internal This interface is primarily for internal type system use
 */
export interface ThreeMouseEventMap<T = unknown> {
  /** Fired when the object is clicked/tapped (after pointerdown and pointerup sequence) */
  click: (e: ThreeMouseEvent<T>) => void;
  /** Fired when the pointer enters the object bounds (mouse hover, touch proximity) */
  over: (e: ThreeMouseEvent<T>) => void;
  /** Fired when the pointer leaves the object bounds */
  out: (e: ThreeMouseEvent<T>) => void;
  /** Fired when a pointer button/finger is pressed down over the object */
  down: (e: ThreeMouseEvent<T>) => void;
  /** Fired when a pointer button/finger is released over the object */
  up: (e: ThreeMouseEvent<T>) => void;
  /** Fired when the object's selection state changes (checkboxes, radio buttons) */
  select: (e: ThreeMouseEvent<T>) => void;
}

/**
 * Event object passed to all pointer interaction event handlers.
 *
 * This interface defines the standardized event payload that all interactive objects
 * emit. It provides access to the event type, the interaction handler that generated
 * the event, and selection state information when applicable.
 *
 * **Cross-Platform Support**: These events work consistently across all pointer input
 * types (mouse, touch, pen) thanks to the underlying PointerEvent implementation.
 *
 * @template Value - The type of value associated with the interactive object's handler
 *
 * @example
 * ```typescript
 * import type { ThreeMouseEvent } from '@masatomakino/threejs-interactive-object';
 *
 * function handlePointerInteraction(e: ThreeMouseEvent<string>) {
 *   // Event type is always available
 *   console.log(`Event: ${e.type}`); // 'click', 'over', 'select', etc.
 *
 *   // Pointer ID for multitouch support
 *   console.log(`Pointer ID: ${e.pointerId}`); // 1 (default), 2, 3, etc.
 *
 *   // Access to the interaction handler (if available)
 *   if (e.interactionHandler) {
 *     console.log(`Value: ${e.interactionHandler.value}`);
 *     console.log(`Enabled: ${e.interactionHandler.enabled}`);
 *   }
 *
 *   // Selection state (for checkboxes and radio buttons)
 *   if (e.isSelected !== undefined) {
 *     console.log(`Selected: ${e.isSelected}`);
 *   }
 * }
 *
 * // Works for mouse clicks, touch taps, and pen interactions
 * clickableMesh.interactionHandler.on('click', handlePointerInteraction);
 * ```
 *
 * @remarks
 * - All properties are readonly to prevent accidental modification
 * - `interactionHandler` may be undefined in some contexts
 * - `isSelected` is only meaningful for checkbox and radio button events
 * - `pointerId` defaults to 1 for single-pointer interactions
 * - The event object is created by ThreeMouseEventUtil.generate()
 * - Despite the "Mouse" naming, supports all pointer input types (mouse, touch, pen)
 *
 * @see {@link ThreeMouseEventMap} - Available event types
 * @see {@link ButtonInteractionHandler} - Source of interaction events
 * @see {@link ThreeMouseEventUtil} - Utility for creating event objects
 */
export interface ThreeMouseEvent<Value> {
  /** The type of pointer event that occurred */
  readonly type: keyof ThreeMouseEventMap<Value>;
  /** The interaction handler that generated this event (may be undefined) */
  readonly interactionHandler?: ButtonInteractionHandler<Value>;
  /** Selection state for checkbox/radio button events (undefined for basic buttons) */
  readonly isSelected?: boolean;
  /** Pointer identifier for multitouch support (defaults to 1 for primary pointer) */
  readonly pointerId: number;
}
