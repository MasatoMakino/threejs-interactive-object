/**
 * @fileoverview ThreeMouseEvent utility functions for event creation and manipulation.
 *
 * This module provides utility functions for creating, cloning, and manipulating
 * ThreeMouseEvent objects within the pointer interaction system. These utilities
 * handle event object construction and selection state management.
 */

import type { IClickableObject3D } from "./index.js";
import type { ButtonInteractionHandler } from "./interactionHandler";
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
 * @deprecated This function was not intended for public export and may be made
 *   private in future versions.
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
  return handlerOrView;
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
 * @deprecated This function was not intended for public export and may be made
 *   private in future versions.
 */
export function getSelection<Value>(
  interactionHandler: ButtonInteractionHandler<Value> | undefined,
): boolean {
  if (interactionHandler != null && "selection" in interactionHandler) {
    return !!interactionHandler.selection;
  } else {
    throw new Error(
      "Cannot get selection state from non-selectable handler. Selection state requires handlers implementing ISelectableObject3D interface.",
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
 *
 * @param type - Event type from ThreeMouseEventMap (click, down, up, over, out,
 *   select)
 * @param handlerOrView - Source handler or interactive view object for the
 *   event
 * @returns Fully populated ThreeMouseEvent object
 *
 * @example
 * ```typescript
 * // Generate click event from button
 * const clickEvent = generate("click", button.interactionHandler);
 * console.log(clickEvent.type); // "click"
 * console.log(clickEvent.isSelected); // undefined
 *
 * // Generate select event from checkbox
 * const selectEvent = generate("select", checkbox);
 * console.log(selectEvent.type); // "select"
 * console.log(selectEvent.isSelected); // true/false
 * ```
 *
 * @see {@link ThreeMouseEvent} - Event object structure
 * @see {@link ButtonInteractionHandler} - Handler base class
 */
export function generate<Value>(
  type: keyof ThreeMouseEventMap<Value>,
  handlerOrView:
    | ButtonInteractionHandler<Value>
    | IClickableObject3D<Value>
    | undefined,
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
  };
}

/**
 * Creates a copy of an existing ThreeMouseEvent.
 *
 * @description
 * Clones a ThreeMouseEvent by regenerating it using the original event's type
 * and interaction handler. Selection state is recalculated from current
 * handler state, which may differ from the original if selection changed.
 *
 * @param e - The ThreeMouseEvent to clone
 * @returns New ThreeMouseEvent with the same type and handler reference
 *
 * @example
 * ```typescript
 * const originalEvent = generate("select", checkbox);
 * const clonedEvent = clone(originalEvent);
 *
 * // Events have same structure but selection state reflects current handler
 * // state
 * console.log(originalEvent.type === clonedEvent.type); // true
 * console.log(originalEvent.interactionHandler === clonedEvent.interactionHandler);
 * // true
 * ```
 *
 * @see {@link generate} - Primary event creation function
 */
export function clone<Value>(
  e: ThreeMouseEvent<Value>,
): ThreeMouseEvent<Value> {
  return generate(e.type, e.interactionHandler);
}
