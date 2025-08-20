/**
 * @fileoverview PointerEvent test utility functions with default pointerId support.
 *
 * This module provides wrapper functions around PointerEvent construction and fake-mouse-event
 * library to ensure consistent pointerId handling across all test files. All wrapper functions
 * default pointerId to 1, preparing for multitouch support while maintaining backward compatibility.
 *
 * **Purpose**: Centralize PointerEvent creation logic to facilitate future removal of fake-mouse-event
 * dependency and establish consistent pointerId usage across the test suite.
 */

import { getPointerEvent } from "@masatomakino/fake-mouse-event";

/**
 * Creates a PointerEvent with default pointerId of 1
 *
 * @description
 * Wrapper around native PointerEvent constructor that ensures pointerId is always set.
 * Provides a consistent API for creating PointerEvents in tests while preparing for
 * multitouch support.
 *
 * @param type - PointerEvent type (e.g., 'pointermove', 'pointerdown', 'pointerup')
 * @param eventInitDict - PointerEvent initialization options
 * @param pointerId - Pointer identifier (defaults to 1 for primary pointer)
 * @returns PointerEvent with guaranteed pointerId
 *
 * @example
 * ```typescript
 * // Create pointer move event with default pointerId = 1
 * const moveEvent = createPointerEventWithId("pointermove", {
 *   clientX: 100,
 *   clientY: 200
 * });
 *
 * // Create pointer down event with custom pointerId
 * const touchEvent = createPointerEventWithId("pointerdown", {
 *   clientX: 50,
 *   clientY: 75
 * }, 2);
 * ```
 */
export function createPointerEventWithId(
  type: string,
  eventInitDict: PointerEventInit = {},
  pointerId: number = 1,
): PointerEvent {
  return new PointerEvent(type, {
    ...eventInitDict,
    pointerId,
  });
}

/**
 * Creates a fake PointerEvent with default pointerId of 1
 *
 * @description
 * Wrapper around @masatomakino/fake-mouse-event's getPointerEvent function
 * that ensures pointerId is consistently set. The fake-mouse-event library
 * supports pointerId in the constructor, so we pass it directly.
 *
 * @param type - Pointer event type
 * @param coords - Coordinate and event properties (includes pointerId support)
 * @param pointerId - Pointer identifier (defaults to 1 for primary pointer)
 * @returns Fake PointerEvent with guaranteed pointerId
 *
 * @example
 * ```typescript
 * // Create fake pointer event with default pointerId
 * const fakeEvent = createFakePointerEventWithId("pointermove", {
 *   offsetX: 100,
 *   offsetY: 200
 * });
 *
 * // Create fake touch event with custom pointerId
 * const fakeTouchEvent = createFakePointerEventWithId("pointerdown", {
 *   offsetX: 50,
 *   offsetY: 75
 * }, 2);
 * ```
 */
export function createFakePointerEventWithId(
  type: string,
  coords: Parameters<typeof getPointerEvent>[1] = {},
  pointerId: number = 1,
): PointerEvent {
  return getPointerEvent(type, {
    ...coords,
    pointerId,
  }) as unknown as PointerEvent;
}
