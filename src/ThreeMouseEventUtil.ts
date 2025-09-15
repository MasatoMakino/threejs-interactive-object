/**
 * @packageDocumentation
 * @fileoverview ThreeMouseEvent utility functions for event creation and manipulation.
 *
 * This module provides utility functions for creating, cloning, and manipulating
 * ThreeMouseEvent objects within the pointer interaction system. These utilities
 * handle event object construction and selection state management.
 */

import type { ButtonInteractionHandler } from "./interactionHandler";
import type { IClickableObject3D } from "./MouseEventManager.js";
import type { ThreeMouseEvent, ThreeMouseEventMap } from "./ThreeMouseEvent.js";

/**
 * Extracts the interaction handler from either a handler instance or interactive
 * view object.
 *
 * @description
 * Internal utility that normalizes input to always return a
 * ButtonInteractionHandler.
 * Interactive view objects contain a handler via the interactionHandler property.
 * Originally designed as internal helper for the generate function.
 *
 * @param handlerOrView - Either a ButtonInteractionHandler or an interactive
 *   view object
 * @returns The ButtonInteractionHandler instance or undefined if input is
 *   null/undefined
 *
 * @internal
 */
function getInteractionHandler<Value>(
  handlerOrView:
    | ButtonInteractionHandler<Value>
    | IClickableObject3D<Value>
    | undefined,
): ButtonInteractionHandler<Value> | undefined {
  if (handlerOrView != null && "interactionHandler" in handlerOrView) {
    return handlerOrView.interactionHandler;
  }
  return handlerOrView as ButtonInteractionHandler<Value> | undefined;
}

/**
 * Retrieves the selection state from a selectable interaction handler.
 *
 * @description
 * Extracts boolean selection state from handlers that support selection
 * (CheckBoxInteractionHandler, RadioButtonInteractionHandler). Used
 * specifically
 * for "select" event types to populate the isSelected property. Originally
 * designed
 * as internal helper for the generate function.
 *
 * @param interactionHandler - The interaction handler to check for selection state
 * @returns Boolean selection state of the handler
 * @throws Error if handler doesn't support selection (missing selection
 *   property)
 *
 * @example
 * ```typescript
 * // Used internally during select event generation
 * const checkbox = new CheckBoxMesh(geometry, materials);
 * const isSelected = getSelection(checkbox.interactionHandler); // true/false
 * ```
 *
 * @internal
 */
function getSelection<Value>(
  interactionHandler: ButtonInteractionHandler<Value> | undefined,
): boolean {
  if (interactionHandler != null && "selection" in interactionHandler) {
    return !!interactionHandler.selection;
  } else {
    throw new Error(
      "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。",
    );
  }
}

/**
 * Creates a ThreeMouseEvent with the specified type and source.
 *
 * @description
 * Primary factory function for creating ThreeMouseEvent objects. Automatically
 * populates the isSelected property for "select" events by querying handler
 * selection state. For other event types, isSelected remains undefined.
 * The pointerId defaults to 1 for backward compatibility.
 *
 * @param type - Event type from ThreeMouseEventMap (click, down, up, over, out,
 *   select)
 * @param handlerOrView - Source handler or interactive view object for the
 *   event
 * @param pointerId - Pointer identifier for multitouch support (defaults to 1)
 * @returns Fully populated ThreeMouseEvent object
 *
 * @example
 * ```typescript
 * // Create click event from button (default pointerId = 1)
 * const clickEvent = createThreeMouseEvent("click", button.interactionHandler);
 * console.log(clickEvent.type); // "click"
 * console.log(clickEvent.pointerId); // 1
 * console.log(clickEvent.isSelected); // undefined
 *
 * // Create select event from checkbox with custom pointerId
 * const selectEvent = createThreeMouseEvent("select", checkbox, 2);
 * console.log(selectEvent.type); // "select"
 * console.log(selectEvent.pointerId); // 2
 * console.log(selectEvent.isSelected); // true/false
 * ```
 *
 * @see {@link ThreeMouseEvent} - Event object structure
 * @see {@link ButtonInteractionHandler} - Handler base class
 */
export function createThreeMouseEvent<Value>(
  type: keyof ThreeMouseEventMap<Value>,
  handlerOrView:
    | ButtonInteractionHandler<Value>
    | IClickableObject3D<Value>
    | undefined,
  pointerId: number = 1,
): ThreeMouseEvent<Value> {
  const interactionHandler = getInteractionHandler(handlerOrView);
  const getSelectionValue = () => {
    if (type === "select") {
      return getSelection(interactionHandler);
    }
    return undefined;
  };

  return {
    type,
    interactionHandler,
    isSelected: getSelectionValue(),
    pointerId,
  };
}

/**
 * Creates a copy of an existing ThreeMouseEvent.
 *
 * @description
 * Clones a ThreeMouseEvent by regenerating it using the original event's type,
 * interaction handler, and pointerId. Selection state is recalculated from current
 * handler state, which may differ from the original if selection changed.
 *
 * @param e - The ThreeMouseEvent to clone
 * @returns New ThreeMouseEvent with the same type, handler reference, and pointerId
 *
 * @example
 * ```typescript
 * const originalEvent = createThreeMouseEvent("select", checkbox, 2);
 * const clonedEvent = cloneThreeMouseEvent(originalEvent);
 *
 * // Events have same structure but selection state reflects current handler
 * // state
 * console.log(originalEvent.type === clonedEvent.type); // true
 * console.log(originalEvent.pointerId === clonedEvent.pointerId); // true
 * console.log(originalEvent.interactionHandler === clonedEvent.interactionHandler);
 * // true
 * ```
 *
 * @see {@link createThreeMouseEvent} - Primary event creation function
 */
export function cloneThreeMouseEvent<Value>(
  e: ThreeMouseEvent<Value>,
): ThreeMouseEvent<Value> {
  return createThreeMouseEvent(e.type, e.interactionHandler, e.pointerId);
}

/**
 * @deprecated Use createThreeMouseEvent instead.
 */
export function generate<Value>(
  type: keyof ThreeMouseEventMap<Value>,
  handlerOrView:
    | ButtonInteractionHandler<Value>
    | IClickableObject3D<Value>
    | undefined,
  pointerId: number = 1,
): ThreeMouseEvent<Value> {
  return createThreeMouseEvent(type, handlerOrView, pointerId);
}

/**
 * @deprecated Use cloneThreeMouseEvent instead.
 */
export function clone<Value>(
  e: ThreeMouseEvent<Value>,
): ThreeMouseEvent<Value> {
  return cloneThreeMouseEvent(e);
}

/**
 * @deprecated Use named exports directly from "@masatomakino/threejs-interactive-object" instead.
 */
export const ThreeMouseEventUtil = {
  /** @deprecated Not intended for external use. Use createThreeMouseEvent with interactive objects directly. */
  getInteractionHandler,
  /** @deprecated Not intended for external use. Use handler.selection property directly. */
  getSelection,
  generate: createThreeMouseEvent,
  clone: cloneThreeMouseEvent,
};
